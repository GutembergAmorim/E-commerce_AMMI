import React from "react";
import Logo_Header from "../../assets/Logo_Header.png";
import CartIcon from "../Icons/CartIcon";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setShowSearch(false);
    setShowMenu(false);
    setSearchQuery("");
    navigate(`/collections?search=${encodeURIComponent(q)}`);
  };

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
            <div className="d-flex align-items-center">
              <Link
                to="/"
                onClick={handleMenuClose}
                className="d-flex align-items-center text-decoration-none"
                aria-label="Ir para a página inicial"
              >
                <img src={Logo_Header} alt="Logo AMMI Fitwear" className="header-logo" />
                {/* <span className="logo-text font-brand text-dark fw-bolder fs-1 letter-spacing-4 text-shadow-sm">AMMI</span> */}
              </Link>
            </div>

            {/* Direita: Ações */}
            <div className="d-flex align-items-center gap-3">
              {/* Search Toggle */}
              <button
                className="btn-icon text-dark d-none d-lg-flex"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Buscar produtos"
              >
                <i className={`fa-solid fa-magnifying-glass fs-4`}></i>
              </button>
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

      {/* Desktop Search Bar */}
      {showSearch && (
        <div className="search-dropdown">
          <div className="container">
            <form onSubmit={handleSearch} className="search-dropdown__form">
              <i className="fa-solid fa-magnifying-glass search-dropdown__icon"></i>
              <input
                type="text"
                className="search-dropdown__input"
                placeholder="O que você procura?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-dropdown__clear"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <button type="submit" className="search-dropdown__submit">
                Buscar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Offcanvas para Mobile */}
      <Offcanvas show={showMenu} onHide={handleMenuClose} placement="end" aria-label="Menu de navegação">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className=" ">Ammi</Offcanvas.Title>
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

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="d-flex gap-2 mt-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: 50, border: '1px solid #e0e0e0', padding: '8px 16px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-dark rounded-pill px-3">
                <i className="fas fa-search"></i>
              </button>
            </form>

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
