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
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix"); // "pix" or "credit_card"

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

  // ── Finalizar Compra → Redirect to InfinitePay ──────────────────────
  const handleCheckout = async (event) => {
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

      const response = await api.post("/payment/create-checkout", {
        cartItems,
        shippingAddress,
        shippingPrice: frete,
        paymentMethod,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao criar checkout");
      }

      const { checkoutUrl, orderId } = response.data;

      // Clear cart before redirect
      setOrderPlaced(true);
      clearCart();

      showNotification("Redirecionando para o pagamento seguro...", "info");

      // Redirect to InfinitePay checkout
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 800);

    } catch (error) {
      let errorMessage =
        "Não foi possível iniciar o processo de pagamento. Tente novamente.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
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
  const pixDiscount = paymentMethod === "pix" ? total * 0.10 : 0;
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

          {/* Payment Method Selection */}
          <div className="checkout-card">
            <h2 className="checkout-card__title">
              <i className="fas fa-credit-card"></i>
              Forma de Pagamento
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* PIX Option */}
              <label
                onClick={() => setPaymentMethod("pix")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 18px",
                  borderRadius: "12px",
                  border: paymentMethod === "pix" ? "2px solid #16a34a" : "2px solid #e5e7eb",
                  background: paymentMethod === "pix" ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: paymentMethod === "pix" ? "6px solid #16a34a" : "2px solid #ccc",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fa-brands fa-pix" style={{ color: "#32BCAD", fontSize: "1.1rem" }}></i>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>PIX</span>
                    <span style={{
                      background: "#dcfce7", color: "#16a34a",
                      padding: "2px 10px", borderRadius: "10px",
                      fontSize: "0.7rem", fontWeight: 700,
                    }}>10% OFF</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#666" }}>
                    Pagamento instantâneo com desconto
                  </p>
                </div>
                {paymentMethod === "pix" && (
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" }}>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total - total * 0.10)}
                  </span>
                )}
              </label>

              {/* Credit Card Option */}
              <label
                onClick={() => setPaymentMethod("credit_card")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 18px",
                  borderRadius: "12px",
                  border: paymentMethod === "credit_card" ? "2px solid #1a1a1a" : "2px solid #e5e7eb",
                  background: paymentMethod === "credit_card" ? "#fafafa" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: paymentMethod === "credit_card" ? "6px solid #1a1a1a" : "2px solid #ccc",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.1rem" }}>💳</span>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>Cartão de Crédito</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#666" }}>
                    Até 3× sem juros
                  </p>
                </div>
                {paymentMethod === "credit_card" && (
                  <span style={{ fontSize: "0.78rem", color: "#555", whiteSpace: "nowrap" }}>
                    3× {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total / 3)}
                  </span>
                )}
              </label>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginTop: "14px", padding: "10px 14px",
              background: "#f9fafb", borderRadius: "8px",
              fontSize: "0.78rem", color: "#666"
            }}>
              <i className="fas fa-shield-alt" style={{ color: "#16a34a" }}></i>
              Pagamento 100% seguro processado pela InfinitePay
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="col-12 col-lg-5">
          <div className="checkout-summary">
            <OrderSummary
              paymentDiscount={pixDiscount}
              paymentMethodLabel={paymentMethod === "pix" ? "Desconto PIX (10%)" : ""}
              finalTotal={finalTotal}
            />

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="checkout-btn checkout-btn--primary mt-3"
              disabled={isProcessing || !isFormValid}
              style={{ fontSize: "0.95rem" }}
            >
              {isProcessing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  Redirecionando...
                </>
              ) : (
                <>
                  <i className="fas fa-lock" style={{ marginRight: "8px" }}></i>
                  Finalizar Compra
                </>
              )}
            </button>

            <p style={{
              textAlign: "center",
              fontSize: "0.72rem",
              color: "#999",
              marginTop: "8px"
            }}>
              Você será redirecionado para o pagamento seguro
            </p>

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