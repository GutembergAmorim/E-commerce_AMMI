import React, { useState } from 'react';
import { Settings, Bell, Shield, Mail, Eye, EyeOff, X, Lock } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';
import './Profile.css';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    promotionalEmails: user?.settings?.promotionalEmails ?? false,
    smsNotifications: user?.settings?.smsNotifications ?? true,
    twoFactorAuth: user?.settings?.twoFactorAuth ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleToggle = async (setting) => {
    const updated = { ...settings, [setting]: !settings[setting] };
    setSettings(updated);
    setSaving(true);
    try {
      const response = await api.put('/users/profile', { settings: updated });
      updateUser(response.data.data);
      showNotification('Configuração atualizada', 'success');
    } catch (error) {
      setSettings(settings); // rollback
      showNotification('Erro ao salvar configuração', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification('A nova senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/users/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showNotification('✅ Senha alterada com sucesso!', 'success');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao alterar senha', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const settingSections = [
    {
      title: 'Notificações por Email',
      icon: <Mail size={16} />,
      bg: '#dbeafe',
      color: '#2563eb',
      items: [
        { key: 'emailNotifications', label: 'Notificações de pedidos', desc: 'Receba atualizações sobre seus pedidos por email' },
        { key: 'promotionalEmails', label: 'Emails promocionais', desc: 'Receba ofertas e novidades da loja' },
      ]
    },
    {
      title: 'Outras Notificações',
      icon: <Bell size={16} />,
      bg: '#fef3c7',
      color: '#d97706',
      items: [
        { key: 'smsNotifications', label: 'Notificações por SMS', desc: 'Receba atualizações importantes por SMS' },
      ]
    },
  ];

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

      <h2 className="profile-page-title">Configurações</h2>
      <p className="profile-page-subtitle">Gerencie suas preferências e segurança</p>

      {/* Notification Sections */}
      {settingSections.map((section) => (
        <div key={section.title} className="profile-card">
          <div className="profile-card__header">
            <div className="profile-card__header-icon" style={{ background: section.bg, color: section.color }}>
              {section.icon}
            </div>
            <h3 className="profile-card__title">{section.title}</h3>
          </div>
          <div className="profile-card__body">
            {section.items.map((item) => (
              <div key={item.key} className="profile-setting">
                <div className="profile-setting__info">
                  <p className="profile-setting__label">{item.label}</p>
                  <p className="profile-setting__desc">{item.desc}</p>
                </div>
                <div className="form-check form-switch" style={{ margin: 0, padding: 0 }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={settings[item.key]}
                    onChange={() => handleToggle(item.key)}
                    disabled={saving}
                    style={{ marginLeft: 0, cursor: 'pointer', width: 42, height: 22 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Security Section */}
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__header-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Shield size={16} />
          </div>
          <h3 className="profile-card__title">Segurança</h3>
        </div>
        <div className="profile-card__body">
          <div className="profile-setting">
            <div className="profile-setting__info">
              <p className="profile-setting__label">Autenticação de dois fatores</p>
              <p className="profile-setting__desc">Aumente a segurança da sua conta</p>
            </div>
            <div className="form-check form-switch" style={{ margin: 0, padding: 0 }}>
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={settings.twoFactorAuth}
                onChange={() => handleToggle('twoFactorAuth')}
                disabled={saving}
                style={{ marginLeft: 0, cursor: 'pointer', width: 42, height: 22 }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ paddingTop: 16 }}>
            {!showPasswordForm ? (
              <div className="d-flex gap-2 flex-wrap">
                <button className="admin-link-btn" onClick={() => setShowPasswordForm(true)}>
                  <Lock size={13} /> Alterar Senha
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div
                  style={{ background: '#fafafa', borderRadius: 12, padding: 16, marginBottom: 12 }}
                >
                  <div className="row g-3">
                    {[
                      { key: 'current', name: 'currentPassword', label: 'Senha Atual' },
                      { key: 'new', name: 'newPassword', label: 'Nova Senha' },
                      { key: 'confirm', name: 'confirmPassword', label: 'Confirmar Nova Senha' },
                    ].map((field) => (
                      <div key={field.key} className="col-md-4">
                        <label className="checkout-label">{field.label}</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPasswords[field.key] ? 'text' : 'password'}
                            className="form-control checkout-input"
                            value={passwordData[field.name]}
                            onChange={(e) => setPasswordData({ ...passwordData, [field.name]: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                            style={{
                              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                              border: 'none', background: 'transparent', cursor: 'pointer', color: '#999',
                            }}
                          >
                            {showPasswords[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="admin-link-btn" onClick={() => setShowPasswordForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="checkout-btn checkout-btn--primary" style={{ width: 'auto', padding: '8px 24px' }} disabled={changingPassword}>
                    {changingPassword ? (
                      <><span className="spinner-border spinner-border-sm" /> Alterando...</>
                    ) : (
                      'Alterar Senha'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;