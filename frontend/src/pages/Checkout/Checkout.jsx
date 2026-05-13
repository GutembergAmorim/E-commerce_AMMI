import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { calculateShipping } from "../../services/shippingService";

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
  const { cartItems, clearCart, total: cartTotal, frete, subtotal, isFreeShipping, setShippingData, setFreeShippingEligible, resetShipping } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Coupon from Cart page
  const couponData = location.state?.coupon || null;
  const couponDiscount = couponData?.discount || 0;

  const [address, setAddress] = useState({
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    cep: "",
  });

  const [personalInfo, setPersonalInfo] = useState({
    cpf: user?.cpf || "",
    phone: user?.phone || "",
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

  // Shipping options state
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

  // Reset shipping quando CEP muda
  useEffect(() => {
    return () => resetShipping();
  }, []);

  // Validar se o formulário está completo
  const isFormValid = address.cep && address.numero && (isFreeShipping || selectedShipping !== null);

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
      setShippingOptions([]);
      setSelectedShipping(null);
      setShippingError("");
      resetShipping();

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

        // Sempre calcular frete para pegar opções de entrega (ou aplicar frete grátis geral)
        setIsCalculatingShipping(true);
        try {
          const products = cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            weight: 0.3,
          }));
          const shippingResult = await calculateShipping(cep, products);

          // Atualiza elegibilidade (mantido para compatibilidade, mas o backend sempre retorna true)
          if (shippingResult.freeShippingEligible !== undefined) {
            setFreeShippingEligible(shippingResult.freeShippingEligible);
          }

          // Se é frete grátis (subtotal > 299 para todo o Brasil), não precisa mostrar opções pagas
          const qualifiesFreeShipping = subtotal > 299;

          if (!qualifiesFreeShipping) {
            if (shippingResult.success && shippingResult.options?.length > 0) {
              setShippingOptions(shippingResult.options);
            } else {
              setShippingError("Não foi possível calcular o frete para este CEP.");
            }
          }
        } catch (shippingErr) {
          console.error("Erro ao calcular frete:", shippingErr);
          setShippingError("Erro ao calcular frete. Tente novamente.");
        } finally {
          setIsCalculatingShipping(false);
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        showNotification("Erro ao buscar CEP. Tente novamente.", "error");
      } finally {
        setIsSearchingCep(false);
      }
    },
    [showNotification, validateCEP, cartItems, subtotal, resetShipping, setFreeShippingEligible]
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

    if (!personalInfo.cpf || personalInfo.cpf.replace(/\D/g, "").length !== 11) {
      showNotification("Por favor, preencha um CPF válido (11 dígitos).", "error");
      setIsProcessing(false);
      return;
    }

    if (!personalInfo.phone || personalInfo.phone.replace(/\D/g, "").length < 10) {
      showNotification("Por favor, preencha um telefone válido com DDD.", "error");
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
        shippingPrice: isFreeShipping ? 0 : (selectedShipping !== null ? shippingOptions[selectedShipping]?.price : 0),
        paymentMethod,
        couponCode: couponData?.code || null,
        couponDiscount: couponDiscount,
        cpf: personalInfo.cpf,
        phone: personalInfo.phone,
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

  // Calcular total do carrinho (cartTotal já inclui frete, mas NÃO o cupom)
  const total = cartTotal - couponDiscount;
  const pixDiscount = 0 //paymentMethod === "pix" ? total * 0.05 : 0;
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

          {/* Collect missing personal info if necessary */}
          {(!user?.cpf || !user?.phone) && (
            <div className="checkout-card mb-4" style={{ marginTop: '-15px' }}>
              <h2 className="checkout-card__title">
                <i className="fas fa-exclamation-circle text-warning"></i>
                Complete seu Cadastro
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                Precisamos de algumas informações adicionais para emissão da etiqueta de envio e nota fiscal.
              </p>
              
              <div className="row g-3">
                {!user?.cpf && (
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>CPF</label>
                    <input
                      type="text"
                      className="form-control"
                      value={personalInfo.cpf}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 11) val = val.slice(0, 11);
                        if (val.length > 9) val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
                        else if (val.length > 6) val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
                        else if (val.length > 3) val = val.replace(/(\d{3})(\d{1,3})/, "$1.$2");
                        setPersonalInfo(prev => ({ ...prev, cpf: val }));
                      }}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                )}
                
                {!user?.phone && (
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={personalInfo.phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 11) val = val.slice(0, 11);
                        if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                        if (val.length > 9) val = `${val.slice(0, 9)}-${val.slice(9)}`;
                        setPersonalInfo(prev => ({ ...prev, phone: val }));
                      }}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <AddressForm
            id="checkout-address-form"
            address={address}
            onInputChange={handleInputChange}
            onCepSearch={debouncedCepSearch}
            isSearchingCep={isSearchingCep}
          />

          {/* Shipping Options Section */}
          {!isFreeShipping && address.cep && (
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <i className="fas fa-truck"></i>
                Opções de Envio
              </h2>

              {isCalculatingShipping && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <span className="spinner-border spinner-border-sm" role="status" style={{ marginRight: 8 }}></span>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Calculando frete...</span>
                </div>
              )}

              {shippingError && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <i className="fas fa-exclamation-circle"></i>
                  {shippingError}
                </div>
              )}

              {!isCalculatingShipping && shippingOptions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {shippingOptions.map((option, index) => (
                    <label
                      key={option.id}
                      onClick={() => {
                        setSelectedShipping(index);
                        setShippingData(option.price, option.name);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 18px',
                        borderRadius: 12,
                        border: selectedShipping === index ? '2px solid #1a1a1a' : '2px solid #e5e7eb',
                        background: selectedShipping === index ? '#fafafa' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: selectedShipping === index ? '6px solid #1a1a1a' : '2px solid #ccc',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fas fa-box" style={{ color: '#888', fontSize: '0.9rem' }}></i>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>
                            {option.name}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#888' }}>
                            — {option.company}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#666' }}>
                          {option.deliveryRange
                            ? `${option.deliveryRange.min} a ${option.deliveryRange.max} dias úteis`
                            : `${option.deliveryDays} dias úteis`}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#1a1a1a',
                        whiteSpace: 'nowrap',
                      }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(option.price)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {isFreeShipping && address.cep && (
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <i className="fas fa-truck"></i>
                Envio
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                borderRadius: 12,
                border: '2px solid #bbf7d0',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#16a34a', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', flexShrink: 0,
                }}>
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#166534' }}>
                    Frete Grátis!
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#16a34a' }}>
                    Pedidos acima de R$ 299,00 têm frete grátis para todo o Brasil
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    }}></span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#666" }}>
                    Pagamento instantâneo
                  </p>
                </div>
                {paymentMethod === "pix" && (
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" }}>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
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
                    Até 4× sem juros
                  </p>
                </div>
                {paymentMethod === "credit_card" && (
                  <span style={{ fontSize: "0.78rem", color: "#555", whiteSpace: "nowrap" }}>
                    4× {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total / 4)}
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
              paymentMethodLabel={paymentMethod === "pix" ? "" : ""}
              couponDiscount={couponDiscount}
              couponCode={couponData?.code}
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
