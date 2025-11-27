import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QrCode, Copy, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../Context/AuthContext';

const PixQrCode = () => {
  const { chargeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (chargeId) {
      fetchPixData();
    }
  }, [chargeId]);

  const fetchPixData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payment/pix/${chargeId}`);
      setPixData(response.data);
    } catch (error) {
      console.error('Erro ao buscar QR Code PIX:', error);
      setError(error.response?.data?.error || 'Erro ao carregar QR Code PIX');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'WAITING': { class: 'bg-warning', text: 'Aguardando Pagamento' },
      'PAID': { class: 'bg-success', text: 'Pago' },
      'CANCELED': { class: 'bg-danger', text: 'Cancelado' },
      'EXPIRED': { class: 'bg-secondary', text: 'Expirado' }
    };
    
    const statusInfo = statusMap[status] || { class: 'bg-info', text: status };
    return (
      <span className={`badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando QR Code PIX...</p>
        </div>
      </div>
    );
  }

  if (error || !pixData) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <AlertCircle size={64} className="text-danger mb-3" />
          <h1>Erro ao carregar QR Code</h1>
          <p className="text-muted mb-4">{error || 'QR Code não encontrado'}</p>
          <div className="d-flex gap-2 justify-content-center">
            <button onClick={() => navigate(-1)} className="btn btn-outline-primary">
              <ArrowLeft size={16} className="me-2" />
              Voltar
            </button>
            <Link to="/" className="btn btn-primary">
              Ir para Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <QrCode size={48} className="text-primary mb-3" />
            <h1>Pagamento PIX</h1>
            <p className="text-muted">
              Escaneie o QR Code ou copie o código PIX para efetuar o pagamento
            </p>
          </div>

          {/* Informações do Pedido */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Informações do Pagamento</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Pedido:</strong> #{pixData.orderId}</p>
                  <p><strong>Status:</strong> {getStatusBadge(pixData.status)}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Valor:</strong> {formatPrice(pixData.total)}</p>
                  {pixData.expiresAt && (
                    <p><strong>Expira em:</strong> {formatDate(pixData.expiresAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">QR Code PIX</h5>
            </div>
            <div className="card-body text-center">
              {pixData.qrCodeLink ? (
                <div className="mb-3">
                  <img 
                    src={pixData.qrCodeLink} 
                    alt="QR Code PIX"
                    className="img-fluid"
                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                  />
                </div>
              ) : (
                <div className="alert alert-warning">
                  <AlertCircle size={24} className="me-2" />
                  {pixData.message || "QR Code não disponível no momento"}
                </div>
              )}

              {pixData.qrCodeText ? (
                <div className="mt-3">
                  <label className="form-label">Código PIX (Copiar e Colar):</label>
                  <div className="input-group">
                    <textarea
                      className="form-control"
                      value={pixData.qrCodeText}
                      readOnly
                      rows="4"
                      style={{ fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => copyToClipboard(pixData.qrCodeText)}
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  {copied && (
                    <small className="text-success mt-2 d-block">
                      Código copiado para a área de transferência!
                    </small>
                  )}
                </div>
              ) : pixData.message && (
                <div className="mt-3">
                  <div className="alert alert-info">
                    <p className="mb-0">{pixData.message}</p>
                    <p className="mb-0 mt-2">
                      <small>
                        O QR Code PIX pode levar alguns instantes para ser gerado. 
                        Clique em "Atualizar Status" para tentar novamente.
                      </small>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instruções */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Como pagar com PIX</h5>
            </div>
            <div className="card-body">
              <ol className="mb-0">
                <li>Abra o aplicativo do seu banco</li>
                <li>Escolha a opção PIX</li>
                <li>Escaneie o QR Code ou cole o código PIX</li>
                <li>Confirme os dados e finalize o pagamento</li>
                <li>Seu pedido será processado automaticamente</li>
              </ol>
            </div>
          </div>

          {/* Ações */}
          <div className="text-center">
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button 
                onClick={fetchPixData} 
                className="btn btn-outline-primary"
                disabled={loading}
              >
                <Clock size={16} className="me-2" />
                Atualizar Status
              </button>
              <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                <ArrowLeft size={16} className="me-2" />
                Voltar
              </button>
              <Link to={`/order-confirmation/${pixData.orderId}`} className="btn btn-primary">
                Ver Pedido
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixQrCode;
