import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import StarRating from "../StarRating/StarRating";
import api from "../../services/api";

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [distribution, setDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      if (res.data.success) {
        setReviews(res.data.data);
        setDistribution(res.data.distribution || {});
      }
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecione uma nota");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.post("/reviews", {
        productId,
        rating,
        title,
        comment,
      });

      if (res.data.success) {
        setShowForm(false);
        setRating(0);
        setTitle("");
        setComment("");
        await fetchReviews();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao enviar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  const hasUserReviewed = reviews.some(
    (r) => r.user?._id === user?._id
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 20 }}>
        Avaliações dos Clientes
      </h3>

      {/* Summary Row */}
      <div className="row g-4 mb-4">
        {/* Left: Big number */}
        <div className="col-md-4">
          <div
            style={{
              background: "#fafafa",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1a1a1a" }}>
              {avgRating}
            </div>
            <StarRating rating={parseFloat(avgRating)} size={16} />
            <p style={{ fontSize: "0.78rem", color: "#999", marginTop: 6, marginBottom: 0 }}>
              {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>
        </div>

        {/* Right: Distribution bars */}
        <div className="col-md-8 d-flex flex-column justify-content-center">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div
                key={star}
                className="d-flex align-items-center gap-2"
                style={{ marginBottom: 6 }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 600, width: 14, textAlign: "right" }}>
                  {star}
                </span>
                <i className="fas fa-star" style={{ fontSize: 10, color: "#f59e0b" }}></i>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: "#f0f0f0",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "#f59e0b",
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", color: "#999", width: 24, textAlign: "right" }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button */}
      {isAuthenticated && !hasUserReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-dark rounded-pill btn-sm px-4 mb-4"
          style={{ fontWeight: 600 }}
        >
          <i className="fas fa-pen me-1" style={{ fontSize: 11 }}></i> Escrever Avaliação
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <div
          style={{
            background: "#fafafa",
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
            border: "1px solid #eee",
          }}
        >
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 16 }}>
            Sua Avaliação
          </h4>
          <form onSubmit={handleSubmit}>
            {/* Star selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#555", marginBottom: 6 }}>
                Nota *
              </label>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star`}
                    style={{
                      fontSize: 24,
                      color: (hoverRating || rating) >= star ? "#f59e0b" : "#ddd",
                      cursor: "pointer",
                      transition: "color 0.15s, transform 0.15s",
                      transform: hoverRating === star ? "scale(1.15)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#555", marginBottom: 4 }}>
                Título (opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resumo da sua experiência"
                maxLength={120}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#555", marginBottom: 4 }}>
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte mais sobre o produto..."
                maxLength={1000}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: "0.82rem", color: "#dc2626", marginBottom: 12, fontWeight: 500 }}>
                {error}
              </p>
            )}

            <div className="d-flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-dark rounded-pill btn-sm px-4"
                style={{ fontWeight: 600 }}
              >
                {submitting ? "Enviando..." : "Enviar Avaliação"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="btn btn-outline-secondary rounded-pill btn-sm px-3"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            background: "#fafafa",
            borderRadius: 14,
          }}
        >
          <i className="far fa-comment-dots" style={{ fontSize: 28, color: "#ddd", marginBottom: 8 }}></i>
          <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: 0 }}>
            Nenhuma avaliação ainda. Seja o primeiro a avaliar!
          </p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                borderBottom: "1px solid #f0f0f0",
                padding: "16px 0",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <StarRating rating={review.rating} size={13} />
                  {review.title && (
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 0, marginTop: 4 }}>
                      {review.title}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "0.72rem", color: "#bbb" }}>
                  {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {review.comment && (
                <p style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.6, marginBottom: 4, marginTop: 6 }}>
                  {review.comment}
                </p>
              )}

              <span style={{ fontSize: "0.72rem", color: "#999", fontWeight: 500 }}>
                {review.user?.name || "Cliente AMMI"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
