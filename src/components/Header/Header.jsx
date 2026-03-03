import React from "react";
import Logo_Header from "../../assets/Logo_Header.png";
import CartIcon from "../Icons/CartIcon";
import { Link, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import "./Header.css";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useState, useEffect } from "react";

// ── NavLinks extraído para fora do Header (evita re-criação a cada render) ──
function NavLinks({ isMobile, isAuthenticated, user, handleMenuClose, location }) {
  const isActive = (path) => {
    if (path === "/collections") return location.pathname === "/collections" && !location.search;
    return location.pathname + location.search === path;
  };

  return (
    <nav
      className={isMobile ? "d-flex flex-column" : "d-none d-lg-flex align-items-center"}
      style={{ gap: isMobile ? "1rem" : "2rem" }}
      aria-label={isMobile ? "Menu de navegação mobile" : "Menu de navegação principal"}
    >
      <Link
        to="/collections"
        className={`nav-link-custom ${isActive("/collections") ? "active" : ""}`}
        onClick={isMobile ? handleMenuClose : null}
      >
        Produtos
      </Link>
      <Link
        to="/collections?sort=best-sellers"
        className={`nav-link-custom ${isActive("/collections?sort=best-sellers") ? "active" : ""}`}
        onClick={isMobile ? handleMenuClose : null}
      >
        Mais vendidos
      </Link>
      <Link
        to="/collections?sale=true"
        className={`nav-link-custom ${isActive("/collections?sale=true") ? "active" : ""}`}
        onClick={isMobile ? handleMenuClose : null}
      >
        Sale
      </Link>
      {isAuthenticated && user?.role === "admin" && (
        <Link
          to="/admin/dashboard"
          className={`nav-link-custom text-warning ${isActive("/admin/dashboard") ? "active" : ""}`}
          onClick={isMobile ? handleMenuClose : null}
        >
          Admin
        </Link>
      )}
    </nav>
  );
}

// ── Header Component ──
function Header() {
  const { cartItems, animateCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detectar scroll para mudar o estilo do header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Verificar se estamos na home para aplicar transparência inicial
  const isHome = location.pathname === "/";
  const headerClass = isHome && !scrolled ? "header-transparent" : "header-scrolled";

  const handleMenuClose = () => setShowMenu(false);
  const handleMenuShow = () => setShowMenu(true);

  return (
    <>
      <header className={`site-header transition-all ${headerClass}`}>
        {/* Barra de Frete - Topo */}
        <div className="bg-dark text-white py-1 font-brand">
          <div className="container d-flex align-items-center justify-content-center gap-2">
            <i className="fa-solid fa-truck top-bar-icon"></i>
            <span className="fw-bold top-bar-text">
              FRETE GRÁTIS PARA PEDIDOS ACIMA DE R$ 299,00
            </span>
          </div>
        </div>

        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            {/* Menu Hambúrguer (Mobile) */}
            <button
              className="btn-icon d-lg-none border-0 bg-transparent text-dark"
              onClick={handleMenuShow}
              aria-label="Abrir menu de navegação"
            >
              <i className="fas fa-bars fs-4"></i>
            </button>

            {/* Esquerda: Navegação (Desktop) */}
            <div className="d-none d-lg-block">
              <NavLinks
                isMobile={false}
                isAuthenticated={isAuthenticated}
                user={user}
                handleMenuClose={handleMenuClose}
                location={location}
              />
            </div>

            {/* Centro: Logo */}
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/"
                onClick={handleMenuClose}
                className="d-flex align-items-center text-decoration-none"
                aria-label="Ir para a página inicial"
              >
                <img src={Logo_Header} alt="Logo AMMI Fitwear" className="header-logo" />
              </Link>
            </div>

            {/* Direita: Ações */}
            <div className="d-flex align-items-center gap-3">
              {/* Login / Perfil — usando React-Bootstrap Dropdown */}
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className="text-decoration-none text-dark p-0 border-0"
                    id="user-dropdown"
                  >
                    <i className="fas fa-user me-1 fs-4"></i>
                    <span className="d-none d-sm-inline">{user?.name?.split(" ")[0]}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="shadow-sm">
                    <Dropdown.Item as={Link} to="/profile">
                      Meus Dados
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger" onClick={logout}>
                      Sair
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="btn-icon text-dark">
                  <i className="fa-regular fa-user fs-4"></i>
                </Link>
              )}

              {/* Favoritos */}
              <Link to="/favorites" className="btn-icon position-relative text-dark">
                <i className="far fa-heart fs-4"></i>
              </Link>

              {/* Carrinho */}
              <Link
                to="/cart"
                className={`btn-icon position-relative text-dark ${animateCart ? "cart-bump" : ""}`}
              >
                <CartIcon className="fs-4" />
                {cartItems?.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Offcanvas para Mobile */}
      <Offcanvas show={showMenu} onHide={handleMenuClose} placement="end" aria-label="Menu de navegação">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="font-brand text-custom-primary">AMMI Fitwear</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            {/* Saudação do usuário logado */}
            {isAuthenticated && (
              <div className="mb-3 pb-3 border-bottom">
                <span className="offcanvas-user-greeting">Olá,</span>
                <div className="offcanvas-user-name">{user?.name?.split(" ")[0]}</div>
              </div>
            )}

            <NavLinks
              isMobile={true}
              isAuthenticated={isAuthenticated}
              user={user}
              handleMenuClose={handleMenuClose}
              location={location}
            />

            <hr className="my-3" />

            {/* Links de perfil no mobile (apenas logado) */}
            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="nav-link-custom d-flex align-items-center gap-2"
                  onClick={handleMenuClose}
                >
                  <i className="fas fa-user"></i> Meus Dados
                </Link>
                <Link
                  to="/profile/orders"
                  className="nav-link-custom d-flex align-items-center gap-2 mt-3"
                  onClick={handleMenuClose}
                >
                  <i className="fas fa-box"></i> Meus Pedidos
                </Link>
              </>
            )}

            <Link
              to="/favorites"
              className="nav-link-custom d-flex align-items-center gap-2 mt-3"
              onClick={handleMenuClose}
            >
              <i className="far fa-heart"></i> Favoritos
            </Link>
            <Link
              to="/cart"
              className="nav-link-custom d-flex align-items-center gap-2 mt-3"
              onClick={handleMenuClose}
            >
              <i className="fas fa-shopping-bag"></i> Carrinho
              {cartItems?.length > 0 && (
                <span className="badge rounded-pill bg-danger cart-badge">{cartItems.length}</span>
              )}
            </Link>

            <div className="mt-auto">
              {isAuthenticated ? (
                <button
                  className="btn btn-outline-danger w-100 py-2 rounded-pill"
                  onClick={() => {
                    logout();
                    handleMenuClose();
                  }}
                >
                  Sair
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-dark w-100 py-2 rounded-pill"
                  onClick={handleMenuClose}
                >
                  Entrar / Cadastrar
                </Link>
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Header;
