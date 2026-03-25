import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StarRating from "../StarRating/StarRating";
import { productService } from "../../services/productService";

const RelatedProducts = ({ currentProductId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await productService.getProducts({ category, limit: 8 });
        const list = res.data || res;
        // Filter out current product
        const filtered = (Array.isArray(list) ? list : [])
          .filter((p) => p._id !== currentProductId)
          .slice(0, 4);
        setProducts(filtered);
      } catch (err) {
        console.error("Erro ao buscar relacionados:", err);
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchRelated();
  }, [currentProductId, category]);

  if (loading || products.length === 0) return null;

  const formatPrice = (v) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div style={{ marginTop: 48, marginBottom: 24 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
          Você também pode gostar
        </h3>
        <Link
          to={`/collections?category=${category}`}
          style={{
            fontSize: "0.78rem",
            color: "#888",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Ver mais →
        </Link>
      </div>

      <div className="row g-3">
        {products.map((product) => {
          const isOutOfStock = typeof product.stock === "number" && product.stock === 0;

          return (
            <div className="col-6 col-md-3" key={product._id}>
              <Link
                to={`/products/${product._id}`}
                className="text-decoration-none"
                style={{ display: "block" }}
              >
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#fff",
                    border: "1px solid #f0f0f0",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    opacity: isOutOfStock ? 0.55 : 1,
                  }}
                  className="related-card"
                >
                  {/* Image */}
                  <div
                    style={{
                      aspectRatio: "3/4",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/300x400?text=Sem+Imagem"
                      }
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s",
                      }}
                    />
                    {isOutOfStock && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          background: "#1a1a1a",
                          color: "#fff",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          letterSpacing: 0.5,
                        }}
                      >
                        ESGOTADO
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </p>

                    {product.numReviews > 0 && (
                      <div style={{ marginBottom: 2 }}>
                        <StarRating
                          rating={product.averageRating || 0}
                          size={10}
                          count={product.numReviews}
                        />
                      </div>
                    )}

                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#bbb",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <style>{`
        .related-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }
        .related-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default RelatedProducts;
