import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import "./WelcomeModal.css";
import modalImage from "../../assets/category_top.jpeg"; 
import api from "../../services/api";

const WelcomeModal = () => {
  const [show, setShow] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifica se já mostramos o modal para este usuário usando localStorage
    const hasSeenModal = sessionStorage.getItem("ammi_welcome_modal_seen");
    
    if (!hasSeenModal) {
      // Aparece após 3 segundos para dar tempo de carregar o site
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    // Para efeito de desenvolvimento/teste, estou usando sessionStorage, 
    // mas em produção o ideal é localStorage para não aparecer nunca mais
    sessionStorage.setItem("ammi_welcome_modal_seen", "true");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      // Salva o e-mail no mesmo endpoint da newsletter
      await api.post("/newsletter", { email });
      setRevealed(true);
    } catch (err) {
      // Se der erro (ex: e-mail já cadastrado), ainda assim revelamos o cupom 
      // para garantir uma boa experiência de conversão para o usuário.
      setRevealed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("PRIMEIRACOMPRA");
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      contentClassName="welcome-modal-content"
    >
      <button className="welcome-modal-close" onClick={handleClose}>
        &times;
      </button>
      <div className="row g-0 h-100">
        <div className="col-md-5 d-none d-md-block h-100">
          <img src={modalImage} alt="AMMI Fitwear" className="welcome-modal-image" />
        </div>
        <div className="col-md-7 d-flex align-items-center">
          <div className="welcome-modal-body text-center w-100">
            {!revealed ? (
              <>
                <h2 className="welcome-modal-title font-brand">VOCÊ GANHOU <br/><span className="text-highlight">10% OFF</span></h2>
                <p className="welcome-modal-subtitle">
                  Cadastre-se na nossa newsletter para desbloquear seu cupom de primeira compra e receber novidades exclusivas!
                </p>
                <form onSubmit={handleSubmit} className="welcome-modal-form mt-4">
                  <input 
                    type="email" 
                    className="welcome-modal-input" 
                    placeholder="Digite seu melhor e-mail" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" className="welcome-modal-btn w-100 mt-2" disabled={loading}>
                    {loading ? "PROCESSANDO..." : "QUERO MEU DESCONTO"}
                  </button>
                </form>
                <button className="welcome-modal-link mt-3" onClick={handleClose}>
                  Não, obrigado. Prefiro pagar o preço normal.
                </button>
              </>
            ) : (
              <>
                <h2 className="welcome-modal-title font-brand">OBA! 🎉</h2>
                <p className="welcome-modal-subtitle">
                  Aproveite seu desconto de 10% copiando o código abaixo e adicione na hora do pagamento:
                </p>
                <div className="welcome-modal-coupon-box mt-4 mb-4">
                  PRIMEIRACOMPRA
                </div>
                <button className="welcome-modal-btn w-100" onClick={handleCopy}>
                  COPIAR E COMPRAR AGORA
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
