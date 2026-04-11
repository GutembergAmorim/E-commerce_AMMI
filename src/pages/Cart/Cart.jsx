import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import api from "../../services/api";
import "./Cart.css";

const Cart = () => {
  const { cartItems, handleQuantityChange, handleRemoveItem, frete } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null); // { code, discount, discountType, discountValue, description }
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    // Pass coupon info to checkout via state
    navigate("/checkout", {
      state: couponData ? { coupon: couponData } : undefined,
    });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const productDiscount = cartItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  // Calculate coupon discount
  const couponDiscount = couponData ? couponData.discount : 0;
  const total = subtotal - productDiscount - couponDiscount + frete;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");
    setCouponData(null);

    try {
      const res = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        orderTotal: subtotal - productDiscount,
        userId: user?._id || user?.id || null,
      });

      if (res.data.success) {
        setCouponData(res.data.data);
        setCouponError("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao validar cupom";
      setCouponError(msg);
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponCode("");
    setCouponError("");
  };

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

            {productDiscount > 0 && (
              <div className="cart-summary__row">
                <span className="text-muted">Descontos</span>
                <span className="text-success fw-medium">- {formatCurrency(productDiscount)}</span>
              </div>
            )}

            {couponData && (
              <div className="cart-summary__row">
                <span className="text-muted d-flex align-items-center gap-1">
                  Cupom ({couponData.code})
                  <button
                    onClick={handleRemoveCoupon}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}
                    title="Remover cupom"
                  >
                    <X size={14} />
                  </button>
                </span>
                <span className="text-success fw-medium">- {formatCurrency(couponDiscount)}</span>
              </div>
            )}

            <div className="cart-summary__row">
              {frete === 0 ? (
                <>
                  <span className="text-success">Frete Grátis</span>
                  <span className="fw-medium text-success">{formatCurrency(0)}</span>
                </>
              ) : (
                <>
                  <span className="text-muted">Frete</span>
                  <span className="fw-medium text-success">{formatCurrency(frete)}</span>
                </>
              )}
            </div>

            {/* Total highlight */}
            <div className="cart-summary__total">
              <span className="cart-summary__total-label">Total</span>
              <span className="cart-summary__total-value">{formatCurrency(total)}</span>
            </div>

            {/* Coupon */}
            <div className="cart-coupon">
              {couponData ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: '#f0fdf4', borderRadius: 10,
                  border: '1px solid #bbf7d0', width: '100%',
                }}>
                  <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                  <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                    Cupom {couponData.code} aplicado!
                    {couponData.discountType === 'percentage'
                      ? ` (${couponData.discountValue}% off)`
                      : ` (R$ ${couponData.discountValue.toFixed(2)} off)`}
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    className="cart-coupon__input"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                  />
                  <button
                    className="cart-coupon__btn"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </>
              )}
            </div>
            {couponError && (
              <p style={{ fontSize: '0.78rem', color: '#dc2626', margin: '4px 0 0', fontWeight: 500 }}>
                {couponError}
              </p>
            )}

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
            <p className="small text-muted mt-1 mb-0">Até 3x sem juros no cartão</p>

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
