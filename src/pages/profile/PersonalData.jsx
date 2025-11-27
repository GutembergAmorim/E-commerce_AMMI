// src/pages/profile/PersonalData.jsx
import React, { useState } from 'react';
import { User, Save, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';

const PersonalData = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.data);
      setMessage('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setMessage('Erro ao atualizar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <User size={24} className="text-primary me-2" />
        <h4 className="mb-0">Meus Dados Pessoais</h4>
      </div>

      {message && (
        <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="name" className="form-label">
              Nome Completo *
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="email" className="form-label">
              <Mail size={16} className="me-1" />
              E-mail *
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="phone" className="form-label">
              <Phone size={16} className="me-1" />
              Telefone
            </label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="cpf" className="form-label">
              CPF
            </label>
            <input
              type="text"
              className="form-control"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Save size={16} className="me-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalData;