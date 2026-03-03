import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const { cartItems, handleQuantityChange, handleRemoveItem, frete } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    navigate("/checkout");
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = cartItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);
  const total = subtotal - discount + frete;

  const paymentMethods = [
    { icon: "fa-brands fa-pix", label: "Pix" },
    { icon: "fas fa-credit-card", label: "Cartão" },
  ];

  return (
    <main className="container py-4">
      <div className="row g-4">
        {/* ---- Left: Cart Items ---- */}
        <div className="col-lg-8">
          <Link to="/collections" className="cart-continue">
            <ArrowLeft size={16} />
            Continuar comprando
          </Link>

          <div className="cart-card">
            <h2 className="cart-card__title">
              Meu Carrinho ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"})
            </h2>

            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty__icon">
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <p className="cart-empty__text">Seu carrinho está vazio.</p>
                <button
                  onClick={() => navigate("/collections")}
                  className="btn btn-dark rounded-pill px-4"
                >
                  Começar a comprar
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="cart-item-row">
                  {/* Image */}
                  <img src={item.image} alt={item.name} className="cart-item-image" />

                  {/* Details */}
                  <div className="cart-item-details">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-meta">
                      {item.size} • {item.color}
                    </p>

                    <div className="d-flex align-items-center justify-content-between mt-2">
                      {/* Quantity */}
                      <div className="cart-qty">
                        <button
                          className="cart-qty__btn"
                          onClick={() => handleQuantityChange(item.id, item.color, item.size, -1)}
                        >
                          −
                        </button>
                        <span className="cart-qty__value">{item.quantity}</span>
                        <button
                          className="cart-qty__btn"
                          onClick={() => handleQuantityChange(item.id, item.color, item.size, 1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="cart-item-price">
                        <p className="cart-item-price__main">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="cart-item-price__unit">
                            {formatCurrency(item.price)} cada
                          </p>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.color, item.size)}
                        className="cart-remove-btn"
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
        </div>

        {/* ---- Right: Summary ---- */}
        <div className="col-lg-4">
          <div className="cart-summary">
            <h2 className="cart-summary__title">Resumo do Pedido</h2>

            {/* Lines */}
            <div className="cart-summary__row">
              <span className="text-muted">
                Subtotal ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"})
              </span>
              <span className="fw-medium">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="cart-summary__row">
                <span className="text-muted">Descontos</span>
                <span className="text-success fw-medium">- {formatCurrency(discount)}</span>
              </div>
            )}

            <div className="cart-summary__row">
              <span className="text-muted">Frete</span>
              <span className="fw-medium text-success">{formatCurrency(frete)}</span>
            </div>

            {/* Total highlight */}
            <div className="cart-summary__total">
              <span className="cart-summary__total-label">Total</span>
              <span className="cart-summary__total-value">{formatCurrency(total)}</span>
            </div>

            {/* Coupon */}
            <div className="cart-coupon">
              <input
                type="text"
                placeholder="Cupom de desconto"
                className="cart-coupon__input"
              />
              <button className="cart-coupon__btn">Aplicar</button>
            </div>

            {/* Checkout Button */}
            <button
              className="btn btn-dark w-100 fw-bold py-2 rounded-pill mt-3"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Finalizar Compra
            </button>

            {/* Payment Methods */}
            <div className="cart-payment">
              {paymentMethods.map((method) => (
                <div key={method.label} className="cart-payment__icon" title={method.label}>
                  <i className={method.icon}></i>
                </div>
              ))}
            </div>
            <p className="small text-muted mt-1 mb-0">Até 10x sem juros no cartão</p>

            {/* Trust Badges */}
            <div className="cart-trust">
              <div className="cart-trust__item">
                <div className="cart-trust__icon cart-trust__icon--green">
                  <i className="fas fa-lock"></i>
                </div>
                <div className="cart-trust__text">
                  <strong>Compra segura</strong>
                  <span>Dados protegidos com criptografia</span>
                </div>
              </div>
              <div className="cart-trust__item">
                <div className="cart-trust__icon cart-trust__icon--amber">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="cart-trust__text">
                  <strong>Entrega garantida</strong>
                  <span>Ou seu dinheiro de volta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
