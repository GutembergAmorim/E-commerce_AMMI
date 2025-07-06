import React from "react";
import "./ProductCard.css"; // Criaremos este arquivo para estilos customizados
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  // Função para navegar para a página de detalhes do produto
  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };
  // Verifica se o click foi feito no card do produto e n'ao nos botões de favoritar ou adicionar ao carrinho
  const handleCardClick = (event) => {
    // Verifica se o alvo do evento é um botão, se for, não navega
    if (event.target.closest("button")) {
      return;
    }
    handleProductClick();
  };

  return (
    <div
      role="button"
      onClick={handleCardClick}
      tabIndex="0"
      className="card h-100 product-card-custom border-0 shadow-sm"
    >
      <div
        className="position-relative overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0]
              : "https://via.placeholder.com/300x400?text=Sem+Imagem"
          } 
          alt={product.alt || product.name} // Adicionado fallback para alt
          className="w-100 h-100 pt-2 object-fit-cover"
        />
        {/* --- BADGE DE NOVO PRODUTO --- */}
        {product.isNew && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-custom-pink rounded-pill small px-2 py-1 fw-medium">
              NOVO
            </span>
          </div>
        )}
        {/* --- BOTÃO DE FAVORITAR --- */}
        {/* <button className="btn btn-light btn-sm rounded-pill position-absolute top-0 end-0 m-2 shadow-sm">
          <i className="fas fa-heart text-muted"></i>
        </button> */}
      </div>

      <div className="card-body p-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h3 className="h6 card-title fw-medium mb-1">{product.name}</h3>
            <p className="card-text small text-muted">{product.description}</p>
          </div>

          {/* --- BADGE DE STATUS (EX: EM ESTOQUE) --- */}
          {product.status && (
            <span
              className={`badge rounded-pill small px-2 py-1 flex-shrink-0 ms-2 ${product.statusColor} ${product.statusTextColor}`}
            >
              {product.status}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-between mt-auto">
          <div>
            <span className="fw-bold fs-5">{`R$ ${product.price
              .toFixed(2)
              .replace(".", ",")}`}</span>
            {product.oldPrice && (
              <span className="text-muted small text-decoration-line-through ms-2">
                {`R$ ${product.oldPrice.toFixed(2).replace(".", ",")}`}
              </span>
            )}
          </div>

          {/* --- BOTÃO DE ADICIONAR AO CARRINHO --- */}
          <button className="btn btn-custom-pink btn-sm rounded-pill p-2 lh-1">
            <i className="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
