import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Users, DollarSign, TrendingUp,
  ShoppingCart, AlertCircle, Clock, ChevronRight,
  ArrowUpRight, BarChart3, Tag
} from 'lucide-react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
        api.get('/orders?limit=5'),
        api.get('/products?limit=1'),
        api.get('/users?limit=1')
      ]);

      const orders = ordersResponse.data.data || [];
      const pendingOrders = orders.filter(order => order.status === 'Processando').length;

      const totalRevenue = orders
        .filter(order => order.isPaid)
        .reduce((sum, order) => sum + order.total, 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: productsResponse.data.total || 0,
        totalUsers: usersResponse.data.total || 0,
        pendingOrders
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const getStatusBadge = (status) => {
    const map = {
      'Pago': 'admin-badge--paid',
      'Processando': 'admin-badge--processing',
      'Pendente': 'admin-badge--pending',
      'Cancelado': 'admin-badge--cancelled',
    };
    return map[status] || 'admin-badge--default';
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-dark" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total de Pedidos',
      value: stats.totalOrders,
      icon: <ShoppingCart size={20} />,
      colorClass: 'admin-stat__icon--blue',
    },
    {
      label: 'Faturamento',
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign size={20} />,
      colorClass: 'admin-stat__icon--green',
      badge: { text: 'Total', cls: 'admin-stat__badge--green' },
    },
    {
      label: 'Produtos',
      value: stats.totalProducts,
      icon: <Package size={20} />,
      colorClass: 'admin-stat__icon--purple',
    },
    {
      label: 'Usuários',
      value: stats.totalUsers,
      icon: <Users size={20} />,
      colorClass: 'admin-stat__icon--amber',
    },
    {
      label: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: <Clock size={20} />,
      colorClass: 'admin-stat__icon--red',
      badge: stats.pendingOrders > 0
        ? { text: 'Atenção', cls: 'admin-stat__badge--red' }
        : null,
    },
    {
      label: 'Taxa de Conversão',
      value: '2.5%',
      icon: <TrendingUp size={20} />,
      colorClass: 'admin-stat__icon--teal',
      badge: { text: '+0.5%', cls: 'admin-stat__badge--green' },
    },
  ];

  const quickActions = [
    {
      label: 'Adicionar Produto',
      to: '/admin/products/new',
      icon: <Package size={18} />,
      colorClass: 'admin-stat__icon--purple',
    },
    {
      label: 'Gerenciar Pedidos',
      to: '/admin/orders',
      icon: <ShoppingCart size={18} />,
      colorClass: 'admin-stat__icon--blue',
    },
    {
      label: 'Gerenciar Usuários',
      to: '/admin/users',
      icon: <Users size={18} />,
      colorClass: 'admin-stat__icon--amber',
    },
    {
      label: 'Gerenciar Estoque',
      to: '/admin/stock',
      icon: <BarChart3 size={18} />,
      colorClass: 'admin-stat__icon--green',
    },
    {
      label: 'Gerenciar Cupons',
      to: '/admin/coupons',
      icon: <Tag size={18} />,
      colorClass: 'admin-stat__icon--purple',
    },
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="admin-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h1 className="admin-header__title">Dashboard</h1>
          <p className="admin-header__subtitle">Visão geral da sua loja</p>
        </div>
        <Link
          to="/admin/orders"
          className="admin-link-btn"
        >
          <BarChart3 size={14} />
          Relatório Mensal
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat">
            <div className={`admin-stat__icon ${card.colorClass}`}>
              {card.icon}
            </div>
            <p className="admin-stat__value">{card.value}</p>
            <p className="admin-stat__label">{card.label}</p>
            {card.badge && (
              <span className={`admin-stat__badge ${card.badge.cls}`}>
                {card.badge.text}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-lg-8">
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Pedidos Recentes</h2>
              <Link to="/admin/orders" className="admin-link-btn">
                Ver Todos
                <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="admin-card__body">
              {recentOrders.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty__icon">
                    <Package size={24} />
                  </div>
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
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <strong style={{ fontSize: '0.82rem' }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </strong>
                          </td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <strong>{formatCurrency(order.total)}</strong>
                          </td>
                          <td>
                            <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="admin-link-btn"
                            >
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
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          {/* Quick Actions */}
          <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
            <div className="admin-card__header">
              <h2 className="admin-card__title">Ações Rápidas</h2>
            </div>
            <div className="admin-card__body--padded">
              <div className="admin-actions">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="admin-action-btn"
                  >
                    <div className={`admin-action-btn__icon ${action.colorClass}`}>
                      {action.icon}
                    </div>
                    {action.label}
                    <ChevronRight size={16} className="admin-action-btn__arrow" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Alertas</h2>
            </div>
            <div className="admin-card__body--padded">
              {stats.pendingOrders > 0 ? (
                <div className="admin-alert admin-alert--warning">
                  <AlertCircle size={18} className="admin-alert__icon" />
                  <span>
                    <strong>{stats.pendingOrders} pedidos</strong> precisam de atenção
                  </span>
                </div>
              ) : (
                <div className="admin-alert admin-alert--success">
                  <span>🎉 Todos os pedidos estão em dia!</span>
                </div>
              )}

              <div className="admin-alert admin-alert--info">
                <Package size={18} className="admin-alert__icon" />
                <span>
                  <strong>5 produtos</strong> com estoque baixo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;