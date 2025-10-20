import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFacebook,
  faApple,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";

const Register = () => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = await register({ name, cpf, email, password });

    if (result.success) {
      setSuccess("Cadastro realizado! Você será redirecionado para o login.");
      setTimeout(() => {
        navigate("/login");
      }, 3000); // Redireciona após 3 segundos
    } else {
      setError(result.message);
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
              <h2 className="text-center h4 fw-bold">CADASTRE-SE</h2>
              <p className="text-center fw-bold mb-4">Finalize suas compras de forma mais rapida!</p>
              <form onSubmit={handleSubmit}>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="nameInput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nome Completo"
                  />
                  <label htmlFor="nameInput">Nome Completo</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="number"
                    className="form-control"
                    id="cpfInput"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                    placeholder="CPF"
                  />
                  <label htmlFor="cpfInput">CPF</label>
                </div>
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
                <div className="form-floating mb-4">
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Senha"
                  />
                  <label htmlFor="passwordInput">Crie uma Senha</label>
                </div>

                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold btn-login-custom rounded-pill w-100"
                  >
                    Criar conta
                  </button>
                </div>
                <div className="text-center form-check mb-3">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="text-muted fw-bold">
                    Clique aqui para entrar
                  </Link>
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default Register;
