import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsAndPrivacy = () => {
  const sections = [
    {
      title: 'Termos de Uso',
      items: [
        {
          subtitle: '1. Aceitação dos Termos',
          text: 'Ao acessar e utilizar o site da AMMI Fitwear, você concorda com estes Termos de Uso. Se não concordar com algum dos termos, por favor não utilize nosso site.',
        },
        {
          subtitle: '2. Uso do Site',
          text: 'O site da AMMI destina-se exclusivamente à venda de produtos de moda fitness feminina. É proibido utilizar o site para fins ilegais, enviar conteúdo ofensivo, ou tentar acessar áreas restritas do sistema.',
        },
        {
          subtitle: '3. Conta do Usuário',
          text: 'Ao criar uma conta, você é responsável por manter a confidencialidade de suas credenciais. Qualquer atividade realizada com sua conta é de sua responsabilidade. Notifique-nos imediatamente caso suspeite de uso não autorizado.',
        },
        {
          subtitle: '4. Preços e Pagamentos',
          text: 'Os preços exibidos incluem impostos. Reservamo-nos o direito de alterar preços a qualquer momento, sem aviso prévio. Promoções têm prazo determinado e podem ser encerradas quando o estoque acabar.',
        },
        {
          subtitle: '5. Propriedade Intelectual',
          text: 'Todo o conteúdo do site (imagens, textos, logotipos, designs) é propriedade da AMMI Fitwear e está protegido por leis de propriedade intelectual. É proibida a reprodução sem autorização prévia.',
        },
      ],
    },
    {
      title: 'Política de Privacidade',
      items: [
        {
          subtitle: '1. Dados Coletados',
          text: 'Coletamos dados pessoais necessários para processar pedidos e melhorar a experiência: nome, e-mail, telefone, endereço de entrega e dados de pagamento (processados pelo PagBank).',
        },
        {
          subtitle: '2. Uso dos Dados',
          text: 'Seus dados são utilizados para: processar e entregar pedidos, enviar atualizações sobre o status do pedido, comunicações de marketing (somente com seu consentimento), e melhorar nossos produtos e serviços.',
        },
        {
          subtitle: '3. Proteção dos Dados',
          text: 'Utilizamos criptografia SSL para proteger todas as transmissões de dados. Seus dados de pagamento são processados diretamente pelo PagBank e não são armazenados em nossos servidores.',
        },
        {
          subtitle: '4. Compartilhamento',
          text: 'Não vendemos nem compartilhamos seus dados com terceiros, exceto quando necessário para: processar pagamentos (PagBank), realizar entregas (transportadoras), ou cumprir obrigações legais.',
        },
        {
          subtitle: '5. Seus Direitos (LGPD)',
          text: 'Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar seus dados, corrigir informações, solicitar exclusão, revogar consentimento e solicitar portabilidade. Para exercer seus direitos, entre em contato pelo e-mail contato@ammi.com.br.',
        },
        {
          subtitle: '6. Cookies',
          text: 'Utilizamos cookies para melhorar sua experiência de navegação e personalizar conteúdo. Você pode desativar cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade do site.',
        },
      ],
    },
  ];

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <Link to="/" style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Voltar ao Início
      </Link>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
        Termos de Uso e Política de Privacidade
      </h1>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 32 }}>
        Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      </p>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: '1.2rem', fontWeight: 800, color: '#1a1a1a',
            borderBottom: '2px solid #1a1a1a', paddingBottom: 8, marginBottom: 16,
          }}>
            {section.title}
          </h2>

          {section.items.map((item, ii) => (
            <div key={ii} style={{
              background: '#fafafa', borderRadius: 12, padding: 20,
              marginBottom: 10,
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6, color: '#1a1a1a' }}>
                {item.subtitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7, margin: 0 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TermsAndPrivacy;
