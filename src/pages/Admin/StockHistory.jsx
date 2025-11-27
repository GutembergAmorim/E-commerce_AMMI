// src/pages/Admin/StockHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Filter, Search, 
  TrendingUp, TrendingDown, RefreshCw, Package 
} from 'lucide-react';
import api from '../../services/api';

const StockHistory = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchStockHistory();
  }, [productId]);

  const fetchStockHistory = async () => {
    try {
      const response = await api.get(`/stock/history/${productId}`);
      setProduct(response.data.data.product);
      setHistory(response.data.data.history);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    
    const matchesDate = !dateRange.start || !dateRange.end || 
      (new Date(item.createdAt) >= new Date(dateRange.start) && 
       new Date(item.createdAt) <= new Date(dateRange.end));
    
    return matchesType && matchesDate;
  });

  const getMovementIcon = (type) => {
    switch (type) {
      case 'IN':
        return <TrendingUp size={16} className="text-success" />;
      case 'OUT':
        return <TrendingDown size={16} className="text-danger" />;
      case 'ADJUST':
        return <RefreshCw size={16} className="text-warning" />;
      case 'RETURN':
        return <RefreshCw size={16} className="text-info" />;
      default:
        return <Package size={16} className="text-secondary" />;
    }
  };

  const getMovementBadge = (type) => {
    const config = {
      'IN': { class: 'bg-success', text: 'Entrada' },
      'OUT': { class: 'bg-danger', text: 'Saída' },
      'ADJUST': { class: 'bg-warning', text: 'Ajuste' },
      'RETURN': { class: 'bg-info', text: 'Devolução' }
    };
    
    const cfg = config[type] || { class: 'bg-secondary', text: type };
    return <span className={`badge ${cfg.class}`}>{cfg.text}</span>;
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Quantidade', 'Estoque Anterior', 'Novo Estoque', 'Motivo', 'Responsável'];
    const csvData = filteredHistory.map(item => [
      new Date(item.createdAt).toLocaleString('pt-BR'),
      item.type,
      item.quantity,
      item.previousStock,
      item.newStock,
      item.reason || 'N/A',
      item.createdBy?.name || 'Sistema'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-estoque-${product?.name || 'produto'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <Package size={64} className="text-muted mb-3" />
          <h4>Produto não encontrado</h4>
          <p className="text-muted mb-4">
            O produto solicitado não existe ou não pôde ser carregado.
          </p>
          <Link to="/admin/stock" className="btn btn-primary">
            <ArrowLeft size={16} className="me-2" />
            Voltar para Controle de Estoque
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-2">
            <Link 
              to="/admin/stock" 
              className="btn btn-outline-secondary btn-sm me-3"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="h3 mb-1">Histórico de Estoque</h1>
              <div className="d-flex align-items-center">
                <strong>{product.name}</strong>
                {product.sku && (
                  <span className="badge bg-light text-dark ms-2">
                    SKU: {product.sku}
                  </span>
                )}
                <span className={`badge ms-2 ${
                  product.currentStock === 0 ? 'bg-danger' :
                  product.currentStock <= 5 ? 'bg-warning' : 'bg-success'
                }`}>
                  Estoque: {product.currentStock}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="btn-group">
          <button 
            className="btn btn-outline-primary"
            onClick={exportToCSV}
          >
            <Download size={16} className="me-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-success">
                <TrendingUp size={24} />
              </div>
              <h5 className="mt-2">
                {history.filter(h => h.type === 'IN').reduce((sum, h) => sum + h.quantity, 0)}
              </h5>
              <small className="text-muted">Total de Entradas</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-danger">
                <TrendingDown size={24} />
              </div>
              <h5 className="mt-2">
                {history.filter(h => h.type === 'OUT').reduce((sum, h) => sum + h.quantity, 0)}
              </h5>
              <small className="text-muted">Total de Saídas</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-warning">
                <RefreshCw size={24} />
              </div>
              <h5 className="mt-2">
                {history.filter(h => h.type === 'ADJUST').length}
              </h5>
              <small className="text-muted">Ajustes Realizados</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-info">
                <Package size={24} />
              </div>
              <h5 className="mt-2">{history.length}</h5>
              <small className="text-muted">Total de Movimentações</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Tipo de Movimentação</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="IN">Entradas</option>
                <option value="OUT">Saídas</option>
                <option value="ADJUST">Ajustes</option>
                <option value="RETURN">Devoluções</option>
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Data Inicial</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Data Final</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
          
          {(dateRange.start || dateRange.end || filterType !== 'all') && (
            <div className="mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setFilterType('all');
                  setDateRange({ start: '', end: '' });
                }}
              >
                <Filter size={14} className="me-1" />
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Movimentações de Estoque
            <span className="badge bg-primary ms-2">{filteredHistory.length}</span>
          </h5>
          <small className="text-muted">
            Mostrando {filteredHistory.length} de {history.length} registros
          </small>
        </div>
        
        <div className="card-body p-0">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-5">
              <Search size={48} className="text-muted mb-3" />
              <h5>Nenhuma movimentação encontrada</h5>
              <p className="text-muted">
                {history.length === 0 
                  ? 'Este produto ainda não teve movimentações de estoque.'
                  : 'Tente ajustar os filtros para ver mais resultados.'
                }
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="120">Data/Hora</th>
                    <th width="100">Tipo</th>
                    <th width="100">Quantidade</th>
                    <th width="120">Estoque Anterior</th>
                    <th width="120">Novo Estoque</th>
                    <th>Motivo</th>
                    <th width="150">Responsável</th>
                    <th width="100">Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <small className="text-muted">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          <br />
                          {new Date(item.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      
                      <td>
                        <div className="d-flex align-items-center">
                          {getMovementIcon(item.type)}
                          <span className="ms-2">
                            {getMovementBadge(item.type)}
                          </span>
                        </div>
                      </td>
                      
                      <td>
                        <span className={
                          item.type === 'IN' || item.type === 'RETURN' 
                            ? 'text-success fw-bold' 
                            : 'text-danger fw-bold'
                        }>
                          {item.type === 'IN' || item.type === 'RETURN' ? '+' : '-'}
                          {item.quantity}
                        </span>
                      </td>
                      
                      <td>
                        <span className="text-muted">{item.previousStock}</span>
                      </td>
                      
                      <td>
                        <strong className={
                          item.newStock === 0 ? 'text-danger' :
                          item.newStock <= 5 ? 'text-warning' : 'text-success'
                        }>
                          {item.newStock}
                        </strong>
                      </td>
                      
                      <td>
                        <small>
                          {item.reason || 'N/A'}
                          {item.order && (
                            <div className="text-muted">
                              Pedido: {item.order._id?.slice(-8).toUpperCase()}
                            </div>
                          )}
                        </small>
                      </td>
                      
                      <td>
                        <small className="text-muted">
                          {item.createdBy?.name || 'Sistema'}
                        </small>
                      </td>
                      
                      <td>
                        {item.order ? (
                          <Link 
                            to={`/admin/orders/${item.order._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Ver Pedido
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Paginação (se necessário no futuro) */}
        {filteredHistory.length > 0 && (
          <div className="card-footer">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Mostrando {filteredHistory.length} movimentações
              </small>
              
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Anterior
                </button>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Evolução do Estoque (Opcional) */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Evolução do Estoque</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="text-muted mb-3">
              <TrendingUp size={48} />
            </div>
            <p className="text-muted">
              Gráfico de evolução do estoque será implementado em breve.
            </p>
            <small className="text-muted">
              Esta funcionalidade mostrará um gráfico temporal das movimentações.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHistory;