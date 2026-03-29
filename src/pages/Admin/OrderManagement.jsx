import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Eye, ChevronRight, Package,
  ArrowUpRight, CheckCircle, X, ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import './AdminDashboard.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/admin/all?limit=50');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
      showNotification(`Status atualizado para "${newStatus}"`, 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao atualizar status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getStatusBadge = (status) => {
    const map = {
      'Pago': 'admin-badge--paid',
      'Processando': 'admin-badge--processing',
      'Pendente': 'admin-badge--pending',
      'Preparando': 'admin-badge--processing',
      'Cancelado': 'admin-badge--cancelled',
      'Enviado': 'admin-badge--paid',
      'Entregue': 'admin-badge--paid',
    };
    return map[status] || 'admin-badge--default';
  };

  // Stats
  const totalRevenue = orders.filter(o => o.isPaid).reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Pendente' || o.status === 'Processando').length;

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
          <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Toast */}
      {notification.show && (
        <div className={`checkout-toast checkout-toast--${notification.type} checkout-toast--visible`} role="alert">
          <span>{notification.message}</span>
          <button className="checkout-toast__close" onClick={() => setNotification({ show: false, message: '', type: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="admin-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <Link
            to="/admin/dashboard"
            style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 2, marginTop: 4 }}
          >
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </Link>
          <h1 className="admin-header__title">Gerenciar Pedidos</h1>
          <p className="admin-header__subtitle">{orders.length} pedido(s) no total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--blue"><Package size={18} /></div>
          <p className="admin-stat__value">{orders.length}</p>
          <p className="admin-stat__label">Total Pedidos</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--green"><CheckCircle size={18} /></div>
          <p className="admin-stat__value">{formatCurrency(totalRevenue)}</p>
          <p className="admin-stat__label">Faturamento Pago</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--amber"><Search size={18} /></div>
          <p className="admin-stat__value">{pendingCount}</p>
          <p className="admin-stat__label">Pendentes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-card__body--padded">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text" style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '10px 0 0 10px' }}>
                  <Search size={15} color="#999" />
                </span>
                <input
                  type="text"
                  className="form-control checkout-input"
                  style={{ borderRadius: '0 10px 10px 0' }}
                  placeholder="Buscar por ID, nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select checkout-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="Pendente">Pendente</option>
                <option value="Processando">Processando</option>
                <option value="Pago">Pago</option>
                <option value="Preparando">Preparando</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">{filteredOrders.length} pedido(s) encontrado(s)</h2>
        </div>
        <div className="admin-card__body">
          {filteredOrders.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon"><Search size={24} /></div>
              <p className="admin-empty__text">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong style={{ fontSize: '0.82rem' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.user?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#999' }}>{order.user?.email}</div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td><strong>{formatCurrency(order.total)}</strong></td>
                      <td>
                        <span className={`admin-badge ${order.isPaid ? 'admin-badge--paid' : 'admin-badge--pending'}`}>
                          {order.isPaid ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select checkout-input"
                          style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: '0.78rem', minWidth: 130 }}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Processando">Processando</option>
                          <option value="Pago">Pago</option>
                          <option value="Preparando">Preparando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregue">Entregue</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="admin-link-btn"
                        >
                          <Eye size={13} /> Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;