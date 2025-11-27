// src/pages/profile/ProfileSettings.jsx
import React, { useState } from 'react';
import { Settings, Bell, Shield, Mail } from 'lucide-react';

const ProfileSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    promotionalEmails: false,
    smsNotifications: true,
    twoFactorAuth: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Settings size={24} className="text-primary me-2" />
        <h4 className="mb-0">Configurações</h4>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Notificações por Email */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <Mail size={20} className="text-primary me-2" />
                <h6 className="mb-0">Notificações por Email</h6>
              </div>
            </div>
            <div className="card-body">
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <label className="form-check-label">
                  Notificações de pedidos
                </label>
                <small className="form-text text-muted d-block">
                  Receba atualizações sobre seus pedidos por email
                </small>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.promotionalEmails}
                  onChange={() => handleToggle('promotionalEmails')}
                />
                <label className="form-check-label">
                  Emails promocionais
                </label>
                <small className="form-text text-muted d-block">
                  Receba ofertas e novidades da loja
                </small>
              </div>
            </div>
          </div>

          {/* Outras Configurações */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <Bell size={20} className="text-primary me-2" />
                <h6 className="mb-0">Outras Notificações</h6>
              </div>
            </div>
            <div className="card-body">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
                <label className="form-check-label">
                  Notificações por SMS
                </label>
                <small className="form-text text-muted d-block">
                  Receba atualizações importantes por SMS
                </small>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <Shield size={20} className="text-primary me-2" />
                <h6 className="mb-0">Segurança</h6>
              </div>
            </div>
            <div className="card-body">
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <label className="form-check-label">
                  Autenticação de dois fatores
                </label>
                <small className="form-text text-muted d-block">
                  Aumente a segurança da sua conta
                </small>
              </div>

              <div className="mt-4">
                <button className="btn btn-outline-primary me-2">
                  Alterar Senha
                </button>
                <button className="btn btn-outline-danger">
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;