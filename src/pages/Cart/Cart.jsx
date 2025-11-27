import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";

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
                    className="d-flex flex-column flex-sm-row border-bottom pb-4 mb-4 position-relative align-items-center"
                  >
                    {/* Lado Esquerdo: Imagem + Informações */}
                    <div className="d-flex flex-grow-1 align-items-center w-100">
                        <div className="flex-shrink-0 me-3">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="rounded"
                            style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            }}
                        />
                        </div>
                        <div className="flex-grow-1">
                            <h3 className="h6 fw-bold mb-1">{item.name}</h3>
                            <p className="small text-muted mb-1">
                                Tamanho: {item.size} | Cor: {item.color}
                            </p>
                            <div className="d-flex align-items-center gap-2">
                                {item.originalPrice && (
                                    <span className="text-muted text-decoration-line-through small">
                                    {formatCurrency(item.originalPrice)}
                                    </span>
                                )}
                                <span className="fw-bold text-primary">
                                    {formatCurrency(item.price)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Lado Direito: Ações (Lixeira e Quantidade) */}
                    <div className="d-flex flex-column align-items-end justify-content-between mt-3 mt-sm-0" style={{ minHeight: '100px' }}>
                        {/* Botão de Excluir (Lixeira Vermelha) */}
                        <button
                            onClick={() =>
                                handleRemoveItem(item.id, item.color, item.size)
                            }
                            className="btn btn-link text-danger p-0 mb-auto"
                            title="Remover item"
                        >
                            <i className="fas fa-trash-alt fs-5"></i>
                        </button>

                        {/* Controles de Quantidade */}
                        <div
                          className="input-group input-group-sm"
                          style={{ width: "100px" }}
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
