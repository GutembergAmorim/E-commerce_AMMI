import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import api from '../../services/api';

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [orderId]);

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

          {/* Informações Rápidas */}
          <div className="row">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <Package size={32} className="text-primary mb-2" />
                  <h6>Itens no Pedido</h6>
                  <p className="h4 text-primary">{order.orderItems.length}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
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
          <div className="text-center mt-4">
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