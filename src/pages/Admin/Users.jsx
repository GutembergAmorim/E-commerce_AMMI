import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users as UsersIcon, Search, Shield, Trash2,
  CheckCircle, XCircle, X, ArrowLeft
} from 'lucide-react';
import { userService } from '../../services/userService';
import './AdminDashboard.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await userService.list();
      if (res.success) setUsers(res.data);
      else showNotification(res.message || 'Erro ao carregar usuários', 'error');
    } catch (err) {
      showNotification(err?.response?.data?.message || err.message || 'Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChangeRole = async (id, role) => {
    try {
      await userService.setRole(id, role);
      await load();
      showNotification(`Papel atualizado para "${role}"`, 'success');
    } catch (err) {
      showNotification(err?.response?.data?.message || err.message, 'error');
    }
  };

  const onToggleActive = async (id, isActive) => {
    try {
      await userService.setStatus(id, isActive);
      await load();
      showNotification(isActive ? 'Usuário ativado' : 'Usuário desativado', 'success');
    } catch (err) {
      showNotification(err?.response?.data?.message || err.message, 'error');
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await userService.remove(id);
      await load();
      showNotification('Usuário excluído', 'success');
    } catch (err) {
      showNotification(err?.response?.data?.message || err.message, 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive !== false).length;

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
          <p className="mt-2" style={{ fontSize: '0.85rem', color: '#999' }}>Carregando usuários...</p>
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
        <h1 className="admin-header__title">Gerenciar Usuários</h1>
        <p className="admin-header__subtitle">{users.length} usuário(s) cadastrado(s)</p>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--blue"><UsersIcon size={18} /></div>
          <p className="admin-stat__value">{users.length}</p>
          <p className="admin-stat__label">Total</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--purple"><Shield size={18} /></div>
          <p className="admin-stat__value">{adminCount}</p>
          <p className="admin-stat__label">Administradores</p>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--green"><CheckCircle size={18} /></div>
          <p className="admin-stat__value">{activeCount}</p>
          <p className="admin-stat__label">Ativos</p>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-card__body--padded">
          <div className="input-group">
            <span className="input-group-text" style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '10px 0 0 10px' }}>
              <Search size={15} color="#999" />
            </span>
            <input
              type="text"
              className="form-control checkout-input"
              style={{ borderRadius: '0 10px 10px 0' }}
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">{filteredUsers.length} resultado(s)</h2>
        </div>
        <div className="admin-card__body">
          {filteredUsers.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon"><UsersIcon size={24} /></div>
              <p className="admin-empty__text">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Papel</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: u.role === 'admin' ? '#ede9fe' : '#f0f0f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: u.role === 'admin' ? '#7c3aed' : '#999',
                              fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                            }}
                          >
                            {u.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#999' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-select checkout-input"
                          style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: '0.78rem' }}
                          value={u.role}
                          onChange={(e) => onChangeRole(u._id, e.target.value)}
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <label
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: 'pointer', margin: 0 }}
                        >
                          <div className="form-check form-switch" style={{ margin: 0, padding: 0 }}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={u.isActive !== false}
                              onChange={(e) => onToggleActive(u._id, e.target.checked)}
                              style={{ marginLeft: 0, cursor: 'pointer' }}
                            />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: u.isActive !== false ? '#16a34a' : '#999' }}>
                            {u.isActive !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        </label>
                      </td>
                      <td>
                        <button
                          className="admin-link-btn"
                          style={{ border: '1px solid #fee2e2', color: '#dc2626' }}
                          onClick={() => onDelete(u._id)}
                        >
                          <Trash2 size={13} /> Excluir
                        </button>
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
  );
};

export default Users;
