// src/pages/Admin/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Download } from 'lucide-react';
import api from '../../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

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
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendente': 'bg-secondary',
      'Processando': 'bg-warning',
      'Pago': 'bg-info',
      'Enviado': 'bg-primary',
      'Entregue': 'bg-success',
      'Cancelado': 'bg-danger'
    };
    
    return <span className={`badge ${statusConfig[status] || 'bg-secondary'}`}>
      {status}
    </span>;
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Gerenciar Pedidos</h1>
          <p className="text-muted">
            {filteredOrders.length} pedido(s) encontrado(s)
          </p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-primary">
            <Download size={16} className="me-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por ID, nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="Pendente">Pendente</option>
                <option value="Processando">Processando</option>
                <option value="Pago">Pago</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary w-100">
                <Filter size={16} className="me-2" />
                Mais Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{order.user?.name || 'N/A'}</div>
                        <small className="text-muted">{order.user?.email}</small>
                      </div>
                    </td>
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
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        style={{ width: 'auto' }}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Processando">Processando</option>
                        <option value="Pago">Pago</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${
                        order.isPaid ? 'bg-success' : 'bg-warning'
                      }`}>
                        {order.isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-outline-secondary">
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-5">
              <Search size={48} className="text-muted mb-3" />
              <h5>Nenhum pedido encontrado</h5>
              <p className="text-muted">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;