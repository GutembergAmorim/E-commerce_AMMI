import React from "react";
import { useAuth } from "../Context/AuthContext";

const CustomerInfo = () => {
  const { user } = useAuth();

  const fields = [
    { icon: "fas fa-user", label: "Nome", value: user?.name },
    { icon: "fas fa-envelope", label: "Email", value: user?.email },
    { icon: "fas fa-id-card", label: "CPF", value: user?.cpf || "Não informado" },
    { icon: "fas fa-phone", label: "Telefone", value: user?.phone || "Não informado" },
  ];

  return (
    <div className="checkout-card">
      <h2 className="checkout-card__title">
        <i className="fas fa-user-circle"></i>
        Dados do Cliente
      </h2>

      {user ? (
        <div className="checkout-info-grid">
          {fields.map((field) => (
            <div key={field.label} className="checkout-info-item">
              <div className="checkout-info-item__icon">
                <i className={field.icon}></i>
              </div>
              <div>
                <p className="checkout-info-item__label">{field.label}</p>
                <p className="checkout-info-item__value">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-dark" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2 mb-0" style={{ fontSize: "0.85rem", color: "#999" }}>
            Carregando dados...
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerInfo;