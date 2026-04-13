import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

const ExchangePolicy = () => {
  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <Link to="/" style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Voltar ao Início
      </Link>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
        Trocas e Devoluções
      </h1>
      <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: 32 }}>
        Queremos que você fique 100% satisfeita com sua compra.
      </p>

      {/* Highlights */}
      <div className="row g-3 mb-4">
        {[
          { icon: <Clock size={18} />, label: '7 dias', desc: 'Para solicitar troca ou devolução após o recebimento' },
          { icon: <RefreshCw size={18} />, label: 'Troca fácil', desc: 'Solicitação rápida através do WhatsApp' },
          { icon: <CheckCircle2 size={18} />, label: 'Fácil e prático', desc: 'Após o recebimento do produto' },
        ].map((item, i) => (
          <div className="col-md-4" key={i}>
            <div style={{
              background: '#f0fdf4', borderRadius: 12, padding: 20,
              textAlign: 'center', height: '100%',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#16a34a', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}>
                {item.icon}
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: '0.78rem', color: '#666', margin: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      {[
        {
          title: '1. Prazo para Troca ou Devolução',
          content: 'Você tem até 7 (sete) dias corridos após o recebimento do produto para solicitar a troca ou devolução, conforme o Código de Defesa do Consumidor (Art. 49).',
        },
        {
          title: '2. Condições para Troca',
          content: 'O produto deve estar em perfeitas condições, sem sinais de uso, com etiquetas originais e na embalagem original. Produtos com indícios de uso, manchas, odores ou sem etiqueta não serão aceitos.',
        },
        {
          title: '3. Como Solicitar',
          items: [
            'Entre em contato pelo nosso Instagram @ammi.fitwear ou WhatsApp informando o número do pedido',
            'Informe o motivo da troca ou devolução',
            'Aguarde nossas instruções para envio do produto',
            'Após o recebimento e análise, daremos andamento ao processo',
          ],
        },
        {
          title: '4. Troca de Tamanho',
          content: 'A troca de tamanho está sujeita à disponibilidade em estoque. Os custos de envio são de responsabilidade do cliente',
        },
        {
          title: '5. Devolução e Reembolso',
          content: 'Em caso de devolução, o reembolso será realizado em até 10 dias úteis após o recebimento e análise do produto, pelo mesmo método de pagamento utilizado na compra.',
        },
        {
          title: '6. Produtos com Defeito',
          content: 'Caso o produto apresente defeito de fabricação, entre em contato imediatamente. A troca será realizada sem custos adicionais para você',
        },
      ].map((section, i) => (
        <div key={i} style={{
          background: '#fafafa', borderRadius: 12, padding: 24,
          marginBottom: 12,
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
            {section.title}
          </h3>
          {section.content && (
            <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7, margin: 0 }}>
              {section.content}
            </p>
          )}
          {section.items && (
            <ol style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
              {section.items.map((item, j) => <li key={j}>{item}</li>)}
            </ol>
          )}
        </div>
      ))}

      {/* Warning */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: '#fef3c7', borderRadius: 12, padding: 20,
        border: '1px solid #fde68a', marginTop: 8,
      }}>
        <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          <strong>Importante:</strong> Produtos em promoção seguem as mesmas regras de troca e devolução.
          Cupons de desconto não são reembolsáveis.
        </p>
      </div>
    </div>
  );
};

export default ExchangePolicy;
