import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Truck, Package, QrCode, Copy, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext';

const OrderStatus = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (order && order.paymentMethod === 'PIX' && order.status === 'Pendente' && order.pgChargeId) {
      fetchPixData();
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPixData = async () => {
    try {
      const response = await api.get(`/payment/pix/${order.pgChargeId}`);
      setPixData(response.data);
    } catch (error) {
      console.error('Erro ao buscar QR Code PIX:', error);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pago':
        return <CheckCircle className="text-success" size={24} />;
      case 'Processando':
        return <Clock className="text-warning" size={24} />;
      case 'Cancelado':
        return <XCircle className="text-danger" size={24} />;
      default:
        return <Package className="text-info" size={24} />;
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Pedido Recebido', status: 'pending' },
      { key: 'processing', label: 'Processando Pagamento', status: 'pending' },
      { key: 'paid', label: 'Pagamento Aprovado', status: 'pending' },
      { key: 'preparing', label: 'Preparando Pedido', status: 'pending' },
      { key: 'shipped', label: 'Enviado', status: 'pending' },
      { key: 'delivered', label: 'Entregue', status: 'pending' }
    ];

    // Simula progresso baseado no status atual
    const statusIndex = {
      'Pendente': 0,
      'Processando': 1,
      'Pago': 2,
      'Preparando': 3,
      'Enviado': 4,
      'Entregue': 5
    };

    const currentIndex = statusIndex[currentStatus] || 0;

    return steps.map((step, index) => ({
      ...step,
      status: index <= currentIndex ? 'completed' : 'pending'
    }));
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1>Pedido não encontrado</h1>
          <p className="text-muted mb-4">O pedido solicitado não existe.</p>
          <Link to="/orders" className="btn btn-primary">
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-5">
            {getStatusIcon(order.status)}
            <h1 className="h2 mt-3 mb-2">Acompanhamento do Pedido</h1>
            <p className="text-muted">
              Pedido #{order._id} • {order.status}
            </p>
          </div>

          {/* PIX Payment Section */}
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

          {/* Timeline do Status */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Status do Pedido</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`timeline-dot ${step.status === 'completed' ? 'bg-primary' : 'bg-light'}`}>
                        {step.status === 'completed' && (
                          <CheckCircle size={16} className="text-white" />
                        )}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`timeline-line ${step.status === 'completed' ? 'bg-primary' : 'bg-light'}`} />
                      )}
                    </div>
                    <div className="timeline-content">
                      <h6 className={`mb-1 ${step.status === 'completed' ? 'text-primary' : 'text-muted'}`}>
                        {step.label}
                      </h6>
                      <small className="text-muted">
                        {step.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="row">
            {/* Endereço */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light">
                  <h6 className="mb-0 d-flex align-items-center">
                    <MapPin size={18} className="me-2 text-primary" />
                    Endereço de Entrega
                  </h6>
                </div>
                <div className="card-body">
                  <address className="mb-0 small">
                    <strong>{user?.name}</strong><br />
                    {order.shippingAddress.address}, {order.shippingAddress.number}<br />
                    {order.shippingAddress.complement && (
                      <>Complemento: {order.shippingAddress.complement}<br /></>
                    )}
                    {order.shippingAddress.neighborhood}<br />
                    {order.shippingAddress.city} - {order.shippingAddress.state}<br />
                    CEP: {order.shippingAddress.postalCode}
                  </address>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light">
                  <h6 className="mb-0 d-flex align-items-center">
                    <CreditCard size={18} className="me-2 text-success" />
                    Resumo Financeiro
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0 small">
                    <li className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>{formatPrice(order.itemsPrice)}</span>
                    </li>
                    <li className="d-flex justify-content-between mb-2">
                      <span>Frete:</span>
                      <span>{formatPrice(order.shippingPrice)}</span>
                    </li>
                    <li className="d-flex justify-content-between border-top pt-2 mt-2">
                      <strong>Total:</strong>
                      <strong className="text-primary">{formatPrice(order.total)}</strong>
                    </li>
                  </ul>
                  <div className="mt-3 pt-2 border-top text-center">
                    <span className="badge bg-light text-dark border">
                      Método: {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Rápidas (Itens e Previsão) */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <Package size={32} className="text-primary mb-2" />
                  <h6>Itens no Pedido</h6>
                  <p className="h4 text-primary">{order.orderItems.length}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <Truck size={32} className="text-success mb-2" />
                  <h6>Previsão de Entrega</h6>
                  <p className="h6 text-success">5-7 dias úteis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="text-center mt-2">
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to={`/order-confirmation/${order._id}`} className="btn btn-primary">
                Ver Detalhes Completos
              </Link>
              <Link to="/products" className="btn btn-outline-primary">
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 0;
        }
        .timeline-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #dee2e6;
        }
        .timeline-line {
          position: absolute;
          left: 11px;
          top: 24px;
          width: 2px;
          height: calc(100% + 20px);
          background-color: #dee2e6;
        }
        .timeline-content {
          padding-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default OrderStatus;