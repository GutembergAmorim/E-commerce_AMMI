import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import './Profile.css';

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

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getStatusBadge = (status) => {
    const map = {
      'Pago': 'admin-badge--paid',
      'Processando': 'admin-badge--processing',
      'Pendente': 'admin-badge--pending',
      'Cancelado': 'admin-badge--cancelled',
      'Enviado': 'admin-badge--paid',
      'Entregue': 'admin-badge--paid',
    };
    return map[status] || 'admin-badge--default';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="profile-page-title">Meus Pedidos</h2>
      <p className="profile-page-subtitle">{orders.length} pedido(s) realizados</p>

      {orders.length === 0 ? (
        <div className="profile-card">
          <div className="profile-card__body" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#f5f5f5',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12, color: '#ccc',
            }}>
              <ShoppingBag size={24} />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
              Nenhum pedido encontrado
            </p>
            <p style={{ fontSize: '0.82rem', color: '#999', margin: '0 0 16px' }}>
              Você ainda não fez nenhum pedido.
            </p>
            <Link
              to="/collections"
              className="checkout-btn checkout-btn--primary"
              style={{ width: 'auto', display: 'inline-flex', padding: '10px 28px', textDecoration: 'none' }}
            >
              Fazer Minha Primeira Compra
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order._id} className="profile-order">
              <div className="profile-order__header">
                <div>
                  <span className="profile-order__id">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="profile-order__date" style={{ marginLeft: 10 }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Product Thumbnails */}
              <div className="profile-order__items">
                {order.orderItems?.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} className="profile-order__thumb" />
                ))}
                {order.orderItems?.length > 4 && (
                  <div
                    className="profile-order__thumb"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f5f5f5', color: '#999', fontSize: '0.72rem', fontWeight: 700,
                    }}
                  >
                    +{order.orderItems.length - 4}
                  </div>
                )}
              </div>

              <div className="profile-order__footer">
                <div>
                  <span className="profile-order__total">{formatCurrency(order.total)}</span>
                  <span style={{ fontSize: '0.72rem', color: '#999', marginLeft: 6 }}>
                    {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Link
                  to={`/order-confirmation/${order._id}`}
                  className="admin-link-btn"
                >
                  <Eye size={13} /> Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;