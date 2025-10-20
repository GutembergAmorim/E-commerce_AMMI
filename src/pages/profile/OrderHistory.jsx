// src/pages/profile/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Calendar, DollarSign } from 'lucide-react';
import api from '../../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pago': { class: 'bg-success', text: 'Pago' },
      'Processando': { class: 'bg-warning', text: 'Processando' },
      'Pendente': { class: 'bg-secondary', text: 'Pendente' },
      'Cancelado': { class: 'bg-danger', text: 'Cancelado' },
      'Enviado': { class: 'bg-info', text: 'Enviado' },
      'Entregue': { class: 'bg-success', text: 'Entregue' }
    };

    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando seus pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Package size={24} className="text-primary me-2" />
        <h4 className="mb-0">Meus Pedidos</h4>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <Package size={64} className="text-muted mb-3" />
          <h5>Nenhum pedido encontrado</h5>
          <p className="text-muted mb-4">
            Você ainda não fez nenhum pedido em nossa loja.
          </p>
          <Link to="/products" className="btn btn-primary">
            Fazer Minha Primeira Compra
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Calendar size={16} className="text-muted me-2" />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td>
                    <small>
                      {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? 's' : ''}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <DollarSign size={16} className="text-success me-1" />
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td>
                    <Link
                      to={`/order-confirmation/${order._id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <Eye size={16} className="me-1" />
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;