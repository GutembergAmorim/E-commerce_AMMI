// /frontend/src/pages/PaymentFailure.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container text-center py-5">
      <div className="alert alert-danger">
        <h2>Pagamento Não Aprovado</h2>
        <p>O pagamento do pedido #{orderId} não foi aprovado.</p>
        <button 
          className="btn btn-primary me-2"
          onClick={() => navigate('/checkout')}
        >
          Tentar Novamente
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;