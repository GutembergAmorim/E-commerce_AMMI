import React, { useState } from "react";

const CreditCardForm = ({  onPaymentSubmit, isProcessing, totalAmount  }) => {
    const [cardData, setCardData] = useState({
        number: '',
        holder: '',
        exp_month: '',
        exp_year: '',
        security_code: '',
        installments: 1
    });

    const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onPaymentSubmit(cardData);
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
          placeholder="1234 5678 9012 3456"
          className={`form-control ${errors.number ? 'is-invalid' : ''}`}
          maxLength={19}
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
          />
          {errors.security_code && <div className="invalid-feedback">{errors.security_code}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Parcelas</label>
        <select
          value={cardData.installments}
          onChange={(e) => handleInputChange('installments', parseInt(e.target.value))}
          className="form-select"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>
              {num}x de R$ {(totalAmount / num).toFixed(2)} {num === 1 ? '(à vista)' : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className={`btn btn-primary w-100 fw-bold py-2 ${
          isProcessing ? 'disabled' : ''
        }`}
      >
        {isProcessing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Processando...
          </>
        ) : (
          `Pagar R$ ${totalAmount.toFixed(2)}`
        )}
      </button>

      {/* Cartões de Teste */}
      {/* <div className="mt-3 p-3 bg-warning bg-opacity-10 rounded">
        <small className="text-muted">
          <strong>💡 Cartões de Teste (Sandbox):</strong><br/>
          Visa: 4111 1111 1111 1111<br/>
          MasterCard: 5555 6666 7777 8884<br/>
          CVV: 123 | Validade: Qualquer data futura
        </small>
      </div> */}
    </form>
  );
}

export default CreditCardForm;