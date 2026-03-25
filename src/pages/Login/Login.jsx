import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Email ou senha inválidos. Tente novamente.");
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || "Erro ao fazer login com Google.");
      }
    } catch (err) {
      setError(err.message || "Erro ao fazer login com Google.");
    }
  };

  const handleGoogleError = () => {
    setError("Erro ao conectar com o Google. Tente novamente.");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <Link to="/" className="login-logo-link">
          <img src={logo} alt="AMMI Fitwear" className="login-logo" />
        </Link>

        {/* Card */}
        <div className="login-card">
          <h1 className="login-title">Acesse sua conta</h1>
          <p className="login-subtitle">
            Bem-vinda de volta! Entre para continuar.
          </p>

          {/* Alert */}
          {error && (
            <div className="login-alert login-alert--error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="emailInput" className="login-label">
                E-mail
              </label>
              <div className="login-input-wrapper">
                <i className="fas fa-envelope login-input-icon"></i>
                <input
                  type="email"
                  className="login-input"
                  id="emailInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="passwordInput" className="login-label">
                Senha
              </label>
              <div className="login-input-wrapper">
                <i className="fas fa-lock login-input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  id="passwordInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="login-forgot">
              <Link to="/forgot-password" className="login-forgot-link">
                Esqueceu sua senha?
              </Link>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>ou</span>
          </div>

          {/* Google */}
          <div className="login-google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="pill"
              locale="pt-BR"
            />
          </div>

          {/* Register link */}
          <p className="login-footer">
            Não tem uma conta?{" "}
            <Link to="/register" className="login-footer-link">
              Criar conta
            </Link>
          </p>
        </div>

        {/* Trust */}
        <div className="login-trust">
          <span><i className="fas fa-lock"></i> Dados protegidos</span>
          <span><i className="fas fa-shield-alt"></i> Conexão segura</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
