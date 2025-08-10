import React, { useState } from "react";
import axios from "axios";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cartItems, subtotal, discount, total } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState({
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    cep: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const navigate = useNavigate();
  
  
  // Se o carrinho estiver vazio, redireciona para o carrinho ou mostra uma mensagem
  if (cartItems.length === 0) {
    return (
      <div className="container text-center py-5">
        <h1 className="mb-4">Checkout</h1>
        <p>Seu carrinho está vazio. Não há nada para finalizar.</p>
        <button className="btn btn-primary" onClick={() => navigate("/cart")}>
          Voltar para o Carrinho
        </button>
      </div>
    );
  }

  const handleCepSearch = async (cepValue) => {
    const cep = cepValue.replace(/\D/g, "");
    if (cep.length !== 8) {
      return;
    }

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const data = response.data;
      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }
      setAddress((prevAddress) => ({
        ...prevAddress,
        logradouro: data.logradouro,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        cep: data.cep,
      }));
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert("Ocorreu um erro ao buscar o CEP. Tente novamente.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };
  

  const handleFinalizePurchase = () => {
    // 1. Validar se todos os campos necessários (usuário, endereço) estão preenchidos.
    if (!user || !address.cep || !address.numero || !paymentMethod) {
      alert(
        "Por favor, preencha todos os dados do cliente e endereço antes de finalizar a compra."
      );
      return;
    }

    // 2. Montar o objeto do pedido que seria enviado para o backend
    const orderData = {
      userId: user.id,
      items: cartItems,
      payment: {
        subtotal,
        discount,
        total,
      },
      shippingAddress: address,
    };



    // 3. Simular a chamada para a API
    console.log("Enviando para o backend (simulado):", orderData);
    alert("Compra finalizada com sucesso!");
    localStorage.removeItem("cartItems"); // Limpa o carrinho após a compra
    // 4. Redirecionar para a página inicial ou de agradecimento
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <main className="container py-4">
        <h1 className="text-center mt-4 mb-5">Finalizar Compra</h1>
        <div className="row g-4">
          <div className="col-md-7 col-lg-7">
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h2 className="h4 fw-bold mb-3">Dados do Cliente</h2>
              </div>
              <div className="card-body">
                {user ? (
                  <div>
                    <p>
                      <strong>Nome:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>CPF:</strong> {user.cpf}
                    </p>
                    {/* Adicionar campos de endereço aqui quando disponíveis */}
                  </div>
                ) : (
                  <p>Carregando dados do cliente...</p>
                )}
              </div>
            </div>
            <div className="card shadow-sm  mb-4">
              <div className="card-header">
                <h2 className="h4 fw-bold mb-3">Endereço de Entrega</h2>
              </div>
              <div className="card-body">
                <form className="row g-3">
                  <div className="col-12">
                    <label
                      htmlFor="cep"
                      className="form-label fw-bold font-monospace"
                    >
                      CEP
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cep"
                      name="cep"
                      placeholder="00000-000"
                      required
                      value={address.cep}
                      onChange={handleInputChange}
                      onBlur={(e) => handleCepSearch(e.target.value)}
                      maxLength="9"
                    />
                    Não sabe o CEP?{" "}
                    <a
                      href="http://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-custom-pink text-decoration-none"
                    >
                      {" "}
                      Encontre aqui!
                    </a>
                  </div>

                  {address.logradouro && (
                    <>
                      <div className="col-12">
                        <label htmlFor="logradouro" className="form-label">
                          Rua
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="logradouro"
                          name="logradouro"
                          value={address.logradouro}
                          onChange={handleInputChange}
                          readOnly={!!address.logradouro}
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="numero" className="form-label">
                          Número
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="numero"
                          name="numero"
                          value={address.numero}
                          onChange={handleInputChange}
                          placeholder="Digite o número"
                          required
                        />
                      </div>
                      <div className="col-md-8">
                        <label htmlFor="complemento" className="form-label">
                          Complemento
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="complemento"
                          name="complemento"
                          value={address.complemento}
                          onChange={handleInputChange}
                          placeholder="Apto, Bloco, etc."
                        />
                      </div>
                      <div className="col-md-5">
                        <label htmlFor="bairro" className="form-label">
                          Bairro
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="bairro"
                          name="bairro"
                          value={address.bairro}
                          onChange={handleInputChange}
                          readOnly={!!address.bairro}
                        />
                      </div>
                      <div className="col-md-5">
                        <label htmlFor="cidade" className="form-label">
                          Cidade
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cidade"
                          name="localidade"
                          value={address.localidade}
                          onChange={handleInputChange}
                          readOnly={!!address.localidade}
                        />
                      </div>
                      <div className="col-md-2">
                        <label htmlFor="estado" className="form-label">
                          Estado
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="estado"
                          name="uf"
                          value={address.uf}
                          onChange={handleInputChange}
                          readOnly={!!address.uf}
                        />
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h2 className="h4 fw-bold mb-3">Formas de Pagamento</h2>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="pixPayment"
                    value="pix"
                    checked={paymentMethod === "pix"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="pixPayment">
                    <i className="fa-brands fa-pix me-2"></i>
                    <strong>Pix</strong>
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="creditCardPayment"
                    value="credit"
                    checked={paymentMethod === "credit"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="creditCardPayment"
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    <strong>Cartão de Crédito</strong>
                  </label>
                </div>

                {/* Conteúdo condicional para Pix */}
                {paymentMethod === "pix" && (
                  <div className="alert alert-info mt-3">
                    O pagamento via Pix pode ser realizado através do QR Code ou
                    do código Copia e Cola que serão gerados após a finalização
                    da compra.
                  </div>
                )}

                {/* Conteúdo condicional para Cartão de Crédito */}
                {paymentMethod === "credit" && (
                  <div id="creditCardForm" className="mt-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="cardNumber" className="form-label">
                          Número do Cartão
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cardNumber"
                          name="number"
                          placeholder="0000 0000 0000 0000"
                          value={cardDetails.number}
                          onChange={handleCardInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="cardName" className="form-label">
                          Nome no Cartão
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cardName"
                          name="name"
                          placeholder="Como está escrito no cartão"
                          value={cardDetails.name}
                          onChange={handleCardInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="cardExpiry" className="form-label">
                          Validade (MM/AA)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cardExpiry"
                          name="expiry"
                          placeholder="MM/AA"
                          value={cardDetails.expiry}
                          onChange={handleCardInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="cardCvv" className="form-label">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cardCvv"
                          name="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-5 col-lg-5">
            <div className="card shadow-sm p-4">
              <h2 className=" text-center h4 fw-bold mb-4">Resumo do Pedido</h2>
              <ul className="list-group list-group-flush mb-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="d-flex justify-content-between align-items-center px-0"
                  >
                    <div className="d-flex align-items-center w-100 py-2">
                      <div className="pt-2 pb-2 pe-2">
                        <img
                          className="rounded"
                          style={{ width: "60px", objectFit: "contain" }}
                          src={item.image}
                          alt={item.name}
                        />
                      </div>
                      <div className="d-flex flex-column flex-grow-1 ps-2 ">
                        <h6 className="my-0 fw-bold mb-2">{item.name}</h6>
                        <small className="text-muted">
                          Quantidade:{" "}
                          <strong>
                            {item.quantity} x R$ {item.price.toFixed(2)}{" "}
                          </strong>
                        </small>
                        <small className="text-muted">
                          Cor: <strong>{item.color}</strong>
                        </small>
                        <small className="text-muted">
                          Preço Total:{" "}
                          <strong>
                            R$ {(item.quantity * item.price).toFixed(2)}
                          </strong>
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </ul>
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>R$ {(subtotal || 0).toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between text-success mb-2">
                  <span>Descontos</span>
                  <strong>- R$ {(discount || 0).toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                  <span>Total</span>
                  <span>R$ {(total || 0).toFixed(2)}</span>
                </div>
              </div>
              <button
                className="btn btn-primary w-100 fw-bold py-2 mt-4"
                onClick={handleFinalizePurchase}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
export default Checkout;
