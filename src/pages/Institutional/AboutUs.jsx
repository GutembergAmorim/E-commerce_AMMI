import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Truck, Users, Award, Sparkles } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <Link to="/" style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Voltar ao Início
      </Link>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
        Sobre a AMMI
      </h1>
      <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: 32 }}>
        Moda fitness feminina que combina performance, conforto e estilo.
      </p>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
        borderRadius: 16,
        padding: '40px 32px',
        color: '#fff',
        marginBottom: 32,
      }}>
        <Sparkles size={28} style={{ marginBottom: 12, opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>Nossa Missão</h2>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.9, margin: 0 }}>
          A AMMI nasceu com uma missão clara: empoderar mulheres através de roupas fitness que fazem você se sentir
          poderosa em cada movimento. Acreditamos que o conforto e o estilo não precisam ser sacrificados pela
          performance — por isso, cada peça é desenhada com carinho, pensando em você.
        </p>
      </div>

      {/* Values */}
      <div className="row g-3 mb-4">
        {[
          { icon: <Heart size={20} />, title: 'Feito com Amor', desc: 'Cada peça é selecionada pensando no conforto e bem-estar de cada cliente.' },
          { icon: <Award size={20} />, title: 'Qualidade Premium', desc: 'Tecidos de alta performance que acompanham seu ritmo de treino.' },
          { icon: <Truck size={20} />, title: 'Entrega Cuidadosa', desc: 'Embalamos cada pedido com carinho para que chegue perfeito até você.' },
          { icon: <Users size={20} />, title: 'Comunidade', desc: 'Mais do que uma marca, somos uma comunidade de mulheres que se apoiam.' },
        ].map((item, i) => (
          <div className="col-md-6" key={i}>
            <div style={{
              background: '#fafafa',
              borderRadius: 12,
              padding: 24,
              height: '100%',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#1a1a1a', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#666', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fafafa', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Fale Conosco</h3>
        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.7, margin: 0 }}>
          Tem alguma dúvida ou sugestão? Entre em contato pelo nosso Instagram{' '}
          <a href="https://www.instagram.com/ammi.fitwear/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', fontWeight: 600 }}>
            @ammi.fitwear
          </a>
          {' '}ou envie um e-mail para{' '}
          <strong>contato@ammi.com.br</strong>. Teremos prazer em atender você!
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
