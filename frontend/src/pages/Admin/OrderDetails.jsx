import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar,
  DollarSign,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { value: 'Pendente', label: 'Pendente', color: 'warning' },
    { value: 'Processando', label: 'Processando', color: 'info' },
    { value: 'Pago', label: 'Pago', color: 'success' },
    { value: 'Enviado', label: 'Enviado', color: 'primary' },
    { value: 'Entregue', label: 'Entregue', color: 'success' },
    { value: 'Cancelado', label: 'Cancelado', color: 'danger' }
  ];

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data || response.data);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      setError(error.response?.data?.message || 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    try {
      setUpdating(true);
      await api.put(`/orders/${id}/status`, { status: newStatus });
      await fetchOrder(); // Recarregar dados
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    } finally {
      setUpdating(false);
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

  const getStatusBadge = (status) => {
    const statusInfo = statusOptions.find(s => s.value === status) || { color: 'secondary', label: status };
    return (
      <span className={`badge bg-${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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
          <XCircle size={64} className="text-danger mb-3" />
          <h1>Erro ao carregar pedido</h1>
          <p className="text-muted mb-4">{error || 'Pedido não encontrado'}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button onClick={() => navigate(-1)} className="btn btn-outline-primary">
              <ArrowLeft size={16} className="me-2" />
              Voltar
            </button>
            <Link to="/admin/orders" className="btn btn-primary">
              Ver Todos os Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary me-3"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="h3 mb-0">Detalhes do Pedido</h1>
            <p className="text-muted mb-0">#{order._id}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-outline-primary">
            <Download size={16} className="me-2" />
            Imprimir
          </button>
          <button 
            onClick={() => setShowStatusModal(true)}
            className="btn btn-primary"
          >
            <Edit size={16} className="me-2" />
            Atualizar Status
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Informações do Pedido */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <Package className="me-2" size={20} />
                Informações do Pedido
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Número:</strong></td>
                        <td>#{order._id}</td>
                      </tr>
                      <tr>
                        <td><strong>Data:</strong></td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                      <tr>
                        <td><strong>Método de Pagamento:</strong></td>
                        <td className="text-capitalize">
                          {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
                        </td>
                      </tr>
                      {order.pgChargeId && (
                        <tr>
                          <td><strong>ID PagSeguro:</strong></td>
                          <td>
                            <code className="small">{order.pgChargeId}</code>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
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
        </div>

        <div className="col-lg-4">
          {/* Informações do Cliente */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <User className="me-2" size={20} />
                Cliente
              </h5>
            </div>
            <div className="card-body">
              <p className="mb-1"><strong>Nome:</strong> {order.user?.name || 'N/A'}</p>
              <p className="mb-1"><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
              <p className="mb-0"><strong>ID:</strong> {order.user?._id || 'N/A'}</p>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <MapPin className="me-2" size={20} />
                Endereço de Entrega
              </h5>
            </div>
            <div className="card-body">
              <address className="mb-0">
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

          {/* Informações de Pagamento */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <CreditCard className="me-2" size={20} />
                Pagamento
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
              <p className="mb-2">
                <strong>Pago:</strong><br />
                {order.isPaid ? (
                  <span className="badge bg-success">
                    <CheckCircle size={14} className="me-1" />
                    Sim
                  </span>
                ) : (
                  <span className="badge bg-warning">
                    <Clock size={14} className="me-1" />
                    Não
                  </span>
                )}
              </p>
              {order.paidAt && (
                <p className="mb-0">
                  <strong>Pago em:</strong><br />
                  {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Ações</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {order.paymentMethod === 'PIX' && order.pgChargeId && (
                  <Link 
                    to={`/payment/pix/${order.pgChargeId}`}
                    className="btn btn-outline-primary"
                  >
                    <Eye size={16} className="me-2" />
                    Ver QR Code PIX
                  </Link>
                )}
                <button 
                  onClick={() => setShowStatusModal(true)}
                  className="btn btn-outline-success"
                >
                  <Edit size={16} className="me-2" />
                  Atualizar Status
                </button>
                <Link 
                  to="/admin/orders"
                  className="btn btn-outline-secondary"
                >
                  <ArrowLeft size={16} className="me-2" />
                  Voltar para Lista
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Atualizar Status */}
      {showStatusModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Atualizar Status do Pedido</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Status Atual:</label>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="newStatus" className="form-label">Novo Status:</label>
                  <select 
                    className="form-select"
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Selecione um status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updating}
                >
                  {updating ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para impressão */}
      <style>{`
        @media print {
          .btn, .modal, .card-header {
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

export default OrderDetails;