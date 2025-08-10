import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/authContext";

const Cart = () => {
  const { cartItems, handleQuantityChange, handleRemoveItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navegate = useNavigate();
  const location = useLocation();
  const [cep, setCep] = useState("");

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = `${value.substring(0, 5)}-${value.substring(5, 8)}`;
    }
    setCep(value);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navegate("/checkout"); // Redireciona para a página de checkout caso o usuario esteja logado
    } else {
      navegate("/login", {
        state: { from: location },
      });
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.originalPrice * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const discount = cartItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);
  const total = subtotal - discount; // Assumindo que o frete é grátis por enquanto.

  const paymentMethods = [
    // { icon: "fab fa-cc-visa", label: "Visa" },
    // { icon: "fab fa-cc-mastercard", label: "Mastercard" },
    // { icon: "fab fa-cc-amex", label: "American Express" },
    // { icon: "fab fa-cc-paypal", label: "PayPal" },
    // { icon: "fas fa-barcode", label: "Boleto" },
    { icon: "fa-brands fa-pix ", label: "Pix" },
    { icon: "fas fa-credit-card", label: "Cartão de Crédito" }, // Verifique se este ícone está disponível
  ];

  return (
    <>
      <main className="container py-4" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="row g-4">
          {/* Itens do Carrinho */}
          <div className="col-lg-7">
            <div className="card shadow-sm p-4 mb-4">
              <h2 className="h4 fw-bold mb-4">
                Meu Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"}
                )
              </h2>

              {cartItems.length === 0 ? (
                <p>Seu carrinho está vazio.</p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="d-flex flex-column flex-sm-row border-bottom pb-4 mb-4 position-relative"
                  >
                    <div className="flex-shrink-0 mb-3 mb-sm-0 me-sm-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h3 className="h6 fw-medium">{item.name}</h3>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.id, item.color, item.size)
                          }
                          className="btn-close d-none d-sm-block"
                          aria-label="Remover item"
                        ></button>
                      </div>
                      <p className="small text-muted mb-1">
                        Tamanho: {item.size}
                      </p>
                      <p className="small text-muted mb-3">Cor: {item.color}</p>

                      <div className="d-flex flex-wrap align-items-center justify-content-between">
                        <div
                          className="input-group mb-2 mb-sm-0"
                          style={{ maxWidth: "120px" }}
                        >
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.color,
                                item.size,
                                -1
                              )
                            }
                          >
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            value={item.quantity}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.color,
                                item.size,
                                1
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="text-end">
                          {item.originalPrice && (
                            <p className="text-muted text-decoration-line-through small">
                              R${" "}
                              {item.originalPrice.toFixed(2).replace(".", ",")}
                            </p>
                          )}
                          <p className="text-primary fw-bold fs-5 mb-0">
                            R$ {item.price.toFixed(2).replace(".", ",")}
                          </p>
                          {item.price && (
                            <p className="text-success small">
                              Economize R${" "}
                              {(item.originalPrice - item.price)
                                .toFixed(2)
                                .replace(".", ",")}
                            </p>
                          )}
                          {item.installments && (
                            <p className="text-success small">
                              {item.installments}
                            </p>
                          )}
                          {item.shippingNote && (
                            <p className="text-success small">
                              {item.shippingNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleRemoveItem(item.id, item.color, item.size)
                      }
                      className="btn-close d-sm-none position-absolute top-0 end-0 mt-2 me-2"
                      aria-label="Remover item"
                    ></button>
                  </div>
                ))
              )}
            </div>

            {/* Cupom e Frete */}
            <div className="card shadow-sm p-4 mb-4">
              <h3 className="h5 fw-bold mb-3">Cupom de desconto</h3>
              <div className="input-group realative">
                <input
                  id="cupom"
                  type="text"
                  className="form-control"
                  placeholder="Digite seu cupom"
                />

                <button className="btn btn-primary" type="button">
                  Aplicar
                </button>
              </div>
            </div>

            <div className="card shadow-sm p-4">
              <h3 className="h5 fw-bold mb-3">Calcular frete e prazo</h3>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="CEP"
                  maxLength="9"
                  value={cep}
                  onChange={handleCepChange}
                />
                <button className="btn btn-primary" type="button">
                  Calcular
                </button>
              </div>
              <p className="small text-muted">
                Frete grátis para compras acima de R$ 199,00
              </p>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="col-lg-5">
            <div
              className="card shadow-sm p-4 position-sticky"
              style={{ top: "1rem" }}
            >
              <h2 className="h4 fw-bold mb-4">Resumo do Pedido</h2>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"}
                    )
                  </span>
                  <span className="fw-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Descontos</span>
                    <span className="text-success">
                      - R$ {discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Frete</span>
                  <span className="text-success">Grátis</span>
                </div>
                <div className="border-top pt-2 mt-2 d-flex justify-content-between">
                  <span className="text-muted">Total</span>
                  <span className="fw-bold fs-5">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary w-100 fw-bold py-2 mb-3"
                onClick={handleCheckout}
              >
                Finalizar Compra
              </button>

              {/* <div className="text-center small text-muted mb-3">
                <p className="mb-0">ou</p>
              </div>

              <button className="btn btn-outline-secondary w-100 fw-bold py-2 mb-4 d-flex align-items-center justify-content-center">
                <i className="fab fa-google-pay me-2 fs-4"></i>
                <span>Pagar com Google Pay</span>
              </button> */}

              <div className="border-top pt-4">
                <h3 className="h6 fw-bold mb-2">Formas de pagamento</h3>
                <div className="row row-cols-2 g-2 mb-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.label}
                      className="payment-icon-bg p-2 rounded d-flex align-items-center justify-content-center"
                      title={method.label}
                    >
                      <i className={`${method.icon} fs-4`}></i>
                    </div>
                  ))}
                </div>
                <p className="small text-muted">Até 10x sem juros no cartão</p>
              </div>
              {/* <!-- Security Info --> */}
              <div className="bg-white rounded-lg mt-3 border-top pt-4">
                <div className="d-flex gap-2  mb-3">
                  <i className="fas fa-lock text-green-500 mt-1 mr-2"></i>
                  <div>
                    <h3 className="font-bold">Compra segura</h3>
                    <p className="text-sm text-gray-600">
                      Seus dados estão protegidos
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2  mb-3">
                  <i className="fas fa-truck text-orange-500 mt-1 mr-2"></i>
                  <div>
                    <h3 className="font-bold">Entrega garantida</h3>
                    <p className="text-sm text-gray-600">
                      Ou seu dinheiro de volta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Cart;
