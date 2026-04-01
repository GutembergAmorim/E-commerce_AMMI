import React, { useState } from "react";
import "./style.css";
import { useProducts, useBestSellers } from "../../hooks/useProducts";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import ProductCard from "../../components/ProductCard/ProductCard";
import Banner from "../../components/Banner/Banner";
import InfoBanner from "../../components/InfoBanner/InfoBanner";
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid";
import api from "../../services/api";

// Importação das imagens das clientes
import naylaneImg from "../../assets/Naylane.png";
import brunaImg from "../../assets/BrunaAlmeida.png";
import claudiaImg from "../../assets/Claudia.png";
import ivinaImg from "../../assets/IvinaGasp.png";
import nayaraImg from "../../assets/Nayara.png";

// Importação das imagens de categorias
import categoryLeggingImg from "../../assets/category_legging.png";
import categoryShortImg from "../../assets/category_short.png";
import categoryTopImg from "../../assets/category_top.png";
import categoryMacaquinhoImg from "../../assets/category_macaquinho.png";

const REVIEWS = [
  { id: 1, name: "Naylane", handle: "@naylanea", text: "Esse look 🤌.", image: naylaneImg },
  { id: 2, name: "Bruna Almeida", handle: "@bruna_almeida", text: "@ammi.fitwear", image: brunaImg },
  { id: 3, name: "Claudia", handle: "@claudiaflaviio", text: "@ammi.fitwear", image: claudiaImg },
  { id: 4, name: "Ivina", handle: "@ivinagasp", text: "Pré treino hoje sendo meu look novo @ammi.fitwear 💚", image: ivinaImg },
  { id: 5, name: "Nayara", handle: "@nayaramakedesign", text: "Melhor pré treino para toda mulher é um lookinho novo! 😍", image: nayaraImg },
];

// Categorias fixas com imagens dedicadas
const CATEGORIES = [
  { _id: "Legging", name: "Legging", image: categoryLeggingImg },
  { _id: "Short", name: "Short", image: categoryShortImg },
  { _id: "Top", name: "Top", image: categoryTopImg },
  { _id: "Macaquinho", name: "Macaquinho", image: categoryMacaquinhoImg },
];

function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { products: bestSellers, loading: bestSellersLoading, error: bestSellersError } = useBestSellers(8);
  const navigate = useNavigate();

  // Newsletter state
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState(null); // { type: 'success'|'error', message }
  const [nlLoading, setNlLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;

    setNlLoading(true);
    setNlStatus(null);

    try {
      const res = await api.post("/newsletter", { email: nlEmail });
      setNlStatus({ type: "success", message: res.data.message });
      setNlEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao se inscrever. Tente novamente.";
      setNlStatus({ type: "error", message: msg });
    } finally {
      setNlLoading(false);
    }
  };


  // Skeleton loader
  const SkeletonGrid = () => (
    <div className="row row-cols-2 row-cols-lg-4 g-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="col" key={i}>
          <div className="home-skeleton-card">
            <div className="home-skeleton-image"></div>
            <div className="home-skeleton-text"></div>
            <div className="home-skeleton-text home-skeleton-text--short"></div>
            <div className="home-skeleton-text home-skeleton-text--price"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* WhatsApp Floating Button */}
      <Link to="https://wa.me/5585991903125">
        <i className="fa-brands fa-whatsapp zap-icon"></i>
      </Link>

      {/* Banner Carousel */}
      <Banner />

      {/* Info Strip */}
      <InfoBanner />

      {/* Category Grid */}
      <CategoryGrid
        categories={CATEGORIES}
        onSelectCategory={(categoryId) => {
          if (categoryId) {
            navigate(`/collections?category=${categoryId}`);
          }
        }}
      />

      {/* ---- Mais Vendidos ---- */}
      <section className="products-section-grid">
        <div className="container">
          <div className="products-section-header">
            <h2 className="fw-bold story-script-regular section-title-separator">
              Mais Vendidos
            </h2>
            <p className="text-center text-muted" style={{ fontSize: '0.88rem', marginTop: '-0.5rem' }}>
              Os favoritos das nossas clientes
            </p>
          </div>

          {bestSellersLoading ? (
            <SkeletonGrid />
          ) : bestSellersError ? (
            <div className="alert alert-warning" role="alert">{bestSellersError}</div>
          ) : (
            <>
              <div className="row row-cols-2 row-cols-lg-4 g-4">
                {bestSellers.map((product) => (
                  <div className="col" key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link to="/collections" className="btn btn-dark rounded-pill px-4 py-2 fw-semibold">
                  Ver Todos <ArrowRight size={16} className="ms-1" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---- Elas Usam AMMI ---- */}
      <section className="reviews-section">
        <div className="container">
          <h2 className="fw-bold text-center mb-2 story-script-regular section-title-separator">
            Elas Usam AMMI
          </h2>
          <p className="text-center text-muted mb-4" style={{ fontSize: '0.88rem' }}>
            Veja como nossas clientes arrasam nos treinos
          </p>
          <div className="reviews-scroll-container">
            {REVIEWS.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-image-wrapper">
                  <img src={review.image} alt={review.name} className="review-image" />
                </div>
                <div className="review-content">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="review-avatar">{review.name.charAt(0)}</div>
                    <div>
                      <h5 className="mb-0 fs-6 fw-bold">{review.name}</h5>
                      <small className="text-muted">{review.handle}</small>
                    </div>
                  </div>
                  <p className="review-text small mb-0">"{review.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Newsletter ---- */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-card__icon">
              <Mail size={24} />
            </div>
            <h2 className="newsletter-card__title">Receba nossas novidades</h2>
            <p className="newsletter-card__subtitle">
              Cadastre-se para promoções exclusivas e as últimas tendências em moda fitness.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="newsletter-form__input"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                required
                disabled={nlLoading}
              />
              <button type="submit" className="newsletter-form__btn" disabled={nlLoading}>
                {nlLoading ? "Enviando..." : "Assinar"}
              </button>
            </form>
            {nlStatus && (
              <p
                className={`small mt-3 mb-0 fw-medium ${
                  nlStatus.type === "success" ? "text-success" : "text-danger"
                }`}
              >
                {nlStatus.message}
              </p>
            )}
            <p className="newsletter-card__disclaimer">
              Não compartilhamos seus dados.{" "}
              <a href="#privacy">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;

