import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await register({ name, email, password });

    if (result.success) {
      setSuccess("Cadastro realizado! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.message || "Erro ao criar conta com Google.");
      }
    } catch (err) {
      setError(err.message || "Erro ao criar conta com Google.");
    }
  };

  const handleGoogleError = () => {
    setError("Erro ao conectar com o Google. Tente novamente.");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Logo */}
        <Link to="/" className="register-logo-link">
          <img src={logo} alt="AMMI Fitwear" className="register-logo" />
        </Link>

        {/* Card */}
        <div className="register-card">
          <h1 className="register-title">Crie sua conta</h1>
          <p className="register-subtitle">
            Finalize suas compras de forma mais rápida!
          </p>

          {/* Alerts */}
          {success && (
            <div className="register-alert register-alert--success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}
          {error && (
            <div className="register-alert register-alert--error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label htmlFor="nameInput" className="register-label">
                Nome Completo
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-user register-input-icon"></i>
                <input
                  type="text"
                  className="register-input"
                  id="nameInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="emailInput" className="register-label">
                E-mail
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-envelope register-input-icon"></i>
                <input
                  type="email"
                  className="register-input"
                  id="emailInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="passwordInput" className="register-label">
                Senha
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-lock register-input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="register-input"
                  id="passwordInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Crie uma senha forte"
                  minLength={6}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <small className="register-hint">Mínimo de 6 caracteres</small>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="register-divider">
            <span>ou</span>
          </div>

          {/* Google */}
          <div className="register-google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
              shape="pill"
              locale="pt-BR"
            />
          </div>

          {/* Login link */}
          <p className="register-footer">
            Já tem uma conta?{" "}
            <Link to="/login" className="register-footer-link">
              Entrar
            </Link>
          </p>
        </div>

        {/* Trust */}
        <div className="register-trust">
          <span><i className="fas fa-lock"></i> Dados protegidos</span>
          <span><i className="fas fa-shield-alt"></i> Conexão segura</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
