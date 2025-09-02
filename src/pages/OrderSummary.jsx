import React from "react";
import { useCart } from "../Context/CartContext";

const OrderSummary = ({ onCheckout, isProcessing, isFormValid }) => {
  const { cartItems, subtotal, discount, total } = useCart();

  return (
    <div className="card shadow-sm p-4 mt-4 mt-md-0">
      <h2 className="text-center h4 fw-bold mb-4">Resumo do Pedido</h2>
      
      <ul className="list-group list-group-flush mb-4">
        {cartItems.map((item) => (
          <li
            key={`${item.id}-${item.color}-${item.size}`}
            className="list-group-item d-flex justify-content-between align-items-center px-0 border-0"
          >
            <div className="d-flex align-items-center">
              <div className="me-3">
                <img
                  className="rounded"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                  src={item.image}
                  alt={item.name}
                />
              </div>
              <div>
                <h6 className="my-0 fw-bold">{item.name}</h6>
                <small className="text-muted">
                  {item.quantity} × R$ {item.price.toFixed(2)}
                  {item.color && ` • Cor: ${item.color}`}
                  {item.size && ` • Tam: ${item.size}`}
                </small>
              </div>
            </div>
            <span className="fw-bold">
              R$ {(item.quantity * item.price).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      
      
      <div className="border-top pt-3">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <strong>R$ {(subtotal || 0).toFixed(2)}</strong>
        </div>
        {discount > 0 && (
          <div className="d-flex justify-content-between text-success mb-2">
            <span>Descontos</span>
            <strong>- R$ {(discount || 0).toFixed(2)}</strong>
          </div>
        )}
        <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top">
          <span>Total</span>
          <span>R$ {(total || 0).toFixed(2)}</span>
        </div>
      </div>
      
      {/* <div className="mt-4">
        <button
          type="submit"
          className="btn btn-primary w-100 fw-bold py-2"
          disabled={isProcessing || !isFormValid}
          onClick={onCheckout}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Processando...
            </>
          ) : (
            "Finalizar Compra"
          )}
        </button>
        
        <div className="mt-3 text-center">
          <small className="text-muted">
            <i className="bi bi-lock-fill me-1"></i>
            Pagamento seguro via Mercado Pago
          </small>
        </div>
      </div> */}
    </div>
  );
};

export default OrderSummary;