// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [ordersCount, setOrdersCount] = useState(0);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    {
      path: '/profile',
      icon: <User size={20} />,
      label: 'Meus Dados',
      description: 'Gerencie suas informações pessoais'
    },
    {
      path: '/profile/orders',
      icon: <Package size={20} />,
      label: 'Meus Pedidos',
      description: 'Histórico e status dos pedidos'
    },
    {
      path: '/profile/addresses',
      icon: <MapPin size={20} />,
      label: 'Endereços',
      description: 'Gerencie seus endereços de entrega'
    },
    {
      path: '/profile/settings',
      icon: <Settings size={20} />,
      label: 'Configurações',
      description: 'Preferências da conta'
    }
  ];

  useEffect(() => {
    fetchOrdersCount();
  }, []);

  const fetchOrdersCount = async () => {
    try {
      const response = await api.get('/orders');
      setOrdersCount(response.data.data.length);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <div className="d-flex align-items-center">
                <div className="bg-white rounded-circle p-2 me-3">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0">{user?.name}</h6>
                  <small>{user?.email}</small>
                </div>
              </div>
            </div>
            
            <div className="list-group list-group-flush">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                >
                  <span className="me-3">{item.icon}</span>
                  <div>
                    <div className="fw-medium">{item.label}</div>
                    <small className={`${isActive(item.path) ? 'text-white' : 'text-muted'}`}>
                      {item.description}
                    </small>
                  </div>
                </Link>
              ))}
              
              <button
                onClick={logout}
                className="list-group-item list-group-item-action d-flex align-items-center text-danger"
              >
                <LogOut size={20} className="me-3" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Resumo Rápido */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title">Resumo da Conta</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Pedidos</span>
                <span className="fw-bold text-primary">{ordersCount}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Membro desde</span>
                <span className="fw-bold">
                  {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;