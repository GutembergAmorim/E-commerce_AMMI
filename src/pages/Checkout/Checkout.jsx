import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

import CustomerInfo from "../CustomerInfo";
import AddressForm from "../AddressForm";
import OrderSummary from "../OrderSummary";
import Notification from "../Notification";
import CreditCardForm from "../../components/CreditCardForm";
import DebitCardForm from "../../components/DebitCardForm";
import "./Checkout.css";

// Função de debounce
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function Checkout() {
  const { cartItems, clearCart, total: cartTotal, frete } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    cep: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [pix, setPix] = useState({ text: null, link: null, expiresAt: null });
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Validar se o formulário está completo
  const isFormValid = address.cep && address.numero;

  // Determinar passo atual do stepper
  const currentStep = !user
    ? 1
    : !isFormValid
    ? 2
    : 3;

  // Mostrar notificação
  const showNotification = useCallback((message, type = "error") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  }, []);

  // Validar CEP
  const validateCEP = useCallback((cep) => {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    return cepRegex.test(cep);
  }, []);

  // Buscar endereço pelo CEP
  const handleCepSearch = useCallback(
    async (cepValue) => {
      const cep = cepValue.replace(/\D/g, "");

      if (!validateCEP(cepValue)) {
        showNotification(
          "Por favor, insira um CEP válido no formato 00000-000.",
          "error"
        );
        return;
      }

      setIsSearchingCep(true);
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        const data = response.data;

        if (data.erro) {
          showNotification(
            "CEP não encontrado. Verifique o número digitado.",
            "error"
          );
          return;
        }

        setAddress((prev) => ({
          ...prev,
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
          cep: data.cep,
        }));
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        showNotification("Erro ao buscar CEP. Tente novamente.", "error");
      } finally {
        setIsSearchingCep(false);
      }
    },
    [showNotification, validateCEP]
  );

  // Debounced CEP search
  const debouncedCepSearch = useCallback(
    debounce((cep) => handleCepSearch(cep), 500),
    [handleCepSearch]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Pagamento com cartão
  const handleCreditCardPayment = async (cardData) => {
    setIsProcessing(true);

    // Check for encryption errors from CreditCardForm
    if (cardData.encryptionError) {
      showNotification(cardData.encryptionError, "error");
      setIsProcessing(false);
      return;
    }

    if (!user) {
      showNotification("Você precisa estar logado para finalizar a compra.", "error");
      setIsProcessing(false);
      return;
    }

    if (!isFormValid) {
      showNotification("Por favor, preencha todos os campos obrigatórios do endereço.", "error");
      setIsProcessing(false);
      return;
    }

    const invalidItems = cartItems.filter((item) => !item.quantity || item.quantity < 1);
    if (invalidItems.length > 0) {
      showNotification("Alguns produtos têm quantidade inválida.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const shippingAddress = {
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento || "",
        bairro: address.bairro,
        localidade: address.localidade,
        uf: address.uf,
        cep: address.cep,
      };

      const response = await api.post("/payment/create-credit-card", {
        cartItems,
        shippingAddress,
        encryptedCard: cardData.encrypted,
        holderName: cardData.holder,
        installments: cardData.installments || 1,
        shippingPrice: frete,
      });

      const { orderId, status, isPaid } = response.data;

      if (isPaid) {
        showNotification("🎉 Pagamento aprovado com sucesso!", "success");
        setOrderPlaced(true);
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
      } else {
        showNotification(
          `Pagamento ${status.toLowerCase()}. Aguarde a confirmação.`,
          "info"
        );
        setOrderPlaced(true);
        clearCart();
        navigate(`/order-status/${orderId}`);
      }
    } catch (error) {
      let errorMessage = "Erro ao processar pagamento com cartão";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error_messages && Array.isArray(errorData.error_messages)) {
          errorMessage = errorData.error_messages
            .map((msg) => `${msg.description} (${msg.code})`)
            .join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      showNotification(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Pagamento com cartão de débito (3DS)
  const handleDebitCardPayment = async (cardData) => {
    setIsProcessing(true);

    if (cardData.encryptionError) {
      showNotification(cardData.encryptionError, "error");
      setIsProcessing(false);
      return;
    }

    if (!user) {
      showNotification("Você precisa estar logado para finalizar a compra.", "error");
      setIsProcessing(false);
      return;
    }

    if (!isFormValid) {
      showNotification("Por favor, preencha todos os campos obrigatórios do endereço.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const shippingAddress = {
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento || "",
        bairro: address.bairro,
        localidade: address.localidade,
        uf: address.uf,
        cep: address.cep,
      };

      const response = await api.post("/payment/create-debit-card", {
        cartItems,
        shippingAddress,
        encryptedCard: cardData.encrypted,
        holderName: cardData.holder,
        authenticationId: cardData.authenticationId,
        shippingPrice: frete,
      });

      const { orderId, status, isPaid } = response.data;

      if (isPaid) {
        showNotification("🎉 Pagamento aprovado com sucesso!", "success");
        setOrderPlaced(true);
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
      } else {
        showNotification(
          `Pagamento ${status.toLowerCase()}. Aguarde a confirmação.`,
          "info"
        );
        setOrderPlaced(true);
        clearCart();
        navigate(`/order-status/${orderId}`);
      }
    } catch (error) {
      let errorMessage = "Erro ao processar pagamento com débito";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error_messages && Array.isArray(errorData.error_messages)) {
          errorMessage = errorData.error_messages
            .map((msg) => `${msg.description} (${msg.code})`)
            .join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      showNotification(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Pagamento com PIX
  const handleCreatePreference = async (event) => {
    if (event) event.preventDefault();
    setIsProcessing(true);

    if (!user) {
      showNotification("Você precisa estar logado para finalizar a compra.", "error");
      setIsProcessing(false);
      return;
    }

    if (!isFormValid) {
      showNotification("Por favor, preencha todos os campos obrigatórios do endereço.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const shippingAddress = {
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento || "",
        bairro: address.bairro,
        localidade: address.localidade,
        uf: address.uf,
        cep: address.cep,
      };

      const response = await api.post("/payment/create-pix", {
        cartItems,
        shippingAddress,
        shippingPrice: frete,
        pixDiscount: pixDiscount,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao criar pagamento PIX");
      }

      const { qrCodeText, qrCodeLink, orderId, expiresAt, isPaid } =
        response.data;

      setPix({
        text: qrCodeText,
        link: qrCodeLink,
        expiresAt: expiresAt,
        orderId: orderId,
      });

      if (isPaid) {
        showNotification("🎉 Pagamento aprovado com sucesso!", "success");
        setOrderPlaced(true);
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
      } else {
        showNotification("PIX gerado! Escaneie o QR Code para pagar.", "info");
        setOrderPlaced(true);
        clearCart();
        navigate(`/order-status/${orderId}`);
      }
    } catch (error) {
      let errorMessage =
        "Não foi possível iniciar o processo de pagamento. Tente novamente.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error_messages && Array.isArray(errorData.error_messages)) {
          errorMessage = errorData.error_messages
            .map((msg) => `${msg.description} (${msg.code})`)
            .join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors[0].msg;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirecionar se carrinho estiver vazio
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [cartItems, navigate, orderPlaced]);

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="container text-center py-5">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#f5f5f5",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            color: "#ccc",
            fontSize: "1.5rem",
          }}
        >
          <i className="fas fa-shopping-bag"></i>
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a" }}>
          Seu carrinho está vazio
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#999" }}>
          Adicione itens ao seu carrinho antes de finalizar a compra.
        </p>
        <button
          className="checkout-btn checkout-btn--primary"
          style={{ width: "auto", padding: "10px 32px" }}
          onClick={() => navigate("/")}
        >
          Continuar Comprando
        </button>
      </div>
    );
  }

  // Calcular total do carrinho
  const total = cartTotal;
  const pixDiscountRate = 0.1;
  const pixDiscount = paymentMethod === "pix" ? total * pixDiscountRate : 0;
  const finalTotal = total - pixDiscount;

  return (
    <main className="container py-4">
      {/* Toast Notification */}
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() =>
          setNotification({ show: false, message: "", type: "" })
        }
      />

      {/* Stepper */}
      <div className="checkout-stepper">
        <div className={`checkout-step ${currentStep >= 1 ? "checkout-step--done" : ""}`}>
          <span className="checkout-step__number">
            {currentStep > 1 ? <i className="fas fa-check"></i> : "1"}
          </span>
          <span className="d-none d-sm-inline">Dados</span>
        </div>
        <div className={`checkout-step__connector ${currentStep > 1 ? "checkout-step__connector--done" : ""}`} />
        <div
          className={`checkout-step ${
            currentStep > 2
              ? "checkout-step--done"
              : currentStep === 2
              ? "checkout-step--active"
              : ""
          }`}
        >
          <span className="checkout-step__number">
            {currentStep > 2 ? <i className="fas fa-check"></i> : "2"}
          </span>
          <span className="d-none d-sm-inline">Endereço</span>
        </div>
        <div className={`checkout-step__connector ${currentStep > 2 ? "checkout-step__connector--done" : ""}`} />
        <div
          className={`checkout-step ${
            currentStep === 3 ? "checkout-step--active" : ""
          }`}
        >
          <span className="checkout-step__number">3</span>
          <span className="d-none d-sm-inline">Pagamento</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Forms */}
        <div className="col-12 col-lg-7">
          <CustomerInfo />
          <AddressForm
            address={address}
            onInputChange={handleInputChange}
            onCepSearch={debouncedCepSearch}
            isSearchingCep={isSearchingCep}
          />

          {/* Payment Method Selector */}
          <div className="checkout-card">
            <h2 className="checkout-card__title">
              <i className="fas fa-credit-card"></i>
              Método de Pagamento
            </h2>

            <div className="checkout-payment-selector">
              <div
                className={`checkout-payment-option ${
                  paymentMethod === "pix"
                    ? "checkout-payment-option--selected"
                    : ""
                }`}
                onClick={() => setPaymentMethod("pix")}
              >
                <span className="checkout-payment-option__check">
                  <i className="fas fa-check"></i>
                </span>
                <span className="checkout-payment-option__icon">
                  <i className="fa-brands fa-pix"></i>
                </span>
                <span className="checkout-payment-option__label">PIX</span>
                <span className="checkout-payment-option__badge">
                  10% OFF
                </span>
              </div>

              <div
                className={`checkout-payment-option ${
                  paymentMethod === "credit_card"
                    ? "checkout-payment-option--selected"
                    : ""
                }`}
                onClick={() => setPaymentMethod("credit_card")}
              >
                <span className="checkout-payment-option__check">
                  <i className="fas fa-check"></i>
                </span>
                <span className="checkout-payment-option__icon">💳</span>
                <span className="checkout-payment-option__label">Cartão</span>
                <small
                  style={{ display: "block", fontSize: "0.7rem", color: "#999", marginTop: 4 }}
                >
                  Até 12× no crédito
                </small>
              </div>

              <div
                className={`checkout-payment-option ${
                  paymentMethod === "debit_card"
                    ? "checkout-payment-option--selected"
                    : ""
                }`}
                onClick={() => setPaymentMethod("debit_card")}
              >
                <span className="checkout-payment-option__check">
                  <i className="fas fa-check"></i>
                </span>
                <span className="checkout-payment-option__icon">🏦</span>
                <span className="checkout-payment-option__label">Débito</span>
                <small
                  style={{ display: "block", fontSize: "0.7rem", color: "#999", marginTop: 4 }}
                >
                  À vista com 3DS
                </small>
              </div>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === "credit_card" && (
              <div className="mt-4" style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1rem" }}>
                <CreditCardForm
                  onPaymentSubmit={handleCreditCardPayment}
                  isProcessing={isProcessing}
                  totalAmount={total}
                />
              </div>
            )}

            {/* Debit Card Form */}
            {paymentMethod === "debit_card" && (
              <div className="mt-4" style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1rem" }}>
                <DebitCardForm
                  onPaymentSubmit={handleDebitCardPayment}
                  isProcessing={isProcessing}
                  totalAmount={total}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="col-12 col-lg-5">
          <div className="checkout-summary">
            <OrderSummary
              paymentDiscount={pixDiscount}
              paymentMethodLabel="Desconto PIX (10%)"
              finalTotal={finalTotal}
            />

            {/* PIX Action */}
            {paymentMethod === "pix" && (
              <>
                {pix.text ? (
                  <div className="checkout-pix-area">
                    <p
                      className="text-center fw-bold mb-3"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Pague via PIX
                    </p>
                    <textarea
                      className="form-control checkout-input"
                      readOnly
                      rows={3}
                      value={pix.text || ""}
                    />
                    {pix.link && (
                      <a
                        href={pix.link}
                        target="_blank"
                        rel="noreferrer"
                        className="checkout-btn checkout-btn--success mt-3"
                        style={{ textDecoration: "none" }}
                      >
                        <i className="fas fa-qrcode"></i>
                        Abrir QR Code
                      </a>
                    )}
                    <small
                      className="d-block mt-2 text-center"
                      style={{ fontSize: "0.73rem", color: "#999" }}
                    >
                      Após o pagamento, aguarde a confirmação automática.
                    </small>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreatePreference}
                    className="checkout-btn checkout-btn--primary mt-3"
                    disabled={isProcessing || !isFormValid}
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        Processando...
                      </>
                    ) : (
                      <>
                        <i className="fa-brands fa-pix"></i>
                        Gerar QR Code PIX
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Card Hint */}
            {paymentMethod === "credit_card" && !isProcessing && (
              <div className="checkout-card-hint">
                <i className="fas fa-info-circle"></i>
                Preencha os dados do cartão ao lado para finalizar.
              </div>
            )}

            {/* Trust Badges */}
            <div className="checkout-trust">
              <div className="checkout-trust__item">
                <div className="checkout-trust__icon checkout-trust__icon--green">
                  <i className="fas fa-lock"></i>
                </div>
                <div className="checkout-trust__text">
                  <strong>Compra segura</strong>
                  <span>Dados protegidos com criptografia</span>
                </div>
              </div>
              <div className="checkout-trust__item">
                <div className="checkout-trust__icon checkout-trust__icon--amber">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="checkout-trust__text">
                  <strong>Entrega garantida</strong>
                  <span>Ou seu dinheiro de volta</span>
                </div>
              </div>
              <div className="checkout-trust__item">
                <div className="checkout-trust__icon checkout-trust__icon--blue">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="checkout-trust__text">
                  <strong>Compra protegida</strong>
                  <span>Garantia de 7 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;