import React from "react";

const Notification = ({ show, message, type, onClose }) => {
  const iconMap = {
    error: "fas fa-exclamation-circle",
    success: "fas fa-check-circle",
    info: "fas fa-info-circle",
  };

  return (
    <div
      className={`checkout-toast checkout-toast--${type || "info"} ${
        show ? "checkout-toast--visible" : ""
      }`}
      role="alert"
    >
      <i className={`checkout-toast__icon ${iconMap[type] || iconMap.info}`}></i>
      <span>{message}</span>
      <button
        type="button"
        className="checkout-toast__close"
        onClick={onClose}
        aria-label="Fechar"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;