import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { main } from "@popperjs/core";
import api from "../services/api";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const formatCurrency = (value, currency) => {
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        clearCart(); // Limpa o carrinho ao carregar a página de sucesso
        setLoading(true);
        setError(null);
        try {
          const response = await api.get(`/orders/${orderId}`);
          setOrder(response.data);
        } catch (error) {
          console.error("Erro ao buscar pedido:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spiner-border text-primary" role="status">
          <span className="visually-hidden">Verificando seu pagamento...</span>
        </div>
        <p className="mt-3">Verificando seu pagamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Ocorreu um erro!</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Se o valor foi debitado, por favor, entre em contato conosco.
          </p>
        </div>
        <Link to="/" className="btn btn-primary mt-3">
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <div className="card shadow-sm p-4">
            <i className="fas fa-check-circle text-success fa-4x mb-3"></i>
            <h1 className="h3 fw-bold">Obrigado pela sua compra!</h1>
            <p className="lead text-muted">
              Seu pedido foi processado com sucesso.
            </p>
            {order && (
              <div className="text-start mt-4 p-3 bg-light rounded border">
                <h2 className="h5 mb-3">Resumo do Pedido</h2>
                <p>
                  <strong>ID do Pedido:</strong> {order.id}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer_details.email}
                </p>
                <p>
                  <strong>Valor Total:</strong>{" "}
                  {formatCurrency(order.amount_total / 100, order.currency)}
                </p>
              </div>
            )}
            <div className="mt-4">
              <p>
                Enviamos um e-mail de confirmação com os detalhes do seu pedido.
              </p>
              <Link to="/products" className="btn btn-primary">
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
