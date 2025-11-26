// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Users, DollarSign, TrendingUp, 
  ShoppingCart, AlertCircle, Clock 
} from 'lucide-react';
import api from '../../services/api';

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
      // Em produção, você teria endpoints específicos para essas estatísticas
      const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
        api.get('/orders?limit=5'),
        api.get('/products?limit=1'), // Só para contar
        api.get('/users?limit=1') // Só para contar
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

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`rounded-circle p-3 bg-${color}-light me-3`}>
            {React.cloneElement(icon, { size: 24, className: `text-${color}` })}
          </div>
          <div>
            <h4 className="mb-1">{value}</h4>
            <p className="text-muted mb-0">{title}</p>
            {subtitle && <small className={`text-${color}`}>{subtitle}</small>}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Dashboard Administrativo</h1>
          <p className="text-muted">Visão geral da sua loja</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-primary">
            <TrendingUp size={16} className="me-2" />
            Relatório Mensal
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Total de Pedidos"
            value={stats.totalOrders}
            icon={<ShoppingCart />}
            color="primary"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Faturamento"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(stats.totalRevenue)}
            icon={<DollarSign />}
            color="success"
            subtitle="Total"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Produtos"
            value={stats.totalProducts}
            icon={<Package />}
            color="info"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Usuários"
            value={stats.totalUsers}
            icon={<Users />}
            color="warning"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Pedidos Pendentes"
            value={stats.pendingOrders}
            icon={<Clock />}
            color="danger"
            subtitle="Precisa de atenção"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Taxa de Conversão"
            value="2.5%"
            icon={<TrendingUp />}
            color="success"
            subtitle="+0.5% vs último mês"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Pedidos Recentes */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pedidos Recentes</h5>
              <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
                Ver Todos
              </Link>
            </div>
            <div className="card-body p-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <Package size={48} className="text-muted mb-2" />
                  <p className="text-muted">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                          </td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(order.total)}
                          </td>
                          <td>
                            <span className={`badge ${
                              order.status === 'Pago' ? 'bg-success' :
                              order.status === 'Processando' ? 'bg-warning' :
                              'bg-secondary'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="btn btn-sm btn-outline-primary"
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

        {/* Ações Rápidas */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ações Rápidas</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/admin/products/new" className="btn btn-primary">
                  <Package size={16} className="me-2" />
                  Adicionar Produto
                </Link>
                <Link to="/admin/orders" className="btn btn-outline-primary">
                  <ShoppingCart size={16} className="me-2" />
                  Gerenciar Pedidos
                </Link>
                <Link to="/admin/users" className="btn btn-outline-primary">
                  <Users size={16} className="me-2" />
                  Gerenciar Usuários
                </Link>
                <Link to="/admin/stock" className="btn btn-outline-primary">
                  <TrendingUp size={16} className="me-2" />
                  Gerenciar Stock
                </Link>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div className="card mt-4 border-warning">
            <div className="card-header bg-warning bg-opacity-10">
              <div className="d-flex align-items-center">
                <AlertCircle size={20} className="text-warning me-2" />
                <h6 className="mb-0">Alertas</h6>
              </div>
            </div>
            <div className="card-body">
              {stats.pendingOrders > 0 ? (
                <div className="alert alert-warning mb-2">
                  <strong>{stats.pendingOrders} pedidos</strong> precisam de atenção
                </div>
              ) : (
                <div className="alert alert-success">
                  Todos os pedidos estão em dia! 🎉
                </div>
              )}
              
              <div className="alert alert-info">
                <strong>5 produtos</strong> com estoque baixo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;