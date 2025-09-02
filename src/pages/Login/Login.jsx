import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./Login.css";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFacebook,
  faApple,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Email ou senha inválidos. Tente novamente.");
    }
  };

  return (
    <>
      <header className="bg-light text-white text-center py-3 mb-4 border-bottom">
        <img style={{ maxWidth: "100px" }} src={logo} alt="Logo" />
      </header>
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="p-4">
              <h2 className="text-center h4 fw-bold mb-4">Acesse sua conta</h2>
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="E-mail"
                  />
                  <label htmlFor="emailInput">E-mail</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Senha"
                  />
                  <label htmlFor="passwordInput">Senha</label>
                </div>
                <div className="text-center form-check mb-3">
                  <a href="" className="text-muted fw-bold">
                    Esqueceu seus dados de acesso?
                  </a>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold btn-login-custom rounded-pill w-100"
                  >
                    Entrar
                  </button>
                </div>
              </form>

              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" style={{ borderColor: "gray" }} />
                <span className="mx-3 text-muted">ou</span>
                <hr className="flex-grow-1" style={{ borderColor: "#gray" }} />
              </div>
              <div className="d-flex justify-content-around mb-4">
                {/* Botão Facebook */}
                <Button
                  variant="light"
                  className="rounded-circle p-3 d-flex justify-content-center align-items-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "1px solid #ddd",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFacebook}
                    size="2x"
                    style={{ color: "#3b5998" }}
                  />
                </Button>
                {/* Botão Apple */}
                <Button
                  variant="light"
                  className="rounded-circle p-3 d-flex justify-content-center align-items-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "1px solid #ddd",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faApple}
                    size="2x"
                    style={{ color: "#000" }}
                  />
                </Button>
                {/* Botão Google */}
                <Button
                  variant="light"
                  className="rounded-circle p-3 d-flex justify-content-center align-items-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "1px solid #ddd",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faGoogle}
                    size="2x"
                    style={{ color: "#db4437" }}
                  />
                </Button>
              </div>
              <Link to="/register" className="text-decoration-none">
                <button
                  type="button"
                  className="btn btn-primary fw-bold btn-login-custom rounded-pill w-100"
                >Criar Conta</button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default Login;
