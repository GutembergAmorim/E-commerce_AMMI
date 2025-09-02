import React, { useState } from "react";

const AddressForm = ({ 
  address, 
  onInputChange, 
  onCepSearch, 
  isSearchingCep 
}) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        <h2 className="h4 fw-bold mb-3">Endereço de Entrega</h2>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="cep" className="form-label fw-bold">
              CEP
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
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
                <span className="input-group-text">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </span>
              )}
            </div>
            <small className="form-text text-muted">
              Não sabe o CEP?{" "}
              <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-decoration-none"
              >
                Encontre aqui!
              </a>
            </small>
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
                  onChange={onInputChange}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="numero" className="form-label">
                  Número *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="numero"
                  name="numero"
                  value={address.numero}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                  readOnly
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
                  onChange={onInputChange}
                  readOnly
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
                  onChange={onInputChange}
                  readOnly
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressForm;