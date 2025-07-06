import React, { useState, useEffect } from "react";

import Hero from "../../assets/hero.jpg";
import top from "../../assets/top.png";
import legging from "../../assets/legging.png";
import short from "../../assets/short.png";
import conjunto from "../../assets/conjunto.png";
import "./style.css";
import produtos from "../../Data/products.jsx";
import { Link } from "react-router-dom";

function Home() {
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

  const categories = [
    {
      name: "Tops",
      img: top,
      alt: "Tops",
      models: "10 modelos",
      bgColor: "bg-custom-pink-subtle",
      textColor: "text-custom-pink",
    },
    {
      name: "Leggings",
      img: legging,
      alt: "Leggings",
      models: "8 modelos",
      bgColor: "bg-custom-blue-subtle",
      textColor: "text-custom-blue",
    },
    {
      name: "Shorts",
      img: short,
      alt: "Shorts",
      models: "5 modelos",
      bgColor: "bg-custom-green-subtle",
      textColor: "text-custom-green",
    },
    {
      name: "Conjuntos",
      img: conjunto,
      alt: "Conjuntos",
      models: "12 modelos",
      bgColor: "bg-custom-yellow-subtle",
      textColor: "text-custom-yellow",
    },
  ];

  const countdownUnits = [
    { label: "Dias", value: countdown.days, id: "days" },
    { label: "Horas", value: countdown.hours, id: "hours" },
    { label: "Minutos", value: countdown.minutes, id: "minutes" },
    { label: "Segundos", value: countdown.seconds, id: "seconds" },
  ];

  return (
    <>
      <section className="py-5 hero-gradient-custom">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 mb-4 mb-md-0">
              <span className="badge rounded-pill bg-custom-pink-subtle text-custom-pink p-2 small fw-medium">
                Nova Coleção
              </span>
              <h1 className="display-4 fw-bold mt-3 mb-4">
                Performance com Estilo
              </h1>
              <p className="lead text-muted mb-4">
                Roupas de academia que combinam tecnologia, conforto e design
                para você se sentir poderosa em cada movimento.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                {/* <button className="btn btn-custom-pink rounded-pill px-4 py-2 fw-medium">
                  Comprar Agora
                </button> */}
                <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-medium">
                  Ver Coleção
                </button>
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center align-items-center">
              <img
                src={Hero}
                alt="Mulher usando roupa de academia"
                className="img-fluid rounded-3 shadow-lg" // max-w-full h-auto -> img-fluid, rounded-lg -> rounded-3, shadow-xl -> shadow-lg
                style={{ maxHeight: "384px", objectFit: "cover" }} // max-h-96 (384px)
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seção Categorias */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="h2 fw-bold text-center mb-5">Nossas Categorias</h2>
          <div className="row row-cols-2 row-cols-md-4 g-4">
            {categories.map((category, index) => (
              <div className="col" key={index}>
                <a
                  href="#category" // Mude para o link correto
                  className="text-decoration-none d-block bg-light rounded-3 p-4 text-center category-card-hover h-100" // bg-gray-50 -> bg-light, rounded-xl -> rounded-3, p-6 -> p-4
                >
                  <div
                    className={`category-icon-wrapper rounded-pill mx-auto mb-3 ${category.bgColor} ${category.textColor}`}
                  >
                    <img src={category.img} width="40" alt={category.alt} />
                  </div>
                  <h4 className="h6 fw-medium text-dark">{category.name}</h4>
                  <p className="small text-muted mt-1">{category.models}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Produtos em Destaque */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
           
            <h2 className="h2 fw-bold">Destaques</h2> 
            <Link
              to="/products"
              className="nav-link text-decoration-none text-custom-pink fw-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 g-4">
            {produtos.map((product) => (
              <div className="col" key={product.id}>
                {product.isHighlighted && (
                  <div className="card h-100 product-card-custom border-0 shadow-sm">
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
                      <button className="btn btn-light btn-sm rounded-pill position-absolute top-0 end-0 m-2 shadow-sm">
                        <i className="fas fa-heart text-muted"></i>
                      </button>
                    </div>
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h3 className="h6 card-title fw-medium mb-1">
                            {product.name}
                          </h3>
                          <p className="card-text small text-muted">
                            {product.description}
                          </p>
                        </div>
                        {product.status && (
                          <span
                            className={`badge rounded-pill small px-2 py-1 ${product.statusColor} ${product.statusTextColor}`}
                          >
                            {product.status} 
                          </span>
                        )}
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-auto">
                        <span className="fw-bold fs-5">{`R$ ${product.price.toFixed(2).replace(".", ",")}`}</span>
                        
                        {product.oldPrice && (
                          <span className="text-muted text-decoration-line-through ms-2">
                            {`R$ ${product.oldPrice.toFixed(2).replace(".", ",")}`}
                          </span>
                        )}
                        {/* <button className="btn btn-custom-pink btn-sm rounded-pill p-2 lh-1">
                          <i className="fas fa-shopping-bag"></i>
                        </button> */}
                      </div>
                    </div>
                  </div>
                )}
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
                className="form-control form-control-lg rounded-pill form-control-pink-focus" /* px-4 py-3 border ... -> form-control-lg */
              />
              <button
                type="submit"
                className="btn btn-custom-pink btn-lg rounded-pill px-4 text-nowrap" /* px-6 py-3 whitespace-nowrap -> px-4 text-nowrap (btn-lg já dá altura) */
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
