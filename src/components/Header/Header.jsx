import React, { useState } from "react"; // Importe o React se ainda não estiver
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas"; // Importe Link do react-router-dom para navegação

import "./Header.css"; // Importe o CSS para estilos personalizados

import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import {} from "../../services/authService";

function Header() {
  const { cartItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClose = () => setShowMenu(false);
  const handleMenuShow = () => setShowMenu(true);

  const NavLinks = ({ isMobile }) => (
    <nav
      className={isMobile ? "d-flex flex-column" : "d-none d-lg-flex"}
      style={{ gap: isMobile ? "1rem" : "1.5rem" }}
    >
      <Link
        to="/collections"
        className="nav-link-custom"
        onClick={isMobile ? handleMenuClose : null}
      >
        Produtos
      </Link>

      {isAuthenticated && user?.name === "Administrador" ? (
        <>
          <Link
            to="/admin/products/new"
            className="nav-link-custom"
            onClick={isMobile ? handleMenuClose : null}
          >
            Cadastrar Produto
          </Link>
          <Link
            to="/admin/media"
            className="nav-link-custom"
            onClick={isMobile ? handleMenuClose : null}
          >
            Upload Produto
          </Link>
        </>
      ) : (
        <Link
          to="/about"
          className="nav-link-custom"
          onClick={isMobile ? handleMenuClose : null}
        >
          Sobre
        </Link>
      )}
    </nav>
  );

  return (
    <>
      <header className="bg-info-subtle shadow-sm sticky-top">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            {/* Esquerda: Logo e Navegação Desktop */}
            <div className="d-flex align-items-center" style={{ gap: "2rem" }}>
              <Link to="/" onClick={handleMenuClose}>
                <img className="img-logo" src={logo} alt="Logo AMMI Fitwear" />
              </Link>
              <NavLinks isMobile={false} />
            </div>

            {/* Direita: Ícones e Ações do Utilizador */}
            <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
              {isAuthenticated ? (
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "1rem" }}
                >
                  <span className="fw-medium d-none d-sm-block">
                    Olá, {user?.name}!
                  </span>
                  <button
                    onClick={logout}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-outline-secondary rounded-pill px-3 d-none d-sm-block"
                >
                  Entrar
                </Link>
              )}

              <Link to="/cart" className="btn-icon position-relative">
                <i className="fas fa-shopping-bag"></i>
                {cartItems?.length > 0 && (
                  <span className="cart-badge">
                    {cartItems.length}
                    <span className="visually-hidden">Itens no carrinho</span>
                  </span>
                )}
              </Link>

              {/* Ícone do Menu Hambúrguer (só aparece em ecrãs pequenos) */}
              <button className="btn-icon d-lg-none" onClick={handleMenuShow}>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Offcanvas para Mobile */}
      <Offcanvas show={showMenu} onHide={handleMenuClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <NavLinks isMobile={true} />
          <hr />
          {!isAuthenticated && (
            <Link
              to="/login"
              className="btn btn-primary w-100"
              onClick={handleMenuClose}
            >
              Entrar
            </Link>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Header;
