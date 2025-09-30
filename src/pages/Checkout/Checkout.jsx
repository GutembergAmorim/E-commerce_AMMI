import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
// Removido Mercado Pago

// Componentes separados
import CustomerInfo from "../Customerinfo";
import AddressForm from "../AddressForm";
import OrderSummary from "../OrderSummary";
import Notification from "../Notification";

// Sem SDK externo: fluxo via QR Code PIX

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

  const handleCreatePreference = async (event) => {
    if (event) event.preventDefault();

    console.log("Iniciando criação de preferência...");
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
      
      // CORREÇÃO: Verificar se a resposta é de sucesso
      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao criar pagamento PIX");
      }

      // CORREÇÃO: Acessar os dados corretamente
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
        "Erro ao criar preferência:",
        error.response?.data || error.message
      );

      // CORREÇÃO: Tratamento de erro mais robusto
      let errorMessage = "Não foi possível iniciar o processo de pagamento. Tente novamente.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Se for erro do PagSeguro com array error_messages
        if (errorData.error_messages && Array.isArray(errorData.error_messages)) {
          errorMessage = errorData.error_messages.map(msg => 
            `${msg.description} (${msg.code})`
          ).join(', ');
        } 
        // Se for erro normal da API
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Se for array de errors (como você tinha antes)
        else if (Array.isArray(errorData.errors)) {
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

  return (
    <main className="container py-4">
      <h1 className="text-center mt-4 mb-5">Finalizar Compra</h1>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: "", type: "" })}
      />

      <form onSubmit={handleCreatePreference}>
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
          </div>

          {/* Coluna do resumo */}
          <div className="col-12 col-lg-5">
            <div
              className="card shadow-sm p-4 sticky-top"
              style={{ top: "20px" }}
            >
              {/* Seu componente OrderSummary aqui */}
              <OrderSummary
                onCheckout={handleCreatePreference}
                isProcessing={isProcessing}
                isFormValid={isFormValid}
              />

              {/* Área do PIX */}
              {pix.text ? (
                <div className="mt-4">
                  <p className="text-center fw-bold mb-3">Pague via PIX</p>
                  <div className="mb-3">
                    <textarea className="form-control" readOnly rows={3} value={pix.text || ''} />
                  </div>
                  {pix.link && (
                    <a href={pix.link} target="_blank" rel="noreferrer" className="btn btn-success w-100">Abrir QR Code</a>
                  )}
                  <small className="text-muted d-block mt-2">Após o pagamento, aguarde a confirmação automática.</small>
                </div>
              ) : (
                <button
                  type="submit"
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
                    "Gerar PIX"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

export default Checkout;
