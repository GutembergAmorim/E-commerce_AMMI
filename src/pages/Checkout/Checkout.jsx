import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

// Componentes separados
import CustomerInfo from "../Customerinfo";
import AddressForm from "../AddressForm";
import OrderSummary from "../OrderSummary";
import Notification from "../Notification";
import CreditCardForm from "../../components/CreditCardForm"; // Novo componente

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
  const { cartItems, clearCart } = useCart();
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
  const [paymentMethod, setPaymentMethod] = useState("pix"); // "pix" ou "credit_card"
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Validar se o formulário está completo
  const isFormValid = address.cep && address.numero;

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

  useEffect(() => {
    console.log("isProcessing:", isProcessing);
    console.log("isFormValid:", isFormValid);
    console.log("Address completo:", address);
  }, [isProcessing, isFormValid, address]);

  // Nova função para pagamento com cartão
  const handleCreditCardPayment = async (cardData) => {
    setIsProcessing(true);

    console.log("📋 CartItems antes do envio:", cartItems);

    // Validações
    if (!user) {
      showNotification(
        "Você precisa estar logado para finalizar a compra.",
        "error"
      );
      setIsProcessing(false);
      return;
    }

    if (!isFormValid) {
      showNotification(
        "Por favor, preencha todos os campos obrigatórios do endereço.",
        "error"
      );
      setIsProcessing(false);
      return;
    }

    const invalidItems = cartItems.filter(item => !item.quantity || item.quantity < 1);
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

      console.log("Enviando pagamento com cartão...");
      const response = await api.post("/payment/create-credit-card", {
        cartItems,
        shippingAddress,
        cardData,
        installments: cardData.installments || 1
      });

      const { success, orderId, status, isPaid, message } = response.data;

      if (success) {
        if (isPaid) {
          showNotification("Pagamento aprovado com sucesso!", "success");
          clearCart();
          navigate(`/order-confirmation/${orderId}`);
        } else {
          showNotification(`Pagamento ${status.toLowerCase()}. Aguarde a confirmação.`, "info");
          navigate(`/order-pending/${orderId}`);
        }
      } else {
        showNotification(message || "Erro no pagamento", "error");
      }

    } catch (error) {
      console.error("Erro no pagamento com cartão:", error.response?.data || error.message);
      
      let errorMessage = "Erro ao processar pagamento com cartão";
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error_messages && Array.isArray(errorData.error_messages)) {
          errorMessage = errorData.error_messages.map(msg => 
            `${msg.description} (${msg.code})`
          ).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Função existente para PIX
  const handleCreatePreference = async (event) => {
    if (event) event.preventDefault();

    console.log("Iniciando criação de PIX...");
    console.log("Dados do usuário:", user);
    console.log("Itens do carrinho:", cartItems);
    console.log("Endereço:", address);

    setIsProcessing(true);

    // Validações
    if (!user) {
      showNotification(
        "Você precisa estar logado para finalizar a compra.",
        "error"
      );
      setIsProcessing(false);
      return;
    }

    if (!isFormValid) {
      showNotification(
        "Por favor, preencha todos os campos obrigatórios do endereço.",
        "error"
      );
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

      console.log("Enviando para API...");
      const response = await api.post("/payment/create-pix", {
        cartItems,
        shippingAddress,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao criar pagamento PIX");
      }

      const { qrCodeText, qrCodeLink, orderId, expiresAt } = response.data;
      
      setPix({ 
        text: qrCodeText, 
        link: qrCodeLink, 
        expiresAt: expiresAt,
        orderId: orderId 
      });
      
      console.log("PIX criado com sucesso:", response.data);
      
    } catch (error) {
      console.error(
        "Erro ao criar PIX:",
        error.response?.data || error.message
      );

      let errorMessage = "Não foi possível iniciar o processo de pagamento. Tente novamente.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error_messages && Array.isArray(errorData.error_messages)) {
          errorMessage = errorData.error_messages.map(msg => 
            `${msg.description} (${msg.code})`
          ).join(', ');
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
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  if (cartItems.length === 0) {
    return (
      <div className="container text-center py-5">
        <h1 className="mb-4">Seu carrinho está vazio</h1>
        <p>Adicione itens ao seu carrinho antes de finalizar a compra.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Continuar Comprando
        </button>
      </div>
    );
  }

  // Calcular total do carrinho
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <main className="container py-4">
      <h1 className="text-center mt-4 mb-5">Finalizar Compra</h1>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: "", type: "" })}
      />

      <div className="row g-4">
        {/* Coluna de formulários */}
        <div className="col-12 col-lg-7">
          <CustomerInfo />
          <AddressForm
            address={address}
            onInputChange={handleInputChange}
            onCepSearch={debouncedCepSearch}
            isSearchingCep={isSearchingCep}
          />

          {/* Seletor de Método de Pagamento */}
          <div className="card shadow-sm p-4 mt-4">
            <h5 className="mb-3">Método de Pagamento</h5>
            
            <div className="row g-3">
              <div className="col-6">
                <button
                  type="button"
                  className={`btn w-100 py-3 ${paymentMethod === 'pix' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  📱 PIX
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className={`btn w-100 py-3 ${paymentMethod === 'credit_card' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  💳 Cartão
                </button>
              </div>
            </div>

            {/* Formulário de Cartão */}
            {paymentMethod === 'credit_card' && (
              <div className="mt-4">
                <CreditCardForm
                  onPaymentSubmit={handleCreditCardPayment}
                  isProcessing={isProcessing}
                  totalAmount={total}
                />
              </div>
            )}
          </div>
        </div>

        {/* Coluna do resumo */}
        <div className="col-12 col-lg-5">
          <div
            className="card shadow-sm p-4 sticky-top"
            style={{ top: "20px" }}
          >
            <OrderSummary
              onCheckout={paymentMethod === 'pix' ? handleCreatePreference : undefined}
              isProcessing={isProcessing}
              isFormValid={isFormValid}
            />

            {/* Área do PIX */}
            {paymentMethod === 'pix' && (
              <>
                {pix.text ? (
                  <div className="mt-4">
                    <p className="text-center fw-bold mb-3">Pague via PIX</p>
                    <div className="mb-3">
                      <textarea 
                        className="form-control" 
                        readOnly 
                        rows={3} 
                        value={pix.text || ''} 
                      />
                    </div>
                    {pix.link && (
                      <a 
                        href={pix.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-success w-100"
                      >
                        Abrir QR Code
                      </a>
                    )}
                    <small className="text-muted d-block mt-2">
                      Após o pagamento, aguarde a confirmação automática.
                    </small>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreatePreference}
                    className="btn btn-primary w-100 fw-bold py-2 mt-3"
                    disabled={isProcessing || !isFormValid}
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Processando...
                      </>
                    ) : (
                      "Gerar QR Code PIX"
                    )}
                  </button>
                )}
              </>
            )}

            {/* Mensagem para cartão */}
            {paymentMethod === 'credit_card' && !isProcessing && (
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  Preencha os dados do cartão no formulário ao lado para finalizar o pagamento.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;