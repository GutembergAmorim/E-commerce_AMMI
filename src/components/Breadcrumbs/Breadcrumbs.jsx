import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const routeNameMap = {
  cart: 'Carrinho',
  login: 'Entrar',
  register: 'Cadastrar',
  collections: 'Coleções',
  product: 'Produto',
  checkout: 'Finalizar Compra',
  profile: 'Minha Conta',
  about: 'Sobre',
  admin: 'Administração',
  dashboard: 'Painel',
  orders: 'Pedidos'
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Não mostrar na Home
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <div className="container mt-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
          </li>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const name = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

            return isLast ? (
              <li className="breadcrumb-item active text-dark fw-bold" key={to} aria-current="page">
                {name}
              </li>
            ) : (
              <li className="breadcrumb-item" key={to}>
                <Link to={to} className="text-decoration-none text-muted">{name}</Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
