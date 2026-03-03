import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Truck, Package, QrCode, Copy, CreditCard, MapPin, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import './OrderStatus.css';

const OrderStatus = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const intervalRef = React.useRef(null);

  const fetchOrderAndPix = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      const orderData = response.data.data;
      setOrder(orderData);

      // Buscar PIX somente se necessário
      if (orderData?.paymentMethod === 'PIX' && orderData?.status === 'Pendente' && orderData?.pgChargeId) {
        try {
          const pixResponse = await api.get(`/payment/pix/${orderData.pgChargeId}`);
          setPixData(pixResponse.data);
        } catch (pixError) {
          console.error('Erro ao buscar QR Code PIX:', pixError);
        }
      }

      // Parar polling se o pedido não está mais pendente
      if (orderData?.status !== 'Pendente' && orderData?.status !== 'Processando') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndPix();
    intervalRef.current = setInterval(fetchOrderAndPix, 30000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderId]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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

  const shortOrderId = (id) => {
    if (!id) return '';
    return id.slice(-8).toUpperCase();
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      'Pendente': 'order-header__badge--pending',
      'Processando': 'order-header__badge--processing',
      'Pago': 'order-header__badge--paid',
      'Cancelado': 'order-header__badge--cancelled',
      'Enviado': 'order-header__badge--shipped',
      'Entregue': 'order-header__badge--delivered',
      'Preparando': 'order-header__badge--processing',
    };
    return map[status] || 'order-header__badge--pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pago': return <CheckCircle size={16} />;
      case 'Processando': return <Clock size={16} />;
      case 'Cancelado': return <XCircle size={16} />;
      case 'Enviado': return <Truck size={16} />;
      case 'Entregue': return <CheckCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  // Steps for the horizontal stepper
  const stepperSteps = [
    { key: 'pending', label: 'Pedido Recebido', icon: <Package size={16} /> },
    { key: 'processing', label: 'Processando', icon: <Clock size={16} /> },
    { key: 'paid', label: 'Aprovado', icon: <CheckCircle size={16} /> },
    { key: 'preparing', label: 'Preparando', icon: <ShoppingBag size={16} /> },
    { key: 'shipped', label: 'Enviado', icon: <Truck size={16} /> },
    { key: 'delivered', label: 'Entregue', icon: <CheckCircle size={16} /> },
  ];

  const statusIndexMap = {
    'Pendente': 0,
    'Processando': 1,
    'Pago': 2,
    'Preparando': 3,
    'Enviado': 4,
    'Entregue': 5,
  };

  const getStepClass = (stepIndex, currentStatus) => {
    const currentIndex = statusIndexMap[currentStatus] ?? -1;
    if (stepIndex < currentIndex) return 'step--completed';
    if (stepIndex === currentIndex) return 'step--completed step--active';
    return '';
  };

  // ---------- Loading / Error states ----------

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3 text-muted">Carregando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1 className="h3">Pedido não encontrado</h1>
          <p className="text-muted mb-4">O pedido solicitado não existe.</p>
          <Link to="/orders" className="btn btn-dark rounded-pill px-4">
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = statusIndexMap[order.status] ?? 0;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">

          {/* ---- Header ---- */}
          <div className="order-header">
            <h1 className="h3 fw-bold mb-2">Acompanhamento do Pedido</h1>
            <span className={`order-header__badge ${getStatusBadgeClass(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
            <p className="order-header__id">
              Pedido #{shortOrderId(order._id)}
              {order.createdAt && ` • ${formatDate(order.createdAt)}`}
            </p>
          </div>

          {/* ---- Horizontal Stepper ---- */}
          <div className="order-stepper">
            {stepperSteps.map((step, index) => (
              <div
                key={step.key}
                className={`order-stepper__step ${getStepClass(index, order.status)}`}
              >
                <div className="stepper__dot">
                  {index <= currentIndex ? (
                    index < currentIndex ? <CheckCircle size={16} /> : step.icon
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{index + 1}</span>
                  )}
                </div>
                <span className="stepper__label">{step.label}</span>
              </div>
            ))}
          </div>

          {/* ---- PIX Payment Section (kept as-is) ---- */}
          {order.paymentMethod === 'PIX' && order.status === 'Pendente' && pixData && (
            <div className="card shadow-sm mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <QrCode className="me-2" size={20} />
                  Pagamento via PIX
                </h5>
              </div>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-5 text-center mb-3 mb-md-0">
                    {pixData.qrCodeLink ? (
                      <img
                        src={pixData.qrCodeLink}
                        alt="QR Code PIX"
                        className="img-fluid rounded border"
                        style={{ maxWidth: '200px' }}
                      />
                    ) : (
                      <div className="alert alert-warning">
                        QR Code indisponível
                      </div>
                    )}
                  </div>
                  <div className="col-md-7">
                    <h6 className="mb-3">Como pagar:</h6>
                    <ol className="small text-muted mb-4">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha a opção PIX &gt; Ler QR Code</li>
                      <li>Escaneie o código ao lado ou copie o código abaixo</li>
                    </ol>

                    {pixData.qrCodeText && (
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Código PIX Copia e Cola:</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={pixData.qrCodeText}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-primary btn-sm"
                            type="button"
                            onClick={() => copyToClipboard(pixData.qrCodeText)}
                          >
                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        {copied && <small className="text-success">Copiado!</small>}
                      </div>
                    )}

                    <div className="alert alert-info py-2 mb-0">
                      <small>
                        <Clock size={14} className="me-1" />
                        O pagamento será confirmado automaticamente.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Product Items ---- */}
          <div className="order-info-card mb-4">
            <div className="order-info-card__header">
              <Package size={18} />
              Itens do Pedido ({order.orderItems?.length || 0})
            </div>
            <div className="order-info-card__body">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="order-product-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-product-item__image"
                  />
                  <div className="order-product-item__info">
                    <p className="order-product-item__name">{item.name}</p>
                    <p className="order-product-item__meta">
                      {item.color && `Cor: ${item.color}`}
                      {item.color && item.size && ' • '}
                      {item.size && `Tam: ${item.size}`}
                    </p>
                  </div>
                  <div className="order-product-item__price">
                    <p className="order-product-item__price-value">{formatPrice(item.price * item.quantity)}</p>
                    <p className="order-product-item__price-qty">Qtd: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Info Cards Row ---- */}
          <div className="row g-3 mb-4">
            {/* Endereço + Previsão de Entrega */}
            <div className="col-md-6">
              <div className="order-info-card h-100">
                <div className="order-info-card__header">
                  <MapPin size={18} />
                  Endereço de Entrega
                </div>
                <div className="order-info-card__body">
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
                  <div className="delivery-estimate">
                    <Truck size={16} />
                    Previsão: 5-7 dias úteis
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="col-md-6">
              <div className="order-info-card h-100">
                <div className="order-info-card__header">
                  <CreditCard size={18} />
                  Resumo Financeiro
                </div>
                <div className="order-info-card__body">
                  <ul className="list-unstyled mb-0 small">
                    <li className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatPrice(order.itemsPrice)}</span>
                    </li>
                    <li className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Frete</span>
                      <span>{formatPrice(order.shippingPrice)}</span>
                    </li>
                    <li className="d-flex justify-content-between border-top pt-2 mt-2">
                      <strong>Total</strong>
                      <strong>{formatPrice(order.total)}</strong>
                    </li>
                  </ul>
                  <div className="text-center mt-3 pt-2 border-top">
                    <span className="badge bg-light text-dark border" style={{ fontSize: '0.78rem' }}>
                      {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Actions ---- */}
          <div className="order-actions">
            <Link to={`/order-confirmation/${order._id}`} className="btn btn-dark">
              Ver Detalhes Completos
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

export default OrderStatus;