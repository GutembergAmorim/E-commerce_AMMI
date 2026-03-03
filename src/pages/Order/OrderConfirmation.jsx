import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Download, MapPin, Copy, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      setError('Pedido não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const shortOrderId = (id) => {
    if (!id) return '';
    return id.slice(-8).toUpperCase();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3 text-muted">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1 className="h3">Pedido não encontrado</h1>
          <p className="text-muted mb-4">{error || 'O pedido solicitado não existe.'}</p>
          <Link to="/orders" className="btn btn-dark rounded-pill px-4">
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  const paymentLabel = order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">

          {/* ---- Success Header ---- */}
          <div className="confirmation-header">
            <div className="confirmation-header__icon">
              <CheckCircle size={36} />
            </div>
            <h1 className="confirmation-header__title">Pedido Confirmado!</h1>
            <p className="confirmation-header__subtitle">
              Obrigado por sua compra! Seu pedido foi recebido e está sendo processado.
            </p>
            <span className="confirmation-header__order-id">
              <Package size={14} />
              Pedido #{shortOrderId(order._id)}
            </span>
          </div>

          {/* ---- Quick Summary Grid ---- */}
          <div className="confirmation-summary">
            <div className="confirmation-summary__item">
              <span className="confirmation-summary__label">Data do Pedido</span>
              <span className="confirmation-summary__value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="confirmation-summary__item">
              <span className="confirmation-summary__label">Pagamento</span>
              <span className="confirmation-summary__value">{paymentLabel}</span>
            </div>
            <div className="confirmation-summary__item">
              <span className="confirmation-summary__label">Status</span>
              <span className="confirmation-summary__value">
                <span className={`badge ${
                  order.status === 'Pago' ? 'bg-success' :
                  order.status === 'Processando' ? 'bg-warning text-dark' :
                  order.status === 'Pendente' ? 'bg-secondary' : 'bg-info'
                }`} style={{ fontSize: '0.78rem' }}>
                  {order.status}
                </span>
              </span>
            </div>
            <div className="confirmation-summary__item">
              <span className="confirmation-summary__label">Total</span>
              <span className="confirmation-summary__value">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* ---- Product Items ---- */}
          <div className="confirm-info-card mb-4">
            <div className="confirm-info-card__header">
              <Package size={18} />
              Itens do Pedido ({order.orderItems?.length || 0})
            </div>
            <div className="confirm-info-card__body">
              {order.orderItems.map((item, index) => (
                <div key={index} className="confirm-product-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="confirm-product-item__image"
                  />
                  <div className="confirm-product-item__info">
                    <p className="confirm-product-item__name">{item.name}</p>
                    <p className="confirm-product-item__meta">
                      {item.color && `Cor: ${item.color}`}
                      {item.color && item.size && ' • '}
                      {item.size && `Tam: ${item.size}`}
                    </p>
                  </div>
                  <div className="confirm-product-item__price">
                    <p className="confirm-product-item__price-main">{formatPrice(item.price * item.quantity)}</p>
                    <p className="confirm-product-item__price-unit">
                      {item.quantity > 1 ? `${item.quantity}x ${formatPrice(item.price)}` : `Qtd: ${item.quantity}`}
                    </p>
                  </div>
                </div>
              ))}

              {/* Financial Summary inside products card */}
              <div className="pt-3 mt-2" style={{ borderTop: '2px solid #f0f0f0' }}>
                <div className="confirm-financial-row">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatPrice(order.itemsPrice)}</span>
                </div>
                <div className="confirm-financial-row">
                  <span className="text-muted">Frete</span>
                  <span>{formatPrice(order.shippingPrice)}</span>
                </div>
                {order.taxPrice > 0 && (
                  <div className="confirm-financial-row">
                    <span className="text-muted">Taxas</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                  </div>
                )}
                <div className="confirm-financial-row confirm-financial-row--total">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Info Cards Row ---- */}
          <div className="row g-3 mb-4">
            {/* Endereço de Entrega */}
            <div className="col-md-6">
              <div className="confirm-info-card h-100">
                <div className="confirm-info-card__header">
                  <MapPin size={18} />
                  Endereço de Entrega
                </div>
                <div className="confirm-info-card__body">
                  <address className="mb-0 small" style={{ lineHeight: 1.7 }}>
                    <strong>{user?.name}</strong><br />
                    {order.shippingAddress.address}, {order.shippingAddress.number}<br />
                    {order.shippingAddress.complement && (
                      <>Complemento: {order.shippingAddress.complement}<br /></>
                    )}
                    {order.shippingAddress.neighborhood}<br />
                    {order.shippingAddress.city} - {order.shippingAddress.state}<br />
                    CEP: {order.shippingAddress.postalCode}
                  </address>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginTop: '12px', paddingTop: '12px',
                    borderTop: '1px dashed #e0e0e0',
                    fontSize: '0.82rem', color: '#16a34a', fontWeight: 600
                  }}>
                    <Truck size={16} />
                    Previsão: 5-7 dias úteis
                  </div>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="col-md-6">
              <div className="confirm-info-card h-100">
                <div className="confirm-info-card__header">
                  <CreditCard size={18} />
                  Informações de Pagamento
                </div>
                <div className="confirm-info-card__body">
                  <div className="small" style={{ lineHeight: 1.8 }}>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Método</span>
                      <span className="fw-semibold">{paymentLabel}</span>
                    </div>
                    {order.paymentMethod === 'CREDIT_CARD' && order.installments > 1 && (
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Parcelas</span>
                        <span className="fw-semibold">
                          {order.installments}x de {formatPrice(order.total / order.installments)}
                        </span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Status</span>
                      <span className="badge bg-success" style={{ fontSize: '0.75rem' }}>Aprovado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Actions ---- */}
          <div className="confirmation-actions">
            <button onClick={handlePrint} className="btn btn-outline-dark">
              <Download size={16} className="me-2" />
              Imprimir Recibo
            </button>
            <Link to={`/order-status/${order._id}`} className="btn btn-dark">
              Acompanhar Pedido
            </Link>
            <Link to="/collections" className="btn btn-outline-dark">
              Continuar Comprando
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;