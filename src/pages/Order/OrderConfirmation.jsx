import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Download } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext'

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1>Pedido não encontrado</h1>
          <p className="text-muted mb-4">{error || 'O pedido solicitado não existe.'}</p>
          <Link to="/orders" className="btn btn-primary">
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header de Sucesso */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8">
          <div className="text-center">
            <CheckCircle size={64} className="text-success mb-3" />
            <h1 className="h2 mb-3">Pedido Confirmado!</h1>
            <p className="text-muted mb-4">
              Obrigado por sua compra! Seu pedido #{order._id} foi recebido e está sendo processado.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button onClick={handlePrint} className="btn btn-outline-primary">
                <Download size={16} className="me-2" />
                Imprimir Recibo
              </button>
              <Link to="/products" className="btn btn-primary">
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Resumo do Pedido */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <Package className="me-2" size={20} />
                Resumo do Pedido
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Informações do Pedido</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Número do Pedido:</strong></td>
                        <td>#{order._id}</td>
                      </tr>
                      <tr>
                        <td><strong>Data:</strong></td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <span className={`badge ${
                            order.status === 'Pago' ? 'bg-success' : 
                            order.status === 'Processando' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Método de Pagamento:</strong></td>
                        <td className="text-capitalize">
                          {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6>Informações de Pagamento</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td>{formatPrice(order.itemsPrice)}</td>
                      </tr>
                      <tr>
                        <td><strong>Frete:</strong></td>
                        <td>{formatPrice(order.shippingPrice)}</td>
                      </tr>
                      {order.taxPrice > 0 && (
                        <tr>
                          <td><strong>Taxas:</strong></td>
                          <td>{formatPrice(order.taxPrice)}</td>
                        </tr>
                      )}
                      <tr className="table-active">
                        <td><strong>Total:</strong></td>
                        <td><strong>{formatPrice(order.total)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Itens do Pedido</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Produto</th>
                      <th>Preço</th>
                      <th>Quantidade</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="rounded me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-1">{item.name}</h6>
                              {item.color && (
                                <small className="text-muted">Cor: {item.color}</small>
                              )}
                              {item.size && (
                                <small className="text-muted ms-2">Tamanho: {item.size}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Informações de Entrega */}
          <div className="row">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <Truck className="me-2" size={20} />
                    Endereço de Entrega
                  </h5>
                </div>
                <div className="card-body">
                  <address className="mb-0">
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

            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <CreditCard className="me-2" size={20} />
                    Informações de Pagamento
                  </h5>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Método:</strong><br />
                    {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX'}
                  </p>
                  {order.paymentMethod === 'CREDIT_CARD' && order.installments > 1 && (
                    <p className="mb-2">
                      <strong>Parcelas:</strong><br />
                      {order.installments}x de {formatPrice(order.total / order.installments)}
                    </p>
                  )}
                  <p className="mb-0">
                    <strong>Status do Pagamento:</strong><br />
                    <span className="badge bg-success">Aprovado</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="text-center mt-5">
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/orders" className="btn btn-outline-primary">
                Ver Todos os Pedidos
              </Link>
              <Link to="/products" className="btn btn-primary">
                Continuar Comprando
              </Link>
              {order.paymentMethod === 'PIX' && order.pgChargeId && (
                <Link 
                  to={`/payment/pix/${order.pgChargeId}`}
                  className="btn btn-success"
                >
                  Ver QR Code PIX
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style>{`
        @media print {
          .btn, .navbar, .footer {
            display: none !important;
          }
          .card {
            border: 1px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;