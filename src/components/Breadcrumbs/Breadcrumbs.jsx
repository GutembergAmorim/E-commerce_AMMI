import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productService } from '../../services/productService';

const routeNameMap = {
  cart: 'Carrinho',
  login: 'Entrar',
  register: 'Cadastrar',
  collections: 'Coleções',
  product: 'Produto',
  products: 'Produtos',
  checkout: 'Finalizar Compra',
  profile: 'Minha Conta',
  about: 'Sobre',
  admin: 'Administração',
  dashboard: 'Painel',
  orders: 'Pedidos'
};

// Detecta se um segmento parece um MongoDB ObjectId (24 caracteres hex)
const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [productName, setProductName] = useState(null);

  // Buscar nome do produto quando a URL contém um ID de produto
  useEffect(() => {
    const productIndex = pathnames.indexOf('products');
    if (productIndex !== -1 && pathnames[productIndex + 1] && isObjectId(pathnames[productIndex + 1])) {
      const productId = pathnames[productIndex + 1];
      setProductName(null);
      productService.getProductById(productId)
        .then((response) => {
          if (response.success && response.data) {
            setProductName(response.data.name || null);
          }
        })
        .catch(() => setProductName(null));
    } else {
      setProductName(null);
    }
  }, [location.pathname]);

  // Não mostrar na Home
  if (pathnames.length === 0) {
    return null;
  }

  const getDisplayName = (value, index) => {
    // Se o segmento anterior é "products" e este é um ObjectId, usar o nome do produto
    if (isObjectId(value) && index > 0 && pathnames[index - 1] === 'products') {
      return productName || 'Carregando...';
    }
    return routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
  };

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
            const name = getDisplayName(value, index);

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
