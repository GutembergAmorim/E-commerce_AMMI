import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, AlertTriangle, TrendingUp,
  Plus, Minus, History, Search, X, BarChart3, ShoppingCart
} from 'lucide-react';
import api from '../../services/api';
import './AdminDashboard.css';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/stock/low-stock'),
      ]);
      setProducts(productsRes.data.data || []);
      setLowStockProducts(lowStockRes.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (product) => {
    setSelectedProduct(product);
    setAdjustmentType('add');
    setAdjustmentQty('');
    setReason('');
    setShowAdjustModal(true);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentQty || !reason) return;

    setAdjusting(true);
    try {
      const qty = parseInt(adjustmentQty);
      const adjustment = adjustmentType === 'add' ? Math.abs(qty) : -Math.abs(qty);

      await api.post(`/stock/adjust/${selectedProduct._id}`, {
        adjustment,
        reason,
      });

      setShowAdjustModal(false);
      await fetchData();
      showNotification(
        `Estoque de "${selectedProduct.name}" ${adjustmentType === 'add' ? 'acrescido' : 'reduzido'} em ${Math.abs(qty)} un.`,
        'success'
      );
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao ajustar estoque', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock =
      stockFilter === 'all' ? true :
      stockFilter === 'out' ? p.stock === 0 :
      stockFilter === 'low' ? (p.stock > 0 && p.stock <= (p.lowStockAlert || 5)) :
      stockFilter === 'normal' ? p.stock > (p.lowStockAlert || 5) : true;
    return matchesSearch && matchesStock;
  });

  // Stats
  const totalUnits = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalSold = products.reduce((s, p) => s + (p.totalSold || 0), 0);

  const getStockBadge = (product) => {
    if (product.stock === 0) return <span className="admin-badge admin-badge--cancelled">Sem Estoque</span>;
    if (product.stock <= (product.lowStockAlert || 5)) return <span className="admin-badge admin-badge--pending">Baixo</span>;
    return <span className="admin-badge admin-badge--paid">Normal</span>;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
          <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>Carregando estoque...</p>
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
      <div className="admin-header">
        <h1 className="admin-header__title">Controle de Estoque</h1>
        <p className="admin-header__subtitle">Gerencie o estoque dos seus produtos</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--blue"><Package size={18} /></div>
          <p className="admin-stat__value">{products.length}</p>
          <p className="admin-stat__label">Total Produtos</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--green"><TrendingUp size={18} /></div>
          <p className="admin-stat__value">{totalUnits}</p>
          <p className="admin-stat__label">Unidades em Estoque</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--amber"><AlertTriangle size={18} /></div>
          <p className="admin-stat__value">{lowStockProducts.length}</p>
          <p className="admin-stat__label">Estoque Baixo</p>
          {lowStockProducts.length > 0 && (
            <span className="admin-stat__badge admin-stat__badge--red">Atenção</span>
          )}
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--red"><Minus size={18} /></div>
          <p className="admin-stat__value">{outOfStock}</p>
          <p className="admin-stat__label">Sem Estoque</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--teal"><ShoppingCart size={18} /></div>
          <p className="admin-stat__value">{totalSold}</p>
          <p className="admin-stat__label">Total Vendido</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="admin-alert admin-alert--warning" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} className="admin-alert__icon" />
          <span>
            <strong>{lowStockProducts.length} produto(s) com estoque baixo: </strong>
            {lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.stock})`).join(', ')}
            {lowStockProducts.length > 3 && ` +${lowStockProducts.length - 3} mais`}
          </span>
        </div>
      )}

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
                  placeholder="Buscar produto por nome ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select checkout-input"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="normal">Estoque Normal</option>
                <option value="low">Estoque Baixo</option>
                <option value="out">Sem Estoque</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">{filteredProducts.length} produto(s)</h2>
        </div>
        <div className="admin-card__body">
          {filteredProducts.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon"><Package size={24} /></div>
              <p className="admin-empty__text">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Alerta em</th>
                    <th>Vendidos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={product.images?.[0] || '/images/placeholder.jpg'}
                            alt={product.name}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{product.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#999' }}>{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{
                          color: product.stock === 0 ? '#dc2626' :
                            product.stock <= (product.lowStockAlert || 5) ? '#d97706' : '#16a34a',
                          fontSize: '0.9rem',
                        }}>
                          {product.stock} un
                        </strong>
                      </td>
                      <td>{getStockBadge(product)}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#888' }}>
                          {product.lowStockAlert || 5} un
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--default">
                          <ShoppingCart size={11} /> {product.totalSold || 0}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="admin-link-btn"
                            onClick={() => openAdjustModal(product)}
                          >
                            <Plus size={13} /> Ajustar
                          </button>
                          <Link
                            to={`/admin/stock/history/${product._id}`}
                            className="admin-link-btn"
                          >
                            <History size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16,
          }}
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            className="admin-card"
            style={{ width: '100%', maxWidth: 460, animation: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-card__header">
              <h2 className="admin-card__title">Ajustar Estoque</h2>
              <button
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                onClick={() => setShowAdjustModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdjustStock}>
              <div className="admin-card__body--padded">
                {/* Product Info */}
                <div className="d-flex align-items-center gap-3 mb-3 p-3" style={{ background: '#fafafa', borderRadius: 10 }}>
                  <img
                    src={selectedProduct?.images?.[0] || '/images/placeholder.jpg'}
                    alt={selectedProduct?.name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedProduct?.name}</div>
                    <div style={{ fontSize: '0.73rem', color: '#999' }}>
                      Estoque atual: <strong style={{ color: '#1a1a1a' }}>{selectedProduct?.stock} un</strong>
                    </div>
                  </div>
                </div>

                {/* Type Toggle */}
                <label className="checkout-label">Tipo de Ajuste</label>
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`checkout-btn ${adjustmentType === 'add' ? 'checkout-btn--primary' : ''}`}
                    style={{
                      flex: 1, padding: '8px 0', fontSize: '0.82rem',
                      ...(adjustmentType !== 'add' && { background: '#f0f0f0', color: '#555', border: '1px solid #e0e0e0' }),
                    }}
                    onClick={() => setAdjustmentType('add')}
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                  <button
                    type="button"
                    className={`checkout-btn ${adjustmentType === 'remove' ? 'checkout-btn--primary' : ''}`}
                    style={{
                      flex: 1, padding: '8px 0', fontSize: '0.82rem',
                      ...(adjustmentType !== 'remove' && { background: '#f0f0f0', color: '#555', border: '1px solid #e0e0e0' }),
                    }}
                    onClick={() => setAdjustmentType('remove')}
                  >
                    <Minus size={14} /> Remover
                  </button>
                </div>

                {/* Quantity */}
                <div className="mb-3">
                  <label className="checkout-label">Quantidade</label>
                  <input
                    type="number"
                    className="form-control checkout-input"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    min="1"
                    placeholder="Ex: 10"
                    required
                  />
                </div>

                {/* Reason */}
                <div className="mb-3">
                  <label className="checkout-label">Motivo do Ajuste</label>
                  <select
                    className="form-select checkout-input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="">Selecione um motivo</option>
                    <option value="inventario">Inventário</option>
                    <option value="devolucao">Devolução de Cliente</option>
                    <option value="danificado">Produto Danificado</option>
                    <option value="reposicao">Reposição de Fornecedor</option>
                    <option value="ajuste">Ajuste Manual</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                {reason === 'outro' && (
                  <div className="mb-3">
                    <label className="checkout-label">Especificar</label>
                    <input
                      type="text"
                      className="form-control checkout-input"
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Preview */}
                {adjustmentQty && (
                  <div className="checkout-card-hint" style={{ marginTop: 0, marginBottom: 0 }}>
                    <BarChart3 size={14} />
                    <span>
                      Novo estoque: <strong>
                        {adjustmentType === 'add'
                          ? (selectedProduct?.stock || 0) + parseInt(adjustmentQty || 0)
                          : Math.max(0, (selectedProduct?.stock || 0) - parseInt(adjustmentQty || 0))
                        } un
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="admin-link-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="checkout-btn checkout-btn--primary"
                  style={{ flex: 2 }}
                  disabled={adjusting}
                >
                  {adjusting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Aplicando...
                    </>
                  ) : (
                    'Aplicar Ajuste'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;