import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Tag, Save, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../../services/api';
import './AdminDashboard.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const defaultForm = {
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
    description: '',
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchCoupons(); }, []);

  const showNotif = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error('Erro ao buscar cupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() || '',
      minOrderValue: coupon.minOrderValue?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive,
      description: coupon.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
        description: form.description,
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
        showNotif(`Cupom "${payload.code}" atualizado!`);
      } else {
        await api.post('/coupons', payload);
        showNotif(`Cupom "${payload.code}" criado!`);
      }

      setShowModal(false);
      await fetchCoupons();
    } catch (err) {
      showNotif(err.response?.data?.message || 'Erro ao salvar cupom', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cupom "${coupon.code}"?`)) return;
    try {
      await api.delete(`/coupons/${coupon._id}`);
      showNotif(`Cupom "${coupon.code}" excluído`);
      await fetchCoupons();
    } catch (err) {
      showNotif('Erro ao excluir cupom', 'error');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      await fetchCoupons();
      showNotif(`Cupom "${coupon.code}" ${!coupon.isActive ? 'ativado' : 'desativado'}`);
    } catch (err) {
      showNotif('Erro ao atualizar status', 'error');
    }
  };

  const isExpired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();
  const isMaxedOut = (c) => c.maxUses && c.usedCount >= c.maxUses;

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>Carregando cupons...</p>
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
            style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}
          >
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </Link>
          <h1 className="admin-header__title">Cupons de Desconto</h1>
          <p className="admin-header__subtitle">
            {coupons.length} cupom(ns) cadastrado(s) • {coupons.filter(c => c.isActive && !isExpired(c) && !isMaxedOut(c)).length} ativo(s)
          </p>
        </div>
        <button className="checkout-btn checkout-btn--primary" onClick={openCreateModal}>
          <Plus size={14} /> Novo Cupom
        </button>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-card__body">
          {coupons.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon"><Tag size={24} /></div>
              <p className="admin-empty__text">Nenhum cupom cadastrado</p>
              <button className="btn btn-dark rounded-pill btn-sm px-4 mt-2" onClick={openCreateModal}>
                Criar primeiro cupom
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Desconto</th>
                    <th>Pedido Mín.</th>
                    <th>Uso</th>
                    <th>Expira em</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const expired = isExpired(coupon);
                    const maxedOut = isMaxedOut(coupon);

                    return (
                      <tr key={coupon._id} style={{ opacity: (!coupon.isActive || expired || maxedOut) ? 0.55 : 1 }}>
                        <td>
                          <strong style={{ fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: 1 }}>
                            {coupon.code}
                          </strong>
                          {coupon.description && (
                            <div style={{ fontSize: '0.72rem', color: '#999' }}>{coupon.description}</div>
                          )}
                        </td>
                        <td>
                          <span className="admin-badge admin-badge--paid">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `R$ ${coupon.discountValue.toFixed(2)}`}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {coupon.minOrderValue > 0 ? `R$ ${coupon.minOrderValue.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {coupon.expiresAt
                            ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR')
                            : 'Sem limite'}
                        </td>
                        <td>
                          {expired ? (
                            <span className="admin-badge admin-badge--cancelled">Expirado</span>
                          ) : maxedOut ? (
                            <span className="admin-badge admin-badge--cancelled">Esgotado</span>
                          ) : coupon.isActive ? (
                            <span className="admin-badge admin-badge--paid">Ativo</span>
                          ) : (
                            <span className="admin-badge admin-badge--pending">Inativo</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="admin-link-btn" onClick={() => toggleActive(coupon)} title={coupon.isActive ? 'Desativar' : 'Ativar'}>
                              {coupon.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            </button>
                            <button className="admin-link-btn" onClick={() => openEditModal(coupon)} title="Editar">
                              <Pencil size={13} />
                            </button>
                            <button className="admin-link-btn" onClick={() => handleDelete(coupon)} title="Excluir" style={{ color: '#dc2626' }}>
                              <Trash2 size={13} />
                            </button>
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

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-card"
            style={{ width: '100%', maxWidth: 500, animation: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }} onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-card__body--padded">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="checkout-label">Código *</label>
                    <input
                      className="form-control checkout-input"
                      value={form.code}
                      onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="EX: AMMI10"
                      required
                      style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="checkout-label">Tipo</label>
                    <select className="form-select checkout-input" value={form.discountType} onChange={(e) => setForm(p => ({ ...p, discountType: e.target.value }))}>
                      <option value="percentage">%</option>
                      <option value="fixed">R$</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="checkout-label">Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control checkout-input"
                      value={form.discountValue}
                      onChange={(e) => setForm(p => ({ ...p, discountValue: e.target.value }))}
                      placeholder={form.discountType === 'percentage' ? '10' : '25.00'}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="checkout-label">Pedido Mínimo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control checkout-input"
                      value={form.minOrderValue}
                      onChange={(e) => setForm(p => ({ ...p, minOrderValue: e.target.value }))}
                      placeholder="0 = sem mínimo"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="checkout-label">Usos Máximos</label>
                    <input
                      type="number"
                      className="form-control checkout-input"
                      value={form.maxUses}
                      onChange={(e) => setForm(p => ({ ...p, maxUses: e.target.value }))}
                      placeholder="Vazio = ilimitado"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="checkout-label">Data de Expiração</label>
                    <input
                      type="date"
                      className="form-control checkout-input"
                      value={form.expiresAt}
                      onChange={(e) => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', paddingBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
                        style={{ width: 16, height: 16, accentColor: '#1a1a1a' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ativo</span>
                    </label>
                  </div>
                  <div className="col-12">
                    <label className="checkout-label">Descrição (opcional)</label>
                    <input
                      className="form-control checkout-input"
                      value={form.description}
                      onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Ex: Cupom de boas-vindas"
                    />
                  </div>
                </div>
              </div>
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                <button
                  type="button" className="admin-link-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="checkout-btn checkout-btn--primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm" role="status"></span> Salvando...</>
                  ) : (
                    <><Save size={14} /> {editingCoupon ? 'Salvar' : 'Criar Cupom'}</>
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

export default CouponManagement;
