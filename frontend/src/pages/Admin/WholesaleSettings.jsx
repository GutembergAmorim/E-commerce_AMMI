import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import api from '../../services/api';
import './AdminDashboard.css';

const WholesaleSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [form, setForm] = useState({
    minQuantity: 6,
    discountRates: { pix: 20, debit: 20, credit: 20 },
    isActive: true,
    blockCoupon: true,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/wholesale/admin');
      if (res.data.success) {
        const data = res.data.data;
        setConfig(data);
        setForm({
          minQuantity: data.minQuantity,
          discountRates: { ...data.discountRates },
          isActive: data.isActive,
          blockCoupon: data.blockCoupon,
        });
      }
    } catch (err) {
      showNotification('Erro ao carregar configuração', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/wholesale/admin', form);
      if (res.data.success) {
        showNotification('Configuração salva com sucesso!', 'success');
        setConfig(res.data.data);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="mt-2 text-muted">Carregando configuração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Notification */}
      {notification.show && (
        <div
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            padding: '12px 20px', borderRadius: 10,
            background: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${notification.type === 'error' ? '#fca5a5' : '#86efac'}`,
            color: notification.type === 'error' ? '#dc2626' : '#16a34a',
            fontWeight: 600, fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admin/dashboard" className="btn btn-outline-dark btn-sm rounded-pill">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="h4 mb-0 fw-bold">
            <Package size={24} className="me-2" />
            Desconto Atacado
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            Configure o desconto por quantidade de peças
          </p>
        </div>
      </div>

      {/* Config Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">

          {/* Active Toggle */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3"
            style={{ borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <h5 className="mb-1 fw-bold">Status</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                Ativar ou desativar o desconto atacado
              </p>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`btn btn-sm rounded-pill px-3 ${form.isActive ? 'btn-success' : 'btn-outline-secondary'}`}
            >
              {form.isActive ? '✓ Ativo' : 'Desativado'}
            </button>
          </div>

          {/* Min Quantity */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Quantidade mínima de peças
            </label>
            <input
              type="number"
              className="form-control"
              style={{ maxWidth: 200, borderRadius: 10 }}
              value={form.minQuantity}
              onChange={(e) => setForm(f => ({ ...f, minQuantity: parseInt(e.target.value) || 1 }))}
              min={1}
            />
            <small className="text-muted">
              O desconto ativa quando o carrinho atinge esta quantidade
            </small>
          </div>

          {/* Discount Rates */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Percentuais de Desconto</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fa-brands fa-pix" style={{ color: '#32BCAD' }}></i>
                  PIX
                </label>
                <div className="input-group" style={{ maxWidth: 160 }}>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderRadius: '10px 0 0 10px' }}
                    value={form.discountRates.pix}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      discountRates: { ...f.discountRates, pix: parseFloat(e.target.value) || 0 }
                    }))}
                    min={0}
                    max={100}
                  />
                  <span className="input-group-text" style={{ borderRadius: '0 10px 10px 0' }}>%</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-credit-card" style={{ color: '#6366f1' }}></i>
                  Débito
                </label>
                <div className="input-group" style={{ maxWidth: 160 }}>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderRadius: '10px 0 0 10px' }}
                    value={form.discountRates.debit}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      discountRates: { ...f.discountRates, debit: parseFloat(e.target.value) || 0 }
                    }))}
                    min={0}
                    max={100}
                  />
                  <span className="input-group-text" style={{ borderRadius: '0 10px 10px 0' }}>%</span>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <i className="fas fa-credit-card" style={{ color: '#f59e0b' }}></i>
                  Crédito
                </label>
                <div className="input-group" style={{ maxWidth: 160 }}>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderRadius: '10px 0 0 10px' }}
                    value={form.discountRates.credit}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      discountRates: { ...f.discountRates, credit: parseFloat(e.target.value) || 0 }
                    }))}
                    min={0}
                    max={100}
                  />
                  <span className="input-group-text" style={{ borderRadius: '0 10px 10px 0' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Block Coupon Toggle */}
          <div className="d-flex align-items-center justify-content-between mb-4 py-3"
            style={{ borderTop: '1px solid #f0f0f0' }}>
            <div>
              <h6 className="mb-1 fw-bold">Bloquear cupons</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
                Quando ativo, cupons de desconto não acumulam com o atacado
              </p>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, blockCoupon: !f.blockCoupon }))}
              className={`btn btn-sm rounded-pill px-3 ${form.blockCoupon ? 'btn-warning' : 'btn-outline-secondary'}`}
            >
              {form.blockCoupon ? 'Bloqueando' : 'Permitir'}
            </button>
          </div>

          {/* Preview */}
          <div style={{
            padding: '16px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
            border: '1px solid #e0f2fe', marginBottom: 20,
          }}>
            <h6 className="fw-bold mb-2" style={{ color: '#0369a1' }}>
              📋 Preview da regra
            </h6>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
              {form.isActive ? (
                <>
                  A partir de <strong>{form.minQuantity} peças</strong> no carrinho:
                  {' '}<strong>{form.discountRates.pix}%</strong> no PIX,
                  {' '}<strong>{form.discountRates.debit}%</strong> no Débito,
                  {' '}<strong>{form.discountRates.credit}%</strong> no Crédito.
                  {form.blockCoupon && ' Cupons bloqueados.'}
                </>
              ) : (
                <span className="text-muted">Desconto atacado está desativado.</span>
              )}
            </p>
          </div>

          {/* Save Button */}
          <button
            className="btn btn-dark rounded-pill px-4 py-2 fw-bold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Salvar Configuração
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WholesaleSettings;
