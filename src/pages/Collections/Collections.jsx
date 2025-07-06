import React, { useState } from "react";
import produtos from "../../Data/products.jsx";
import { Link } from "react-router-dom";
import "./style.css";

function Collections() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Extrai categorias unicas dos produtos e adiciona "Todos"
  const categories = ["Todos", ...new Set(produtos.map((p) => p.category))];

  const filteredProducts =
    activeCategory === "Todos"
      ? produtos
      : produtos.filter(
          (product) =>
            product.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Nossa Coleção</h1>
        <p className="lead text-muted">
          Explore nossos produtos e encontre o look perfeito para seu treino.
        </p>
      </div>

      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        {categories.map((category) => (
          <button
            key={category}
            className={`btn btn-outline-secondary rounded-pill px-4 ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {filteredProducts.map((product) => (
          <div className="col" key={product.id}>
            <div className="card h-100 product-card-custom border-0 shadow-sm">
              <Link
                to={`/products/${product.id}`}
                className="text-decoration-none"
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
                    alt={product.alt}
                    className="w-100 h-100 pt-2 object-fit-cover"
                    style={{ objectFit: "cover" }}
                  />
                  {product.isNew && (
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-custom-pink rounded-pill small px-2 py-1 fw-medium">
                        NOVO
                      </span>
                    </div>
                  )}
                  {/* <button className="btn btn-light btn-sm rounded-pill position-absolute top-0 end-0 m-2 shadow-sm">
                    <i className="fas fa-heart text-muted"></i>
                  </button> */}
                </div>
                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h3 className="h6 card-title fw-medium mb-1 text-dark">
                        {product.name}
                      </h3>
                      <p className="card-text small text-muted">
                        {product.description}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-auto">
                    <div>
                      <span className="fw-bold fs-5 text-dark">{`R$ ${product.price
                        .toFixed(2)
                        .replace(".", ",")}`}</span>
                      {product.oldPrice && (
                        <span className="text-muted text-decoration-line-through ms-2">
                          {`R$ ${product.oldPrice
                            .toFixed(2)
                            .replace(".", ",")}`}
                        </span>
                      )}
                    </div>
                    <button className="btn btn-custom-pink rounded-pill px-3">
                      <i className="fas fa-shopping-bag"></i>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Collections;
