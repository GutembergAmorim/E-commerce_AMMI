import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CartToast.css";

const CartToast = ({ show, onClose, product }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!show) {
      setExiting(false);
      return;
    }

    // Auto-dismiss after 3.5s
    const timer = setTimeout(() => {
      handleClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [show]);

  const handleClose = () => {
    setExiting(true);
    // Wait for exit animation to finish before actually hiding
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, 300);
  };

  if (!show && !exiting) return null;

  return (
    <div className="cart-toast-overlay">
      <div className={`cart-toast ${exiting ? "toast-exit" : ""}`}>
        {/* Close button */}
        <button className="cart-toast__close" onClick={handleClose} aria-label="Fechar">
          ×
        </button>

        {/* Product thumbnail */}
        {product?.image && (
          <img
            src={product.image}
            alt={product.name}
            className="cart-toast__image"
          />
        )}

        {/* Info */}
        <div className="cart-toast__info">
          <p className="cart-toast__title">
            <span className="cart-toast__check">
              <svg viewBox="0 0 12 12">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </span>
            Adicionado ao carrinho
          </p>
          <p className="cart-toast__details">
            {product?.name}
            {product?.size && ` · ${product.size}`}
            {product?.color && ` · ${product.color}`}
          </p>
          <Link to="/cart" className="cart-toast__link" onClick={handleClose}>
            Ver carrinho →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartToast;
