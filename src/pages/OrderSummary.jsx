import React from "react";
import { useCart } from "../Context/CartContext";

const OrderSummary = ({
  paymentDiscount = 0,
  paymentMethodLabel = "",
  finalTotal,
}) => {
  const { cartItems, subtotal, discount, total, frete } = useCart();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <>
      <h2 className="checkout-summary__title">Resumo do Pedido</h2>

      {/* Product List */}
      <div style={{ marginBottom: "1rem" }}>
        {cartItems.map((item) => (
          <div
            key={`${item.id}-${item.color}-${item.size}`}
            className="checkout-summary-item"
          >
            <img
              className="checkout-summary-item__img"
              src={item.image}
              alt={item.name}
            />
            <div style={{ minWidth: 0 }}>
              <p className="checkout-summary-item__name">{item.name}</p>
              <p className="checkout-summary-item__meta">
                {item.quantity}× {formatCurrency(item.price)}
                {item.color && ` • ${item.color}`}
                {item.size && ` • ${item.size}`}
              </p>
            </div>
            <span className="checkout-summary-item__price">
              {formatCurrency(item.quantity * item.price)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "12px" }}>
        <div className="checkout-summary__row">
          <span className="text-muted">Subtotal</span>
          <span className="fw-medium">{formatCurrency(subtotal || 0)}</span>
        </div>

        {discount > 0 && (
          <div className="checkout-summary__row">
            <span className="text-muted">Descontos</span>
            <span className="text-success fw-medium">
              - {formatCurrency(discount || 0)}
            </span>
          </div>
        )}

        {frete > 0 && (
          <div className="checkout-summary__row">
            <span className="text-muted">Frete</span>
            <span className="fw-medium">{formatCurrency(frete || 0)}</span>
          </div>
        )}

        {paymentDiscount > 0 && (
          <div className="checkout-summary__row">
            <span className="text-muted">
              {paymentMethodLabel || "Desconto"}
            </span>
            <span className="text-success fw-medium">
              - {formatCurrency(paymentDiscount)}
            </span>
          </div>
        )}

        <div className="checkout-summary__total">
          <span className="checkout-summary__total-label">Total</span>
          <span className="checkout-summary__total-value">
            {formatCurrency(finalTotal != null ? finalTotal : total || 0)}
          </span>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;