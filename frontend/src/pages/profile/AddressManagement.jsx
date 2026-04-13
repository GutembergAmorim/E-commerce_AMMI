import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, X, Star, Search } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';
import axios from 'axios';
import './Profile.css';

const emptyAddress = {
  name: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  isDefault: false,
};

const AddressManagement = () => {
  const { user, updateUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const loadAddresses = () => {
    setAddresses(user?.addresses || []);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const lookupCep = async () => {
    const cep = formData.postalCode.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.data.erro) {
        setFormData(prev => ({
          ...prev,
          address: res.data.logradouro || prev.address,
          neighborhood: res.data.bairro || prev.neighborhood,
          city: res.data.localidade || prev.city,
          state: res.data.uf || prev.state,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setLoadingCep(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyAddress, isDefault: addresses.length === 0 });
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr._id || addr.name);
    setFormData({ ...addr });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updatedAddresses;
      if (editingId) {
        updatedAddresses = addresses.map(a =>
          (a._id || a.name) === editingId ? { ...formData } : a
        );
      } else {
        updatedAddresses = [...addresses, { ...formData, _id: Date.now().toString() }];
      }

      // If this is default, unmark others
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(a =>
          (a._id || a.name) === (editingId || formData._id || updatedAddresses[updatedAddresses.length - 1]._id)
            ? a
            : { ...a, isDefault: false }
        );
      }

      const response = await api.put('/users/profile', { addresses: updatedAddresses });
      updateUser(response.data.data);
      setShowForm(false);
      showNotification(editingId ? '✅ Endereço atualizado!' : '✅ Endereço adicionado!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao salvar endereço', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este endereço?')) return;
    try {
      const updatedAddresses = addresses.filter(a => (a._id || a.name) !== id);
      const response = await api.put('/users/profile', { addresses: updatedAddresses });
      updateUser(response.data.data);
      showNotification('Endereço excluído', 'success');
    } catch (error) {
      showNotification('Erro ao excluir endereço', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const updatedAddresses = addresses.map(a => ({
        ...a,
        isDefault: (a._id || a.name) === id,
      }));
      const response = await api.put('/users/profile', { addresses: updatedAddresses });
      updateUser(response.data.data);
      showNotification('Endereço definido como principal', 'success');
    } catch (error) {
      showNotification('Erro ao atualizar', 'error');
    }
  };

  return (
    <div>
      {/* Toast */}
      {notification.show && (
        <div className={`checkout-toast checkout-toast--${notification.type} checkout-toast--visible`} role="alert">
          <span>{notification.message}</span>
          <button className="checkout-toast__close" onClick={() => setNotification({ show: false, message: '', type: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="profile-page-title">Meus Endereços</h2>
          <p className="profile-page-subtitle" style={{ margin: 0 }}>{addresses.length} endereço(s) cadastrado(s)</p>
        </div>
        <button className="admin-link-btn" onClick={openAdd}>
          <Plus size={14} /> Novo Endereço
        </button>
      </div>

      {/* Address Cards */}
      <div className="row g-3">
        {addresses.map((addr) => (
          <div key={addr._id || addr.name} className="col-md-6">
            <div className={`profile-address ${addr.isDefault ? 'profile-address--default' : ''}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <h3 className="profile-address__name">{addr.name || 'Endereço'}</h3>
                  {addr.isDefault && (
                    <span className="admin-badge admin-badge--paid" style={{ fontSize: '0.65rem' }}>
                      <Star size={10} /> Principal
                    </span>
                  )}
                </div>
              </div>
              <p className="profile-address__text">
                {addr.address}, {addr.number}
                {addr.complement && <> — {addr.complement}</>}
                <br />
                {addr.neighborhood}, {addr.city} - {addr.state}
                <br />
                CEP: {addr.postalCode}
              </p>
              <div className="profile-address__actions">
                {!addr.isDefault && (
                  <button className="admin-link-btn" onClick={() => handleSetDefault(addr._id || addr.name)}>
                    <Star size={12} /> Definir Principal
                  </button>
                )}
                <button className="admin-link-btn" onClick={() => openEdit(addr)}>
                  <Edit size={12} /> Editar
                </button>
                <button
                  className="admin-link-btn"
                  style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                  onClick={() => handleDelete(addr._id || addr.name)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && !showForm && (
        <div className="profile-card">
          <div className="profile-card__body" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#f5f5f5',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12, color: '#ccc',
            }}>
              <MapPin size={24} />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
              Nenhum endereço cadastrado
            </p>
            <p style={{ fontSize: '0.82rem', color: '#999', margin: '0 0 16px' }}>
              Adicione um endereço para facilitar suas compras.
            </p>
            <button
              className="checkout-btn checkout-btn--primary"
              style={{ width: 'auto', display: 'inline-flex', padding: '10px 28px' }}
              onClick={openAdd}
            >
              <Plus size={16} /> Adicionar Primeiro Endereço
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="profile-card"
            style={{ width: '100%', maxWidth: 520, margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-card__header" style={{ justifyContent: 'space-between' }}>
              <h2 className="profile-card__title">
                {editingId ? 'Editar Endereço' : 'Novo Endereço'}
              </h2>
              <button
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                onClick={() => setShowForm(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="profile-card__body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="checkout-label">Nome do Endereço *</label>
                    <input className="form-control checkout-input" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Casa, Trabalho" required />
                  </div>
                  <div className="col-md-6">
                    <label className="checkout-label">CEP *</label>
                    <div className="input-group">
                      <input
                        className="form-control checkout-input"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        onBlur={lookupCep}
                        placeholder="00000-000"
                        required
                      />
                      <button
                        type="button"
                        className="admin-link-btn"
                        style={{ borderRadius: '0 10px 10px 0' }}
                        onClick={lookupCep}
                        disabled={loadingCep}
                      >
                        {loadingCep ? <span className="spinner-border spinner-border-sm" /> : <Search size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <label className="checkout-label">Rua *</label>
                    <input className="form-control checkout-input" name="address" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Número *</label>
                    <input className="form-control checkout-input" name="number" value={formData.number} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Complemento</label>
                    <input className="form-control checkout-input" name="complement" value={formData.complement} onChange={handleChange} placeholder="Apto, Bloco..." />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Bairro *</label>
                    <input className="form-control checkout-input" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Cidade *</label>
                    <input className="form-control checkout-input" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="checkout-label">Estado *</label>
                    <input className="form-control checkout-input" name="state" value={formData.state} onChange={handleChange} maxLength={2} required />
                  </div>
                  <div className="col-12">
                    <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: '#1a1a1a' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Definir como endereço principal</span>
                    </label>
                  </div>
                </div>
              </div>
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
                <button type="button" className="admin-link-btn" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }} onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="checkout-btn checkout-btn--primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm" /> Salvando...</>
                  ) : (
                    editingId ? 'Atualizar Endereço' : 'Adicionar Endereço'
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

export default AddressManagement;