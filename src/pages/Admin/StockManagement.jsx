// src/pages/Admin/StockManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, AlertTriangle, TrendingUp, Download, 
  Plus, Minus, History, Filter 
} from 'lucide-react';
import api from '../../services/api';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
  }, []);


  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=100');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchLowStock = async () => {
    try {
      const response = await api.get('/stock/low-stock');
      console.log('Produtos com baixo estoque:', response.data.data);
      setLowStockProducts(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar estoque baixo:', error);
    }
  };

 

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !adjustment || !reason) return;

    try {
      await api.post(`/stock/adjust/${selectedProduct._id}`, {
        adjustment: parseInt(adjustment),
        reason
      });

      setShowAdjustModal(false);
      setAdjustment('');
      setReason('');
      setSelectedProduct(null);
      
      // Recarregar dados
      fetchProducts();
      fetchLowStock();
      
      alert('Estoque ajustado com sucesso!');
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      alert('Erro ao ajustar estoque: ' + error.response?.data?.message);
    }
  };

  const StockLevel = ({ stock, lowStockAlert }) => {
    if (stock === 0) {
      return <span className="badge bg-danger">Sem Estoque</span>;
    } else if (stock <= lowStockAlert) {
      return <span className="badge bg-warning">Baixo</span>;
    } else {
      return <span className="badge bg-success">Normal</span>;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Controle de Estoque</h1>
          <p className="text-muted">
            Gerencie o estoque dos seus produtos
          </p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-primary">
            <Download size={16} className="me-2" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning mb-4">
          <div className="d-flex align-items-center">
            <AlertTriangle size={20} className="me-2" />
            <strong>{lowStockProducts.length} produto(s) com estoque baixo</strong>
          </div>
          <div className="mt-2">
            {lowStockProducts.slice(0, 3).map(product => (
              <span key={product._id} className="badge bg-warning me-2">
                {product.name} ({product.stock} restantes)
              </span>
            ))}
            {lowStockProducts.length > 3 && (
              <span className="text-muted">
                +{lowStockProducts.length - 3} mais...
              </span>
            )}
          </div>
        </div>
      )}

      <div className="row">
        {/* Estatísticas Rápidas */}
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-primary">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <Package size={24} className="text-primary me-3" />
                <div>
                  <h4 className="mb-1">{products.length}</h4>
                  <p className="text-muted mb-0">Total de Produtos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <AlertTriangle size={24} className="text-warning me-3" />
                <div>
                  <h4 className="mb-1">{lowStockProducts.length}</h4>
                  <p className="text-muted mb-0">Estoque Baixo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-danger">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <Minus size={24} className="text-danger me-3" />
                <div>
                  <h4 className="mb-1">
                    {products.filter(p => p.stock === 0).length}
                  </h4>
                  <p className="text-muted mb-0">Sem Estoque</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card border-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <TrendingUp size={24} className="text-success me-3" />
                <div>
                  <h4 className="mb-1">
                    {products.reduce((sum, p) => sum + p.stock, 0)}
                  </h4>
                  <p className="text-muted mb-0">Unidades em Estoque</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Todos os Produtos</h5>
          <div className="input-group" style={{ width: '300px' }}>
            <span className="input-group-text">
              <Filter size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Filtrar produtos..."
            />
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th>Estoque Atual</th>
                  <th>Status</th>
                  <th>Alerta em</th>
                  <th>Total Vendido</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={product.images?.[0] || '/images/placeholder.jpg'} 
                          alt={product.name}
                          className="rounded me-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-medium">{product.name}</div>
                          <small className="text-muted">{product.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{product.sku || 'N/A'}</code>
                    </td>
                    <td>
                      <strong className={
                        product.stock === 0 ? 'text-danger' :
                        product.stock <= product.lowStockAlert ? 'text-warning' :
                        'text-success'
                      }>
                        {product.stock} un
                      </strong>
                    </td>
                    <td>
                      <StockLevel 
                        stock={product.stock} 
                        lowStockAlert={product.lowStockAlert} 
                      />
                    </td>
                    <td>
                      <small className="text-muted">{product.lowStockAlert} un</small>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {product.totalSold || 0} vendidos
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowAdjustModal(true);
                          }}
                        >
                          <Plus size={14} />
                        </button>
                        <Link
                            to={`/admin/stock/history/${product._id}`}
                            className="btn btn-outline-secondary btn-sm"
                        >
                            <History size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Ajuste de Estoque */}
      {showAdjustModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Ajustar Estoque - {selectedProduct?.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAdjustModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAdjustStock}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tipo de Ajuste</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="adjustmentType"
                          id="add"
                          value="add"
                          checked={parseInt(adjustment) > 0}
                          onChange={() => setAdjustment(Math.abs(parseInt(adjustment) || 1).toString())}
                        />
                        <label className="form-check-label" htmlFor="add">
                          <Plus size={16} className="me-1" />
                          Adicionar
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="adjustmentType"
                          id="remove"
                          value="remove"
                          checked={parseInt(adjustment) < 0}
                          onChange={() => setAdjustment((-Math.abs(parseInt(adjustment) || 1)).toString())}
                        />
                        <label className="form-check-label" htmlFor="remove">
                          <Minus size={16} className="me-1" />
                          Remover
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="adjustment" className="form-label">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="adjustment"
                      value={adjustment}
                      onChange={(e) => setAdjustment(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">
                      Motivo do Ajuste
                    </label>
                    <select
                      className="form-select"
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    >
                      <option value="">Selecione um motivo</option>
                      <option value="inventario">Inventário</option>
                      <option value="devolucao">Devolução de Cliente</option>
                      <option value="danificado">Produto Danificado</option>
                      <option value="ajuste">Ajuste Manual</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  {reason === 'outro' && (
                    <div className="mb-3">
                      <label htmlFor="customReason" className="form-label">
                        Especificar Motivo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="customReason"
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAdjustModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Aplicar Ajuste
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;