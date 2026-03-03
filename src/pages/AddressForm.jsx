import React from "react";

const AddressForm = ({
  address,
  onInputChange,
  onCepSearch,
  isSearchingCep,
}) => {
  return (
    <div className="checkout-card">
      <h2 className="checkout-card__title">
        <i className="fas fa-map-marker-alt"></i>
        Endereço de Entrega
      </h2>

      <div className="row g-3">
        <div className="col-12">
          <label htmlFor="cep" className="checkout-label">
            CEP *
          </label>
          <div className="input-group">
            <input
              type="text"
              className="form-control checkout-input"
              id="cep"
              name="cep"
              placeholder="00000-000"
              required
              value={address.cep}
              onChange={onInputChange}
              onBlur={(e) => onCepSearch(e.target.value)}
              maxLength="9"
            />
            {isSearchingCep && (
              <span
                className="input-group-text"
                style={{
                  borderRadius: "0 10px 10px 0",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                }}
              >
                <div
                  className="spinner-border spinner-border-sm text-dark"
                  role="status"
                >
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </span>
            )}
          </div>
          <small style={{ fontSize: "0.73rem", color: "#999" }}>
            Não sabe o CEP?{" "}
            <a
              href="https://buscacepinter.correios.com.br/app/endereco/index.php"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1a1a1a", fontWeight: 600, textDecoration: "none" }}
            >
              Encontre aqui
            </a>
          </small>
        </div>

        {address.logradouro && (
          <>
            <div className="col-12">
              <label htmlFor="logradouro" className="checkout-label">
                Rua
              </label>
              <input
                type="text"
                className="form-control checkout-input"
                id="logradouro"
                name="logradouro"
                value={address.logradouro}
                onChange={onInputChange}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="numero" className="checkout-label">
                Número *
              </label>
              <input
                type="text"
                className="form-control checkout-input"
                id="numero"
                name="numero"
                value={address.numero}
                onChange={onInputChange}
                placeholder="Nº"
                required
              />
            </div>
            <div className="col-md-8">
              <label htmlFor="complemento" className="checkout-label">
                Complemento
              </label>
              <input
                type="text"
                className="form-control checkout-input"
                id="complemento"
                name="complemento"
                value={address.complemento}
                onChange={onInputChange}
                placeholder="Apto, Bloco, etc."
              />
            </div>
            <div className="col-md-5">
              <label htmlFor="bairro" className="checkout-label">
                Bairro
              </label>
              <input
                type="text"
                className="form-control checkout-input"
                id="bairro"
                name="bairro"
                value={address.bairro}
                onChange={onInputChange}
                readOnly
              />
            </div>
            <div className="col-md-5">
              <label htmlFor="cidade" className="checkout-label">
                Cidade
              </label>
              <input
                type="text"
                className="form-control checkout-input"
                id="cidade"
                name="localidade"
                value={address.localidade}
                onChange={onInputChange}
                readOnly
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="estado" className="checkout-label">
                UF
              </label>
              <input
                type="text"
                className="form-control checkout-input"
                id="estado"
                name="uf"
                value={address.uf}
                onChange={onInputChange}
                readOnly
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddressForm;