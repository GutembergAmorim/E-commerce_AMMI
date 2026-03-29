import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, AlertTriangle, TrendingUp,
  Plus, Minus, History, Search, X, BarChart3, ShoppingCart,
  DollarSign, Grid3X3, Tag, Save, Pencil, ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { productService } from '../../services/productService';
import './AdminDashboard.css';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Price modal state
  const [priceForm, setPriceForm] = useState({ price: '', oldPrice: '' });
  const [savingPrice, setSavingPrice] = useState(false);

  // Variations modal state
  const [variationsForm, setVariationsForm] = useState([]);
  const [savingVariations, setSavingVariations] = useState(false);

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

  // ── Stock Adjustment Modal ──
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

  // ── Price Modal ──
  const openPriceModal = (product) => {
    setSelectedProduct(product);
    setPriceForm({
      price: product.price?.toString() || '',
      oldPrice: product.oldPrice?.toString() || '',
    });
    setShowPriceModal(true);
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSavingPrice(true);
    try {
      const payload = {
        price: Number(priceForm.price),
      };
      if (priceForm.oldPrice && Number(priceForm.oldPrice) > 0) {
        payload.oldPrice = Number(priceForm.oldPrice);
      } else {
        payload.oldPrice = null;
      }

      await productService.updateProduct(selectedProduct._id, payload);
      setShowPriceModal(false);
      await fetchData();

      const isPromo = payload.oldPrice && payload.oldPrice > payload.price;
      showNotification(
        isPromo
          ? `"${selectedProduct.name}" colocado em promoção! De R$ ${payload.oldPrice.toFixed(2)} por R$ ${payload.price.toFixed(2)}`
          : `Preço de "${selectedProduct.name}" atualizado para R$ ${payload.price.toFixed(2)}`,
        'success'
      );
    } catch (error) {
      showNotification(error.response?.data?.message || error.message || 'Erro ao atualizar preço', 'error');
    } finally {
      setSavingPrice(false);
    }
  };

  const removeSale = async () => {
    if (!selectedProduct) return;
    setSavingPrice(true);
    try {
      await productService.updateProduct(selectedProduct._id, { oldPrice: null });
      setShowPriceModal(false);
      await fetchData();
      showNotification(`Promoção removida de "${selectedProduct.name}"`, 'success');
    } catch (error) {
      showNotification('Erro ao remover promoção', 'error');
    } finally {
      setSavingPrice(false);
    }
  };

  // ── Variations Modal ──
  const openVariationsModal = (product) => {
    setSelectedProduct(product);
    // Build variations matrix from existing data
    const sizes = product.sizes || [];
    const colors = product.colors || [];
    const existing = product.variations || [];

    const matrix = [];
    for (const color of colors) {
      for (const size of sizes) {
        const found = existing.find(v => v.color === color.value && v.size === size);
        matrix.push({
          color: color.value,
          colorName: color.name,
          size: size,
          stock: found ? found.stock : 0,
          sku: found ? found.sku || '' : '',
        });
      }
    }
    setVariationsForm(matrix);
    setShowVariationsModal(true);
  };

  const updateVariationStock = (index, value) => {
    setVariationsForm(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], stock: Math.max(0, parseInt(value) || 0) };
      return updated;
    });
  };

  const handleSaveVariations = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSavingVariations(true);
    try {
      const variations = variationsForm.map(v => ({
        color: v.color,
        size: v.size,
        stock: v.stock,
        sku: v.sku || undefined,
      }));

      // Also calculate total stock from variations
      const totalStock = variations.reduce((sum, v) => sum + v.stock, 0);

      await productService.updateProduct(selectedProduct._id, {
        variations,
        stock: totalStock,
      });

      setShowVariationsModal(false);
      await fetchData();
      showNotification(
        `Variações de "${selectedProduct.name}" atualizadas (${totalStock} un total)`,
        'success'
      );
    } catch (error) {
      showNotification(error.response?.data?.message || error.message || 'Erro ao atualizar variações', 'error');
    } finally {
      setSavingVariations(false);
    }
  };

  // ── Filters ──
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock =
      stockFilter === 'all' ? true :
      stockFilter === 'out' ? p.stock === 0 :
      stockFilter === 'low' ? (p.stock > 0 && p.stock <= (p.lowStockAlert || 5)) :
      stockFilter === 'normal' ? p.stock > (p.lowStockAlert || 5) :
      stockFilter === 'sale' ? (p.oldPrice && p.oldPrice > p.price) : true;
    return matchesSearch && matchesStock;
  });

  // Stats
  const totalUnits = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalSold = products.reduce((s, p) => s + (p.totalSold || 0), 0);
  const onSaleCount = products.filter(p => p.oldPrice && p.oldPrice > p.price).length;

  const getStockBadge = (product) => {
    if (product.stock === 0) return <span className="admin-badge admin-badge--cancelled">Sem Estoque</span>;
    if (product.stock <= (product.lowStockAlert || 5)) return <span className="admin-badge admin-badge--pending">Baixo</span>;
    return <span className="admin-badge admin-badge--paid">Normal</span>;
  };

  const formatCurrency = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

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
        <Link
            to="/admin/dashboard"
            style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 2, marginTop: 4 }}
          >
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </Link>
        <h1 className="admin-header__title">Controle de Estoque</h1>
        <p className="admin-header__subtitle">Gerencie estoque, preços e variações dos seus produtos</p>
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
        <div className="admin-stat">
          <div className="admin-stat__icon" style={{ background: '#fef3c7', color: '#d97706' }}><Tag size={18} /></div>
          <p className="admin-stat__value">{onSaleCount}</p>
          <p className="admin-stat__label">Em Promoção</p>
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
                <option value="sale">Em Promoção</option>
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
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Variações</th>
                    <th>Vendidos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isOnSale = product.oldPrice && product.oldPrice > product.price;
                    const discountPct = isOnSale
                      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                      : 0;
                    const variationCount = product.variations?.length || 0;

                    return (
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
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{formatCurrency(product.price)}</strong>
                            {isOnSale && (
                              <>
                                <br />
                                <span style={{ fontSize: '0.72rem', color: '#999', textDecoration: 'line-through' }}>
                                  {formatCurrency(product.oldPrice)}
                                </span>
                                <span className="admin-badge admin-badge--pending" style={{ marginLeft: 4, fontSize: '0.62rem' }}>
                                  -{discountPct}%
                                </span>
                              </>
                            )}
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
                          <span style={{ fontSize: '0.82rem', color: variationCount > 0 ? '#1a1a1a' : '#ccc' }}>
                            {variationCount > 0 ? `${variationCount} var.` : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-badge admin-badge--default">
                            <ShoppingCart size={11} /> {product.totalSold || 0}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              className="admin-link-btn"
                              title="Editar Produto"
                            >
                              <Pencil size={13} /> Editar
                            </Link>
                            <button
                              className="admin-link-btn"
                              onClick={() => openPriceModal(product)}
                              title="Editar Preço"
                            >
                              <DollarSign size={13} /> Preço
                            </button>
                            <button
                              className="admin-link-btn"
                              onClick={() => openVariationsModal(product)}
                              title="Gerenciar Variações"
                            >
                              <Grid3X3 size={13} /> Variações
                            </button>
                            <button
                              className="admin-link-btn"
                              onClick={() => openAdjustModal(product)}
                              title="Ajustar Estoque Global"
                            >
                              <Plus size={13} /> Ajustar
                            </button>
                            <Link
                              to={`/admin/stock/history/${product._id}`}
                              className="admin-link-btn"
                              title="Histórico"
                            >
                              <History size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Adjust Stock Modal ── */}
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
              <h2 className="admin-card__title">Ajustar Estoque Global</h2>
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

      {/* ── Price Modal ── */}
      {showPriceModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16,
          }}
          onClick={() => setShowPriceModal(false)}
        >
          <div
            className="admin-card"
            style={{ width: '100%', maxWidth: 460, animation: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-card__header">
              <h2 className="admin-card__title">Editar Preço</h2>
              <button
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                onClick={() => setShowPriceModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePrice}>
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
                    <div style={{ fontSize: '0.73rem', color: '#999' }}>{selectedProduct?.category}</div>
                  </div>
                </div>

                {/* Current Price */}
                <div className="mb-3">
                  <label className="checkout-label">Preço Atual (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control checkout-input"
                    value={priceForm.price}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    min="0"
                  />
                </div>

                {/* Old Price (for promos) */}
                <div className="mb-3">
                  <label className="checkout-label">
                    Preço Antigo / De (R$)
                    <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 400, marginLeft: 6 }}>
                      Preencha para criar promoção
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control checkout-input"
                    value={priceForm.oldPrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, oldPrice: e.target.value }))}
                    placeholder="Ex: 189.90"
                    min="0"
                  />
                </div>

                {/* Preview */}
                {priceForm.price && (
                  <div className="p-3 mb-3" style={{ background: '#f8f8f8', borderRadius: 10 }}>
                    <p className="mb-1" style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Preview do preço
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <strong style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>
                        {formatCurrency(priceForm.price)}
                      </strong>
                      {priceForm.oldPrice && Number(priceForm.oldPrice) > Number(priceForm.price) && (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>
                            {formatCurrency(priceForm.oldPrice)}
                          </span>
                          <span className="admin-badge admin-badge--pending" style={{ fontSize: '0.7rem' }}>
                            -{Math.round(((Number(priceForm.oldPrice) - Number(priceForm.price)) / Number(priceForm.oldPrice)) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Remove Sale Button */}
                {selectedProduct?.oldPrice && selectedProduct.oldPrice > selectedProduct.price && (
                  <button
                    type="button"
                    className="admin-link-btn"
                    style={{ color: '#dc2626', fontSize: '0.78rem', marginBottom: 8 }}
                    onClick={removeSale}
                    disabled={savingPrice}
                  >
                    <X size={13} /> Remover Promoção
                  </button>
                )}
              </div>

              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="admin-link-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                  onClick={() => setShowPriceModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="checkout-btn checkout-btn--primary"
                  style={{ flex: 2 }}
                  disabled={savingPrice}
                >
                  {savingPrice ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Salvando...
                    </>
                  ) : (
                    <><Save size={14} /> Salvar Preço</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Variations Modal ── */}
      {showVariationsModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16,
          }}
          onClick={() => setShowVariationsModal(false)}
        >
          <div
            className="admin-card"
            style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', animation: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-card__header">
              <h2 className="admin-card__title">Estoque por Variação</h2>
              <button
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                onClick={() => setShowVariationsModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveVariations}>
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
                      {selectedProduct?.colors?.length || 0} cor(es) × {selectedProduct?.sizes?.length || 0} tamanho(s)
                      {' = '}{variationsForm.length} combinações
                    </div>
                  </div>
                </div>

                {variationsForm.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#999' }}>
                    <Grid3X3 size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: 4 }}>
                      Nenhuma variação disponível
                    </p>
                    <p style={{ fontSize: '0.78rem' }}>
                      Este produto precisa ter cores e tamanhos cadastrados para gerenciar variações.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Variations Table */}
                    <div className="table-responsive">
                      <table className="admin-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th>Cor</th>
                            <th>Tamanho</th>
                            <th style={{ width: 100 }}>Estoque</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variationsForm.map((variation, index) => (
                            <tr key={`${variation.color}-${variation.size}`}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <span style={{ fontWeight: 600 }}>{variation.colorName}</span>
                                </div>
                              </td>
                              <td>
                                <span className="admin-badge admin-badge--default">{variation.size}</span>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control checkout-input"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.82rem',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    color: variation.stock === 0 ? '#dc2626' : '#16a34a',
                                  }}
                                  value={variation.stock}
                                  onChange={(e) => updateVariationStock(index, e.target.value)}
                                  min="0"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total */}
                    <div className="checkout-card-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                      <BarChart3 size={14} />
                      <span>
                        Estoque total: <strong>
                          {variationsForm.reduce((sum, v) => sum + v.stock, 0)} unidades
                        </strong>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {variationsForm.length > 0 && (
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="admin-link-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                    onClick={() => setShowVariationsModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="checkout-btn checkout-btn--primary"
                    style={{ flex: 2 }}
                    disabled={savingVariations}
                  >
                    {savingVariations ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Salvando...
                      </>
                    ) : (
                      <><Save size={14} /> Salvar Variações</>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;