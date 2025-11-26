import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./Header.css";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";

function Header() {
  const { cartItems } = useCart();
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

  const NavLinks = ({ isMobile }) => (
    <nav
      className={isMobile ? "d-flex flex-column" : "d-none d-lg-flex align-items-center"}
      style={{ gap: isMobile ? "1rem" : "2rem" }}
    >
      <Link
        to="/collections"
        className="nav-link-custom"
        onClick={isMobile ? handleMenuClose : null}
      >
        Produtos
      </Link>
      <Link
        to="/collections?sort=newest" // Exemplo de link para lançamentos
        className="nav-link-custom"
        onClick={isMobile ? handleMenuClose : null}
      >
        Lançamentos
      </Link>
      <Link
        to="/about"
        className="nav-link-custom"
        onClick={isMobile ? handleMenuClose : null}
      >
        Sobre
      </Link>
      
      {isAuthenticated && user?.role === "admin" && (
        <Link
          to="/admin/dashboard"
          className="nav-link-custom text-warning" // Destaque para admin
          onClick={isMobile ? handleMenuClose : null}
        >
          Admin
        </Link>
      )}
    </nav>
  );

  return (
    <>
      <header className={`fixed-top transition-all ${headerClass}`}>
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            
            {/* Esquerda: Logo e Nome */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/" onClick={handleMenuClose} className="d-flex align-items-center text-decoration-none">
                <img className="img-logo" src={logo} alt="Logo AMMI Fitwear" style={{ maxHeight: '45px' }} />
                <span className={`ms-2 fs-4 fw-bold font-pacifico ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`}>
                  AMMI Fitwear
                </span>
              </Link>
            </div>

            {/* Centro: Navegação (Desktop) */}
            <div className="d-none d-lg-block">
              <NavLinks isMobile={false} />
            </div>

            {/* Direita: Ações (Carrinho, Login, Menu Mobile) */}
            <div className="d-flex align-items-center gap-3">
              
              {/* Carrinho */}
              <Link to="/cart" className={`btn-icon position-relative ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`}>
                <i className="fas fa-shopping-bag fs-5"></i>
                {cartItems?.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Login / Perfil */}
              {isAuthenticated ? (
                <div className="dropdown">
                  <button 
                    className={`btn btn-link text-decoration-none dropdown-toggle ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`} 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="fas fa-user me-1"></i>
                    <span className="d-none d-sm-inline">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><Link className="dropdown-item" to="/profile">Meus Dados</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={logout}>Sair</button></li>
                  </ul>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`btn rounded-pill px-4 fw-medium ${isHome && !scrolled ? 'btn-dark' : 'btn-dark'}`}
                >
                  Entrar
                </Link>
              )}

              {/* Menu Hambúrguer (Mobile) */}
              <button 
                className={`btn-icon d-lg-none border-0 bg-transparent ${isHome && !scrolled ? 'text-white' : 'text-dark'}`} 
                onClick={handleMenuShow}
              >
                <i className="fas fa-bars fs-4"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Offcanvas para Mobile */}
      <Offcanvas show={showMenu} onHide={handleMenuClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="font-pacifico text-custom-primary">AMMI Fitwear</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            <NavLinks isMobile={true} />
            
            <div className="mt-auto">
              {!isAuthenticated && (
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
