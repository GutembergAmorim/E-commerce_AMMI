// components/UI/Notification.jsx
import React from "react";

const Notification = ({ show, message, type, onClose }) => {
  if (!show) return null;

  const alertClass = `alert alert-${type} alert-dismissible fade show`;

  return (
    <div className="container mb-4">
      <div className={alertClass} role="alert">
        {message}
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};

export default Notification;