import React, { useState, useEffect } from "react";
import "./style.css";
import { useHighlightedProducts } from "../../hooks/useProducts";
import { Link } from "react-router-dom";

function Home() {
  const {
    products: highlightedProducts,
    loading,
    error,
  } = useHighlightedProducts();

  // Função para iniciar o temporizador
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const updateCountdownState = () => {
      const now = new Date();
      // Defina a data da Black Friday (24 de Novembro do ano corrente)
      // No JavaScript, os meses são 0-indexados (Janeiro=0, ..., Novembro=10)
      let blackFriday = new Date(now.getFullYear(), 10, 24);

      if (now > blackFriday) {
        // Se já passou, define para o próximo ano
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

    const intervalId = setInterval(updateCountdownState, 1000);

    // Função de limpeza para remover o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []); // Array de dependências vazio para executar apenas na montagem e desmontagem

  const countdownUnits = [
    { label: "Dias", value: countdown.days, id: "days" },
    { label: "Horas", value: countdown.hours, id: "hours" },
    { label: "Minutos", value: countdown.minutes, id: "minutes" },
    { label: "Segundos", value: countdown.seconds, id: "seconds" },
  ];

  return (
    <>
      <section className="colecao-raizes-hero">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            {/* --- Coluna de Texto --- */}
            <div className="col-md-6 mb-4 mb-md-0">
              <span className="badge-raizes ">Nova Coleção</span>

              <h2 className="titulo-colecao mt-3">
                COLEÇÃO <span className="titulo-destaque">RAÍZES</span>
              </h2>

              <p className="descricao-colecao">
                A Coleção Raízes nasce da inspiração na força interior, na
                autenticidade e na conexão com o que realmente importa.
              </p>

              <div className="d-flex">
                <Link to="/collections">
                  {" "}
                  {/* O teu link para as coleções */}
                  <button className="btn-ver-colecao">Ver Coleção</button>
                </Link>
              </div>
            </div>

            {/* --- Coluna da Imagem --- */}
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <img
                src="https://res.cloudinary.com/dxaacelde/image/upload/w_700,h_900,c_fill,q_auto,f_auto/Home_0-Photoroom_z7jtga.png"
                alt="Modelo a usar um conjunto verde da Coleção Raízes da AMMI Fitwear"
                className="img-fluid rounded-3 shadow-sm" // Mantive img-fluid e adicionei uma sombra suave
                style={{ maxHeight: "450px", objectFit: "cover" }} // Aumentei um pouco a altura para mais impacto
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seção Produtos em Destaque */}
      <section className="raizes-destaques-section">
        <div className="container">
          {/* --- Cabeçalho da Secção --- */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="destaques-titulo">Destaques da Coleção</h2>
            <Link to="/collections" className="link-ver-todos">
              Ver todos &rarr;
            </Link>
          </div>

          {/* --- Lógica de Carregamento (Mantida Intacta) --- */}
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
            /* --- Grelha de Produtos --- */
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
              {highlightedProducts.map((product) => (
                <div className="col" key={product._id}>
                  <div className="card product-card-raizes">
                    <div className="card-img-container">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://via.placeholder.com/400x500?text=Sem+Imagem"
                        }
                        alt={product.name}
                        className="card-img-top"
                      />
                    </div>

                    <div className="card-body">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">{`R$ ${product.price
                        .toFixed(2)
                        .replace(".", ",")}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <button className="btn btn-light text-custom-pink rounded-pill px-5 py-2 fw-bold fs-5">
            Comprar Agora
          </button>
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
