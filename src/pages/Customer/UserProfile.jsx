// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, Home } from 'lucide-react';
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
    return location.pathname === path || (path !== '/profile' && location.pathname.startsWith(path));
  };

  const getCurrentPageLabel = () => {
    const currentItem = menuItems.find(item => isActive(item.path));
    return currentItem ? currentItem.label : 'Minha Conta';
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Breadcrumb Section */}
      <div className="bg-white border-bottom shadow-sm mb-4">
        <div className="container py-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted d-flex align-items-center">
                  <Home size={16} className="me-1" /> Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <span className="fw-medium text-dark">{getCurrentPageLabel()}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-4">
              <div className="card-body text-center p-4 bg-white">
                <div className="mb-3 position-relative d-inline-block">
                    <div className="bg-light rounded-circle p-3 d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
                        <User size={40} className="text-primary" />
                    </div>
                </div>
                <h5 className="fw-bold mb-1">{user?.name}</h5>
                <p className="text-muted small mb-0">{user?.email}</p>
              </div>
              
              <div className="list-group list-group-flush border-top">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`list-group-item list-group-item-action border-0 py-3 px-4 d-flex align-items-center justify-content-between ${
                      isActive(item.path) ? 'bg-primary text-white' : 'text-secondary hover-bg-light'
                    }`}
                  >
                    <div className="d-flex align-items-center">
                        <span className="me-3">{item.icon}</span>
                        <span className="fw-medium">{item.label}</span>
                    </div>
                    {isActive(item.path) && <ChevronRight size={16} />}
                  </Link>
                ))}
                
                <button
                  onClick={logout}
                  className="list-group-item list-group-item-action border-0 py-3 px-4 d-flex align-items-center text-danger mt-2 border-top"
                >
                  <LogOut size={20} className="me-3" />
                  <span className="fw-medium">Sair</span>
                </button>
              </div>
            </div>

            {/* Resumo Rápido (Opcional, pode manter ou remover para limpar) */}
            {/* <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Resumo</h6>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Pedidos Realizados</span>
                  <span className="badge bg-primary rounded-pill">{ordersCount}</span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Conteúdo Principal */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-4">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;