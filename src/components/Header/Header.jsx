import React from "react"; // Importe o React se ainda não estiver
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom"; // Importe Link do react-router-dom para navegação
//aplicar max width de 1024px
// e centralizar o conteúdo
// e adicionar padding de 1rem
import "./Header.css"; // Importe o CSS para estilos personalizados

import { useCart } from "../../Context/CartContext";

function Header() {
  const { cartItems } = useCart();

  return (
    <>
      <header className="bg-info-subtle shadow-sm sticky-top">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={{ gap: "2rem" }}>
              <a href="/" className="text-decoration-none">
                <img className="img-logo" src={logo} alt="Logo" />{" "}
              </a>
              <nav className="d-none d-md-flex" style={{ gap: "1.5rem" }}>
                <Link
                  to="/products"
                  className="nav-link text-dark fw-medium nav-link-custom-hover px-0"
                >
                  Produtos
                </Link>
                <Link
                  to="/collections" // Exemplo de rota, ajuste conforme necessário
                  className="nav-link text-dark fw-medium nav-link-custom-hover px-0"
                >
                  Coleções
                </Link>
                <a
                  href="#/"
                  className="nav-link text-dark fw-medium nav-link-custom-hover px-0"
                >
                  Sobre
                </a>
              </nav>
            </div>

            <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
              <button className="btn btn-light rounded-circle p-2 lh-1">
                <i className="fas fa-search text-secondary"></i>{" "}
              </button>
              <button className="btn btn-light rounded-circle p-2 lh-1">
                <i className="fas fa-heart text-secondary"></i>
              </button>
              <Link
                to="/Cart"
                className="btn btn-light rounded-circle p-2 lh-1 position-relative"
              >
                <i className="fas fa-shopping-bag text-secondary"></i>
                {cartItems.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-custom-pink">
                    {cartItems.length}
                    <span className="visually-hidden">Itens no carrinho</span>
                  </span>
                )}
              </Link>

              <button className="btn btn-light rounded-circle p-2 d-md-none lh-1">
                <i className="fas fa-bars text-secondary"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
