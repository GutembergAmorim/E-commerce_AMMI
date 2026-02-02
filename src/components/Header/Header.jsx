import React, { useState, useEffect, useRef } from "react";
import Logo_Header from "../../assets/Logo_Header.png"
import CartIcon from "../Icons/CartIcon";
import { Link, useLocation } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./Header.css";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";

function Header() {
  const { cartItems, animateCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        Mais vendidos
      </Link>      
      <Link
        to="/about"
        className="nav-link-custom"
        onClick={isMobile ? handleMenuClose : null}
      >
        Sale
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
      <header className={`transition-all ${headerClass}`}>
        {/* Barra de Frete - Topo */}
        <div className="bg-dark text-white py-1 font-brand">
          <div className="container d-flex align-items-center justify-content-center gap-2">
            <i className="fa-solid fa-truck" style={{ fontSize: '0.9em' }}></i> 
            <span className="fw-bold" style={{ fontSize: '0.85em', letterSpacing: '0.5px' }}>
              FRETE GRÁTIS PARA PEDIDOS ACIMA DE R$ 299,00
            </span>
          </div>
        </div>

        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            {/* Menu Hambúrguer (Mobile) */}
              <button 
                className={`btn-icon d-lg-none border-0 bg-transparent ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`} 
                onClick={handleMenuShow}
              >
                <i className="fas fa-bars fs-4"></i>
              </button>           
            {/* Esquerda: Navegacao */}            
            <div className="d-none d-lg-block">
              <NavLinks isMobile={false} />
            </div>

            {/* Centro: Logo e Navegacao */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/" onClick={handleMenuClose} className="d-flex align-items-center text-decoration-none">
                {/* <img className="img-logo" src={Logo_Header} alt="Logo AMMI Fitwear" style={{ maxHeight: '45px' }} /> */}
                <span className={` fs-4 ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`}>
                  <img src={Logo_Header} alt="Logo AMMI Fitwear" style={{ maxHeight: '60px' }} />
                </span>
              </Link>
            </div>
            
            {/* Direita: Ações (Carrinho, Login, Menu Mobile) */}
            <div className="d-flex align-items-center gap-3">             
              

              {/* Barra de Pesquisa */}
              {/* <div className={`header-search-container d-none d-xl-flex align-items-center ${isHome && !scrolled ? 'search-transparent' : 'search-scrolled'}`}>
                <span className="search-text">O que você está procurando?</span>
                <button className="btn-search-icon">
                  <i className="fas fa-search"></i>
                </button>
              </div> */}

              {/* Login / Perfil */}
              {isAuthenticated ? (
                <div className="dropdown" ref={dropdownRef}>
                  <button 
                    className={`btn btn-link text-decoration-none dropdown-toggle ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`} 
                    type="button" 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-expanded={showUserMenu}
                  >
                    <i className="fas fa-user me-1 fs-4"></i>
                    <span className="d-none d-sm-inline">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow-sm ${showUserMenu ? 'show' : ''}`} data-bs-popper={showUserMenu ? "static" : null}>
                    <li><Link className="dropdown-item" to="/profile" onClick={() => setShowUserMenu(false)}>Meus Dados</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={() => { logout(); setShowUserMenu(false); }}>Sair</button></li>
                  </ul>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`btn-icon ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`}
                >
                  <i className="fa-regular fa-user fs-4" ></i>
                </Link>
              )}
              {/* Favorites - Added before Cart */}
             <Link to="/favorites" className={`btn-icon position-relative ${isHome && !scrolled ? 'text-dark' : 'text-dark'}`}>
                <i className="far fa-heart fs-4" ></i>
              </Link>
              
              {/* Carrinho */}
              <Link to="/cart" className={`btn-icon position-relative ${isHome && !scrolled ? 'text-dark' : 'text-dark'} ${animateCart ? 'cart-bump' : ''}`}>
                <CartIcon className="fs-4" /> {/* CartIcon might need internal adjustment if it doesn't accept className for size, assuming it checks parent font-size */}
                {cartItems?.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', color: '#1d92a7ff' }}>
                    {cartItems.length}
                  </span>
                )}
              </Link>
              
            </div>
          </div>
        </div>
      </header>

      {/* Menu Offcanvas para Mobile */}
      <Offcanvas show={showMenu} onHide={handleMenuClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="font-brand text-custom-primary">AMMI Fitwear</Offcanvas.Title>
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
