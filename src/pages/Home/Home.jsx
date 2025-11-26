import React, { useState, useEffect, useMemo } from "react";
import "./style.css";
import { useProducts } from "../../hooks/useProducts";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";

// Importação das imagens das clientes
import naylaneImg from "../../assets/Naylane.png";
import brunaImg from "../../assets/BrunaAlmeida.png";
import claudiaImg from "../../assets/Claudia.png";
import ivinaImg from "../../assets/IvinaGasp.png";
import nayaraImg from "../../assets/Nayara.png";

function Home() {
  const { products, loading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cria uma lista de categorias únicas a partir dos produtos
  const categories = useMemo(() => {
    if (!products.length) return [];
    const uniqueCategories = products.reduce((acc, product) => {
      if (
        product.category &&
        !acc.some((cat) => cat._id === product.category._id)
      ) {
        acc.push(product.category);
      }
      return acc;
    }, []);
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }
    return products.filter(
      (product) => product.category._id === selectedCategory
    );
  }, [products, selectedCategory]);

  // A data alvo para o countdown. Ex: Black Friday (Novembro é mês 10)
  const targetDate = new Date(new Date().getFullYear(), 10, 24);

  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    let blackFriday = new Date(targetDate);

    const updateCountdownState = () => {
      const now = new Date();

      if (now > blackFriday) {
        // Se a data já passou, define para o próximo ano
        blackFriday.setFullYear(blackFriday.getFullYear() + 1);
      }

      const diff = blackFriday.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24))
          .toString()
          .padStart(2, "0"),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24)
          .toString()
          .padStart(2, "0"),
        minutes: Math.floor((diff / (1000 * 60)) % 60)
          .toString()
          .padStart(2, "0"),
        seconds: Math.floor((diff / 1000) % 60)
          .toString()
          .padStart(2, "0"),
      });
    };

    // Chama a função uma vez para definir o valor inicial sem delay
    updateCountdownState();

    const timerId = setInterval(updateCountdownState, 1000);

    // Função de limpeza para remover o intervalo quando o componente for desmontado
    return () => clearInterval(timerId);
  }, []); // Array de dependências vazio para executar apenas na montagem e desmontagem

  const countdownUnits = [
    { label: "Dias", value: countdown.days, id: "days" },
    { label: "Horas", value: countdown.hours, id: "hours" },
    { label: "Minutos", value: countdown.minutes, id: "minutes" },
    { label: "Segundos", value: countdown.seconds, id: "seconds" },
  ];

  return (
    <>
      <section className="colecao-raizes-hero position-relative">
        <div className="hero-container-custom">
          {/* Imagem posicionada (Absolute Bottom-Left) */}
          <img
            src="https://res.cloudinary.com/dxaacelde/image/upload/w_700,h_900,c_fill,q_auto,f_auto/Home_0-Photoroom_z7jtga.png"
            alt="Modelo a usar um conjunto verde da Coleção Raízes da AMMI Fitwear"
            className="hero-image-positioned"
          />

          {/* Conteúdo de Texto (Alinhado à direita via CSS) */}
          <div className="hero-text-content">
            <span className="hero-subtitle-top">COLEÇÃO</span>
            <h1 className="hero-title-main">RAÍZES</h1>
            <p className="hero-subtitle-bottom">
              ELEGANCIA EM TODO MOVIMENTO
            </p>

            <div className="d-flex justify-content-center justify-content-md-end mt-4">
              <Link to="/collections">
                <button className="btn-ver-colecao">VER COLEÇÃO</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Produtos com Filtro */}
      <section className="products-section-grid ">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-4 font-pacifico">Destaques da Coleção</h2>
          <div className="row">
            {/* --- Grelha de Produtos --- */}
            <main className="col-lg-12">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-raizes" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-warning" role="alert">
                  {error}
                </div>
              ) : (
                <div className="row row-cols-2 row-cols-lg-4 g-4">
                  {filteredProducts.map((product) => (
                    <div className="col" key={product._id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
      {/* Seção de Depoimentos de Clientes */}
      <section className="reviews-section">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-5 font-pacifico">Elas Usam AMMI</h2>
          
          <div className="reviews-scroll-container">
            {/* Mock Data de Reviews */}
            {[
              {
                id: 1,
                name: "Naylane",
                handle: "@naylanea",
                text: "Esse look 🤌.",
                image: naylaneImg
              },
              {
                id: 2,
                name: "Bruna Almeida",
                handle: "@bruna_almeida",
                text: "@ammi.fitwear",
                image: brunaImg
              },
              {
                id: 3,
                name: "Claudia",
                handle: "@claudiaflaviio",
                text: "@ammi.fitwear",
                image: claudiaImg
              },
              {
                id: 4,
                name: "Ivina",
                handle: "@ivinagasp",
                text: "Pré treino hoje sendo meu look novo @ammi.fitwear 💚",
                image: ivinaImg
              },
              {
                id: 5,
                name: "Nayara",
                handle: "@nayaramakedesign",
                text: "Melhor pré treino para toda mulher é um lookinho novo! 😍",
                image: nayaraImg
              }
            ].map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-image-wrapper">
                  <img src={review.image} alt={review.name} className="review-image" />
                </div>
                <div className="review-content">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="review-avatar">
                      {review.name.charAt(0)}
                    </div>
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
      {/* Seção Promoção de Black Friday */}
      <section className="py-5 text-white promo-gradient-custom">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">Black Friday Fitness</h2>
          <p className="fs-5 mb-4 mx-auto" style={{ maxWidth: "700px" }}>
            Até 50% de desconto em toda a loja. Aproveite as melhores ofertas do
            ano!
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
            {countdownUnits.map((unit) => (
              <div
                className="bg-white bg-opacity-25 rounded-3 p-3 text-center countdown-item"
                key={unit.id}
              >
                <span className="fs-2 fw-bold d-block" id={unit.id}>
                  {unit.value}
                </span>
                <span className="small text-uppercase">{unit.label}</span>
              </div>
            ))}
          </div>
          <Link to="/collections">
            <button className="btn btn-light text-custom-pink rounded-pill px-5 py-2 fw-bold fs-5">
              Comprar Agora
            </button>
          </Link>
          {/* --- Divisor de Seção Curvo --- */}
          <div className="custom-shape-divider-bottom-1716490896">
            <svg
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="shape-fill"
              ></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Seção Newsletter */}
      <section className="py-5 bg-light">
        <div className="container" style={{ maxWidth: "896px" }}>
          <div className="bg-white rounded-3 shadow-sm p-4 p-md-5 text-center">
            <h2 className="h2 fw-bold mb-3">Receba nossas novidades</h2>
            <p className="text-muted mb-4">
              Cadastre-se para receber promoções exclusivas e as últimas
              tendências em moda fitness.
            </p>
            <form
              className="d-flex flex-column flex-sm-row gap-2 mx-auto"
              style={{ maxWidth: "520px" }}
            >
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="form-control form-control-lg rounded-pill form-control-pink-focus"
              />
              <button
                type="submit"
                className="btn btn-custom-pink btn-lg rounded-pill px-4 text-nowrap"
              >
                Assinar
              </button>
            </form>
            <p className="small text-muted mt-3">
              Não compartilhamos seus dados. Veja nossa
              <a
                href="#privacy"
                className="text-custom-pink text-decoration-none"
              >
                {" "}
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
