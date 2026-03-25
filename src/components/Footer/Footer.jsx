import React from 'react';
import { Link } from 'react-router-dom';
// Se você criou Custom.css e precisa das classes customizadas, importe-o:
// import './Custom.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: "https://www.instagram.com/ammi.fitwear/", icon: "fab fa-instagram", label: "Instagram" },
    // { href: "#/", icon: "fab fa-facebook", label: "Facebook" },
    // { href: "#/", icon: "fab fa-tiktok", label: "TikTok" },
    // { href: "#/", icon: "fab fa-whatsapp", label: "WhatsApp" },
  ];

  const institutionalLinks = [
    { to: "/sobre", text: "Sobre nós" },
  ];

  const helpLinks = [
    { to: "/trocas", text: "Trocas e devoluções" },
  ];

  const paymentMethods = [
    { icon: "fab fa-cc-visa", label: "Visa" },
    { icon: "fab fa-cc-mastercard", label: "Mastercard" },
    { icon: "fab fa-cc-amex", label: "American Express" },
    { icon: "fab fa-cc-paypal", label: "PayPal" },
    { icon: "fas fa-barcode", label: "Boleto" },
    { icon: "fas fa-pix", label: "Pix" }, // Verifique se este ícone está disponível
  ];

  return (
    <>
      <footer className="bg-dark text-white pt-5 pb-4"> {/* bg-gray-900 -> bg-dark, pt-12 pb-6 -> pt-5 pb-4 */}
        <div className="container"> {/* mx-auto px-4 já é tratado pelo container */}
          <div className="row gy-4 gx-lg-5 mb-4"> {/* grid md:grid-cols-4 gap-8 mb-8 -> row gy-4 gx-lg-5 mb-4 */}
            
            {/* Coluna AMII */}
            <div className="col-lg-4 col-md-6"> {/* Ajustado para melhor distribuição, pode ser col-lg-3 */}
              <h3 className="h5 fw-bold mb-3">AMMI</h3> {/* text-xl -> h5 (Bootstrap heading scale) */}
              <p className="text-white-50 small">
                Moda fitness feminina que combina performance, conforto e estilo para você se sentir poderosa em cada movimento.
              </p>
              <div className="d-flex mt-3" style={{ gap: '1rem' }}> {/* flex space-x-4 mt-4 -> d-flex gap-3 ou style */}
                {socialLinks.map(link => (
                  <a key={link.label} href={link.href} className="text-white-50 footer-link-hover fs-5" title={link.label}>
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Coluna Institucional */}
            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-medium mb-3">Institucional</h4>
              <ul className="list-unstyled ps-0">
                {institutionalLinks.map(link => (
                  <li key={link.text} className="mb-1">
                    <Link to={link.to} className="text-white-50 text-decoration-none small footer-link-hover">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna Ajuda */}
            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-medium mb-3">Ajuda</h4>
              <ul className="list-unstyled ps-0">
                {helpLinks.map(link => (
                  <li key={link.text} className="mb-1">
                    <Link to={link.to} className="text-white-50 text-decoration-none small footer-link-hover">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna Formas de Pagamento e Segurança */}
            <div className="col-lg-4 col-md-6">
              <h4 className="h6 fw-medium mb-3">Formas de pagamento</h4>
              <div className="row row-cols-3 g-2 mb-3"> {/* grid grid-cols-3 gap-2 mb-4 -> row row-cols-3 g-2 mb-3 */}
                {paymentMethods.map(method => (
                  <div key={method.label} className="col">
                    <div className="payment-icon-bg p-2 rounded d-flex align-items-center justify-content-center" title={method.label}> {/* bg-gray-800 -> payment-icon-bg (custom) */}
                      <i className={`${method.icon} fs-4`}></i> {/* text-2xl -> fs-4 (Bootstrap font size scale) */}
                    </div>
                  </div>
                ))}
              </div>
              <span className="small fw-light mb-2">Tudo em até 3x sem juros ou 10% de desconto no pix*</span> 
              <h4 className="h6 fw-medium mb-2">Segurança</h4>
              <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}> {/* flex space-x-2 -> d-flex gap-1 ou style */}
                <img 
                    src="https://www.google.com/s2/favicons?domain=ssl.com&sz=32" /* Adicionado sz=32 para tamanho */
                    alt="SSL" 
                    style={{ height: '20px', width: '20px' }} /* h-6 -> height: 20px */
                />
                <span className="small text-white-50">Site 100% seguro</span> {/* text-xs -> small */}
              </div>
            </div>
          </div>

          {/* Seção Inferior: Copyright e Links */}
          <div className="border-top border-secondary pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center"> {/* border-gray-800 -> border-secondary (contraste com bg-dark) */}
            <p className="text-white-50 small mb-2 mb-md-0"> {/* text-sm -> small */}
              © {currentYear} AMMI. Todos os direitos reservados.
            </p>
            <div className="d-flex" style={{ gap: '1rem' }}>
              <Link to="/termos" className="text-white-50 text-decoration-none small footer-link-hover">Termos de uso</Link>
              <Link to="/termos" className="text-white-50 text-decoration-none small footer-link-hover">Política de privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;