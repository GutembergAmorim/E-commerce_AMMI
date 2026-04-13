import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import api from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState(""); // Dev only

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        setSent(true);
        // Dev mode: show reset link
        if (res.data.resetUrl) {
          setResetUrl(res.data.resetUrl);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 16,
        padding: '40px 32px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      }}>
        <Link
          to="/login"
          style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}
        >
          <ArrowLeft size={14} /> Voltar ao Login
        </Link>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
          Esqueceu sua senha?
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 24 }}>
          Digite seu e-mail e enviaremos instruções para redefinir sua senha.
        </p>

        {sent ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>✉️</div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>
              Instruções enviadas!
            </p>
            <p style={{ fontSize: '0.82rem', color: '#666' }}>
              Verifique seu e-mail <strong>{email}</strong> e siga as instruções para redefinir sua senha.
            </p>

            {/* Dev mode: show direct link */}
            {resetUrl && (
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#fef3c7',
                borderRadius: 8,
                border: '1px solid #fde68a',
              }}>
                <p style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600, marginBottom: 4 }}>
                  🔧 Modo Dev — Link direto:
                </p>
                <a
                  href={resetUrl}
                  style={{ fontSize: '0.72rem', color: '#1d4ed8', wordBreak: 'break-all' }}
                >
                  {resetUrl}
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                E-mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    border: '1px solid #e0e0e0',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '0.82rem', color: '#dc2626', marginBottom: 12, fontWeight: 500 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 0',
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 50,
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Enviando...' : 'Enviar Instruções'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
