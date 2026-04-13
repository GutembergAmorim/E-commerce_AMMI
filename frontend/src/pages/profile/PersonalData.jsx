import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, Save, X } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';
import './Profile.css';

const PersonalData = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.data);
      showNotification('✅ Dados atualizados com sucesso!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao atualizar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Nome Completo', type: 'text', icon: <User size={15} />, required: true },
    { name: 'email', label: 'E-mail', type: 'email', icon: <Mail size={15} />, required: true },
    { name: 'phone', label: 'Telefone', type: 'tel', icon: <Phone size={15} />, placeholder: '(11) 99999-9999' },
    { name: 'cpf', label: 'CPF', type: 'text', icon: <CreditCard size={15} />, placeholder: '000.000.000-00' },
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

      <h2 className="profile-page-title">Meus Dados Pessoais</h2>
      <p className="profile-page-subtitle">Atualize suas informações de cadastro</p>

      <form onSubmit={handleSubmit}>
        <div className="profile-card">
          <div className="profile-card__body">
            <div className="row g-3">
              {fields.map((field) => (
                <div key={field.name} className="col-md-6">
                  <label className="checkout-label d-flex align-items-center gap-1">
                    {field.icon} {field.label} {field.required && '*'}
                  </label>
                  <input
                    type={field.type}
                    className="form-control checkout-input"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="checkout-btn checkout-btn--primary"
          style={{ maxWidth: 280 }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} /> Salvar Alterações
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PersonalData;