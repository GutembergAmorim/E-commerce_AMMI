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
  const finalTotal = total;

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

          {/* Payment Method Info */}
          <div className="checkout-card">
            <h2 className="checkout-card__title">
              <i className="fas fa-credit-card"></i>
              Pagamento
            </h2>

            <div style={{
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.75rem" }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <i className="fas fa-shield-alt" style={{ color: "#16a34a", fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>
                    Pagamento 100% Seguro
                  </p>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#666" }}>
                    Processado pela InfinitePay
                  </p>
                </div>
              </div>

              <p style={{ fontSize: "0.82rem", color: "#555", margin: "0 0 1rem 0", lineHeight: 1.6 }}>
                Ao clicar em <strong>"Finalizar Compra"</strong>, você será direcionado para a página segura da InfinitePay, onde poderá escolher a forma de pagamento:
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#333",
                  border: "1px solid #e0e0e0"
                }}>
                  <i className="fa-brands fa-pix" style={{ color: "#32BCAD" }}></i>
                  PIX
                  <span style={{
                    background: "#dcfce7",
                    color: "#16a34a",
                    padding: "1px 8px",
                    borderRadius: "10px",
                    fontSize: "0.68rem",
                    fontWeight: 700
                  }}>
                    Taxa 0%
                  </span>
                </span>

                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#333",
                  border: "1px solid #e0e0e0"
                }}>
                  💳 Crédito
                  <span style={{ fontSize: "0.68rem", color: "#888", fontWeight: 400 }}>até 12×</span>
                </span>

                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#333",
                  border: "1px solid #e0e0e0"
                }}>
                  🏦 Débito
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="col-12 col-lg-5">
          <div className="checkout-summary">
            <OrderSummary
              paymentDiscount={0}
              paymentMethodLabel=""
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