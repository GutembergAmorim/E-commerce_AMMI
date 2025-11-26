import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { _id, name, price, oldPrice, images, isNew, description } = product;

  // Formatar preço
  const formatPrice = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="product-card-wrapper h-100">
      <Link to={`/products/${_id}`} className="text-decoration-none">
        <div className="product-card shadow-sm border-0 h-100 d-flex flex-column">
          
          {/* Container da Imagem */}
          <div className="product-image-container">
            <img
              src={images?.[0] || "https://via.placeholder.com/300x400?text=Sem+Imagem"}
              alt={name}
              className="product-image"
            />
            
            {/* Badges */}
            {isNew && (
              <span className="product-badge badge-new">NOVO</span>
            )}
            {oldPrice && (
              <span className="product-badge badge-sale">OFERTA</span>
            )}

            {/* Overlay com Ações (opcional, aparece no hover) */}
            <div className="product-overlay">
              <button className="btn btn-light rounded-circle shadow-sm p-2">
                <i className="fas fa-search text-dark"></i>
              </button>
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="card-body p-3 d-flex flex-column flex-grow-1">
            <h3 className="product-title text-truncate-2">{name}</h3>
            
            {/* <p className="product-description text-muted small text-truncate-2 mb-2">
              {description}
            </p> */}

            <div className="mt-auto pt-2">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="product-price">{formatPrice(price)}</span>
                {oldPrice && (
                  <span className="product-old-price">{formatPrice(oldPrice)}</span>
                )}
              </div>
              
              <button className="btn btn-custom-primary w-100 mt-3 rounded-pill btn-sm fw-medium">
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
