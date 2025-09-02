import React, { useState } from 'react';
import { uploadService } from '../../services/uploadService';

const MediaUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState(null);

  const onFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const response = await uploadService.uploadImage(file);
      if (response.success) {
        setUploaded((prev) => [response.data, ...prev]);
        setFile(null);
      } else {
        setError(response.message || 'Falha no upload');
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (publicId) => {
    try {
      await uploadService.deleteImage(publicId);
      setUploaded((prev) => prev.filter((item) => item.publicId !== publicId));
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || err.message || 'Erro ao deletar imagem');
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Upload de Imagens (Cloudinary)</h1>
      <form className="d-flex gap-2 align-items-center" onSubmit={onUpload}>
        <input type="file" accept="image/*" onChange={onFileChange} className="form-control" />
        <button className="btn btn-primary" type="submit" disabled={!file || uploading}>
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 mt-3">
        {uploaded.map((item) => (
          <div className="col" key={item.publicId}>
            <div className="card h-100 shadow-sm">
              <img src={item.url} className="card-img-top" alt={item.publicId} style={{ objectFit: 'cover', height: 240 }} />
              <div className="card-body">
                <p className="card-text small text-truncate">{item.publicId}</p>
                <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(item.publicId)}>Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaUpload;


