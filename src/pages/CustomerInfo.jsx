import React from "react";
import { useAuth } from "../Context/AuthContext";

const CustomerInfo = () => {
  const { user } = useAuth();

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        <h2 className="h4 fw-bold mb-3">Dados do Cliente</h2>
      </div>
      <div className="card-body">
        {user ? (
          <div>
            <p>
              <strong>Nome:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>CPF:</strong> {user.cpf || "Não informado"}
            </p>
            <p>
              <strong>Telefone:</strong> {user.phone || "Não informado"}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando dados do cliente...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfo;