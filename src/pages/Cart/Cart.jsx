import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";

import "./Cart.css";

const Cart = () => {
  const { cartItems, handleQuantityChange, handleRemoveItem, totalItems } =
    useCart();
  const { isAuthenticated } = useAuth(); // Adicionado 'token' do contexto de autenticação
  const navigate = useNavigate();
  const location = useLocation();
  const [cep, setCep] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = `${value.substring(0, 5)}-${value.substring(5, 8)}`;
    }
    setCep(value);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location },
      });
      return;
    }
    navigate("/checkout");
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.originalPrice * item.quantity,
    0
  );
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
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-3 p-3 p-md-4 mb-4">
              <h2 className="h5 fw-bold mb-4 font-brand">
                Meu Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-shopping-bag fs-1 text-muted mb-3"></i>
                  <p className="text-muted">Seu carrinho está vazio.</p>
                  <button onClick={() => navigate('/collections')} className="btn btn-dark rounded-pill px-4">
                    Começar a comprar
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="cart-item-row d-flex border-bottom py-3 position-relative align-items-start"
                  >
                    {/* Imagem */}
                    <div className="flex-shrink-0 me-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    </div>

                    {/* Detalhes */}
                    <div className="flex-grow-1 cart-item-details">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h3 className="h6 fw-bold mb-1 text-dark">{item.name}</h3>
                          <p className="small text-muted mb-2">
                            {item.size} | {item.color}
                          </p>
                        </div>
                        {/* Preço (Mobile/Desktop) */}
                        <div className="text-end d-none d-sm-block">
                           <span className="fw-bold text-dark d-block">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                             {item.quantity > 1 && (
                                <small className="text-muted">
                                  {formatCurrency(item.price)} cada
                                </small>
                             )}
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-2">
                         {/* Controles de Quantidade */}
                        <div className="input-group input-group-sm cart-quantity-control">
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
                            className="form-control text-center border-secondary"
                            value={item.quantity}
                            readOnly
                            style={{ maxWidth: '40px' }}
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

                        {/* Preço (Mobile only) */}
                        <div className="d-block d-sm-none">
                           <span className="fw-bold text-dark">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                        </div>

                         {/* Botão Remover */}
                        <button
                            onClick={() =>
                                handleRemoveItem(item.id, item.color, item.size)
                            }
                            className="btn btn-link cart-remove-btn p-2"
                            title="Remover item"
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* <div className="card shadow-sm p-4">
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
            </div> */}
          </div>

          {/* Resumo do Pedido */}
          <div className="col-lg-4">
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
                  <span className="fw-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Descontos</span>
                    <span className="text-success">
                      - {formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Frete</span>
                  <span className="fw-medium text-success">Grátis</span>
                </div>
                <div className="border-top pt-2 mt-2 d-flex justify-content-between">
                  <span className="text-muted">Total</span>
                  <span className="fw-bold fs-5">{formatCurrency(total)}</span>
                </div>
              </div>

               {/* Cupom de Desconto (Movido para cá) */}
               <div className="mb-4">
                <label htmlFor="cupom" className="form-label small fw-bold text-muted">Cupom de desconto</label>
                <div className="input-group">
                    <input
                    id="cupom"
                    type="text"
                    className="form-control"
                    placeholder="Digite seu cupom"
                    />
                    <button className="btn btn-outline-primary" type="button">
                    Aplicar
                    </button>
                </div>
               </div>

              <button
                className="btn btn-primary w-100 fw-bold py-2 mb-3"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
              Finalizar a compra
              </button>

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
                <div className="d-flex gap-2 mb-3">
                  <i className="fas fa-lock text-success mt-1 me-2"></i>
                  <div>
                    <h3 className="fw-bold h6">Compra segura</h3>
                    <p className="small text-muted mb-0">
                      Seus dados estão protegidos
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2 mb-3">
                  <i className="fas fa-truck text-warning mt-1 me-2"></i>
                  <div>
                    <h3 className="fw-bold h6">Entrega garantida</h3>
                    <p className="small text-muted mb-0">
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
