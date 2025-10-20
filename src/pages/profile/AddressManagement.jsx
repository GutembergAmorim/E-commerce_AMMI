// src/pages/profile/AddressManagement.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data - você vai integrar com sua API
  const mockAddresses = [
    {
      _id: '1',
      name: 'Casa',
      address: 'Rua Principal',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01234-567',
      isDefault: true
    }
  ];

  useEffect(() => {
    // Aqui você vai buscar os endereços da API
    setAddresses(mockAddresses);
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <MapPin size={24} className="text-primary me-2" />
          <h4 className="mb-0">Meus Endereços</h4>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} className="me-2" />
          Novo Endereço
        </button>
      </div>

      <div className="row">
        {addresses.map((address) => (
          <div key={address._id} className="col-md-6 mb-3">
            <div className={`card ${address.isDefault ? 'border-primary' : ''}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="card-title">
                    {address.name}
                    {address.isDefault && (
                      <span className="badge bg-primary ms-2">Principal</span>
                    )}
                  </h6>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-outline-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="card-text mb-1">
                  {address.address}, {address.number}
                </p>
                {address.complement && (
                  <p className="card-text mb-1">Complemento: {address.complement}</p>
                )}
                <p className="card-text mb-1">
                  {address.neighborhood}, {address.city} - {address.state}
                </p>
                <p className="card-text">CEP: {address.postalCode}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-5">
          <MapPin size={64} className="text-muted mb-3" />
          <h5>Nenhum endereço cadastrado</h5>
          <p className="text-muted">
            Adicione um endereço para facilitar suas compras.
          </p>
          <button className="btn btn-primary">
            <Plus size={16} className="me-2" />
            Adicionar Primeiro Endereço
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;