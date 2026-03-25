import React, { useState } from "react";
import api from "../services/api";

const DebitCardForm = ({ onPaymentSubmit, isProcessing, totalAmount }) => {
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    exp_month: '',
    exp_year: '',
    security_code: '',
  });

  const [errors, setErrors] = useState({});
  const [authStatus, setAuthStatus] = useState(''); // '', 'authenticating', 'authenticated', 'error'

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    switch (field) {
      case 'number':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
        break;
      case 'exp_month':
        formattedValue = value.replace(/\D/g, '').slice(0, 2);
        break;
      case 'exp_year':
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
        break;
      case 'security_code':
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
        break;
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardData.number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.number = 'Número do cartão inválido';
    }

    if (!cardData.holder.trim()) {
      newErrors.holder = 'Nome do titular é obrigatório';
    }

    if (!cardData.exp_month || cardData.exp_month.length !== 2) {
      newErrors.exp_month = 'Mês inválido';
    }

    if (!cardData.exp_year || cardData.exp_year.length !== 4) {
      newErrors.exp_year = 'Ano inválido';
    }

    if (!cardData.security_code || (cardData.security_code.length < 3 || cardData.security_code.length > 4)) {
      newErrors.security_code = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const publicKey = import.meta.env.VITE_PAGSEGURO_PUBLIC_KEY;

    // Step 1: Check SDK availability
    if (!window.PagSeguro || !window.PagSeguro.encryptCard) {
      onPaymentSubmit({ encryptionError: "SDK do PagBank não carregado. Recarregue a página." });
      return;
    }

    // Step 2: Encrypt card
    const card = window.PagSeguro.encryptCard({
      publicKey: publicKey,
      holder: cardData.holder,
      number: cardData.number.replace(/\s/g, ''),
      expMonth: cardData.exp_month,
      expYear: cardData.exp_year,
      securityCode: cardData.security_code
    });

    if (card.hasErrors) {
      const errorMessages = card.errors.map(err => err.message || err.code || err).join(', ');
      onPaymentSubmit({ encryptionError: `Erro na criptografia: ${errorMessages}` });
      return;
    }

    setAuthStatus('authenticating');

    try {
      // Step 3: Get 3DS session from backend
      const sessionResponse = await api.post("/payment/create-3ds-session");
      const { session } = sessionResponse.data;

      if (!session) {
        throw new Error("Sessão 3DS não retornada pelo servidor.");
      }

      console.log("🔐 Sessão 3DS obtida:", session);

      // Step 4: Setup PagSeguro SDK and authenticate
      const env = import.meta.env.VITE_PAGSEGURO_PUBLIC_KEY ? 'sandbox' : 'production';
      
      PagSeguro.setUp({
        session: session,
        env: 'PROD'
      });

      const authResult = await PagSeguro.authenticate3DS({
        data: {
          paymentMethod: {
            type: "DEBIT_CARD",
            installments: 1,
            card: {
              number: cardData.number.replace(/\s/g, ''),
              expMonth: cardData.exp_month,
              expYear: cardData.exp_year,
              holder: {
                name: cardData.holder
              }
            }
          },
          customer: {
            name: cardData.holder,
            email: "comprador@email.com.br",
            phones: [{
              country: "55",
              area: "11",
              number: "999999999",
              type: "MOBILE"
            }]
          },
          amount: {
            value: Math.round(totalAmount * 100),
            currency: "BRL"
          },
          billingAddress: {
            street: "Avenida Brigadeiro Faria Lima",
            number: "1384",
            complement: "apto 12",
            regionCode: "SP",
            country: "BRA",
            city: "Sao Paulo",
            postalCode: "01311300"
          },
          dataOnly: false
        }
      });

      console.log("🔐 Resultado da autenticação 3DS:", authResult);

      if (authResult.status === 'AUTH_FLOW_COMPLETED' || authResult.status === 'CHANGE_PAYMENT_METHOD') {
        if (authResult.status === 'CHANGE_PAYMENT_METHOD') {
          setAuthStatus('error');
          onPaymentSubmit({ encryptionError: "Este cartão não suporta débito com 3DS. Tente outro método de pagamento." });
          return;
        }

        setAuthStatus('authenticated');

        // Step 5: Send encrypted card + auth ID to parent
        onPaymentSubmit({
          encrypted: card.encryptedCard,
          holder: cardData.holder,
          authenticationId: authResult.id,
        });
      } else if (authResult.status === 'AUTH_NOT_SUPPORTED') {
        setAuthStatus('error');
        onPaymentSubmit({ encryptionError: "Autenticação 3DS não suportada para este cartão. Tente outro cartão ou método de pagamento." });
      } else {
        setAuthStatus('error');
        onPaymentSubmit({ encryptionError: `Autenticação 3DS falhou: ${authResult.status}` });
      }

    } catch (error) {
      console.error("Erro no fluxo 3DS:", error);
      console.error("Detalhes:", JSON.stringify(error, null, 2));
      setAuthStatus('error');
      onPaymentSubmit({ encryptionError: error.response?.data?.message || error.message || "Erro na autenticação 3DS" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="mb-3">
        <label className="form-label">Número do Cartão</label>
        <input
          type="text"
          value={cardData.number}
          onChange={(e) => handleInputChange('number', e.target.value)}
          placeholder="4000 0000 0000 2701"
          className={`form-control ${errors.number ? 'is-invalid' : ''}`}
          maxLength={19}
          disabled={authStatus === 'authenticating'}
        />
        {errors.number && <div className="invalid-feedback">{errors.number}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Nome do Titular</label>
        <input
          type="text"
          value={cardData.holder}
          onChange={(e) => handleInputChange('holder', e.target.value.toUpperCase())}
          placeholder="JOAO DA SILVA"
          className={`form-control ${errors.holder ? 'is-invalid' : ''}`}
          disabled={authStatus === 'authenticating'}
        />
        {errors.holder && <div className="invalid-feedback">{errors.holder}</div>}
      </div>

      <div className="row">
        <div className="col-6">
          <label className="form-label">Validade</label>
          <div className="row g-2">
            <div className="col-6">
              <input
                type="text"
                value={cardData.exp_month}
                onChange={(e) => handleInputChange('exp_month', e.target.value)}
                placeholder="MM"
                className={`form-control ${errors.exp_month ? 'is-invalid' : ''}`}
                maxLength={2}
                disabled={authStatus === 'authenticating'}
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                value={cardData.exp_year}
                onChange={(e) => handleInputChange('exp_year', e.target.value)}
                placeholder="AAAA"
                className={`form-control ${errors.exp_year ? 'is-invalid' : ''}`}
                maxLength={4}
                disabled={authStatus === 'authenticating'}
              />
            </div>
          </div>
          {(errors.exp_month || errors.exp_year) && (
            <div className="invalid-feedback d-block">
              {errors.exp_month || errors.exp_year}
            </div>
          )}
        </div>

        <div className="col-6">
          <label className="form-label">CVV</label>
          <input
            type="text"
            value={cardData.security_code}
            onChange={(e) => handleInputChange('security_code', e.target.value)}
            placeholder="123"
            className={`form-control ${errors.security_code ? 'is-invalid' : ''}`}
            maxLength={4}
            disabled={authStatus === 'authenticating'}
          />
          {errors.security_code && <div className="invalid-feedback">{errors.security_code}</div>}
        </div>
      </div>

      {authStatus === 'authenticating' && (
        <div className="alert alert-info mt-3 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Autenticando com o banco emissor... Aguarde o popup de verificação.
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || authStatus === 'authenticating'}
        className="checkout-btn checkout-btn--primary mt-3"
      >
        {isProcessing || authStatus === 'authenticating' ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status"></span>
            {authStatus === 'authenticating' ? 'Autenticando 3DS...' : 'Processando...'}
          </>
        ) : (
          `Pagar R$ ${totalAmount.toFixed(2)} no Débito`
        )}
      </button>

      <small className="d-block mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
        <i className="fas fa-shield-alt me-1"></i>
        Pagamento autenticado via 3D Secure pelo banco emissor.
      </small>
    </form>
  );
}

export default DebitCardForm;
