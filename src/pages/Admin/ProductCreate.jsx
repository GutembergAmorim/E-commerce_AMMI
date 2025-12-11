import React, { useState } from 'react';
import { uploadService } from '../../services/uploadService';
import { productService } from '../../services/productService';

const defaultForm = {
  name: '',
  description: '',
  price: '',
  oldPrice: '',
  category: 'Top',
  sizes: 'P,M,G',
  colors: 'Preto:#000000',
  isNew: false,
  isHighlighted: false,
  stock: 0,
  images: [],
};

const ProductCreate = () => {
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImage = async (file) => {
    console.log('Chamou addImage com:', file);
    if (!file) {
        console.log('Nenhum arquivo recebido em addImage');
        return;
    }
    setUploading(true);
    setError(null);
    try {
      console.log('Iniciando upload...');
      const response = await uploadService.uploadImage(file);
      console.log('Resposta do upload:', response);
      if (response.success) {
        console.log('Adicionando imagem ao estado:', response.data.url);
        setForm((prev) => {
           const newState = { ...prev, images: [...prev.images, response.data.url] };
           console.log('Novo estado do form (images):', newState.images);
           return newState;
        });
      } else {
        console.error('Erro no upload (sucesso falso):', response);
        setError(response.message || 'Falha no upload');
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      console.error('Erro no catch:', err);
      setError(serverMessage || err.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  const parseSizes = (sizesStr) => sizesStr.split(',').map((s) => s.trim()).filter(Boolean);

  const parseColors = (colorsStr) => {
    // formato: Nome:#hex,Nome2:#hex
    return colorsStr
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean)
      .map((pair) => {
        const [name, colorCode] = pair.split(':').map((t) => t.trim());
        return { name: name || 'Cor', value: name || 'Cor', colorCode: colorCode || '#000000' };
      });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        images: form.images,
        colors: parseColors(form.colors),
        sizes: parseSizes(form.sizes),
        category: form.category,
        isNew: form.isNew,
        isHighlighted: form.isHighlighted,
        stock: Number(form.stock),
        status: '',
      };

      console.log('Payload enviado:', payload);
      const response = await productService.createProduct(payload);
      if (response.success) {
        setSuccess('Produto criado com sucesso');
        setForm(defaultForm);
      } else {
        setError(response.message || 'Erro ao criar produto');
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar produto');
      console.log(error)
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Novo Produto</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={onSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nome</label>
          <input className="form-control" name="name" value={form.name} onChange={onChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Categoria</label>
          <select className="form-select" name="category" value={form.category} onChange={onChange}>
            <option>Top</option>
            <option>Short</option>
            <option>Legging</option>
            <option>Macaquinho</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Descrição</label>
          <textarea className="form-control" rows={3} name="description" value={form.description} onChange={onChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Preço</label>
          <input type="number" step="0.01" className="form-control" name="price" value={form.price} onChange={onChange} required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Preço Antigo</label>
          <input type="number" step="0.01" className="form-control" name="oldPrice" value={form.oldPrice} onChange={onChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Estoque</label>
          <input type="number" className="form-control" name="stock" value={form.stock} onChange={onChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Tamanhos (ex: P,M,G)</label>
          <input className="form-control" name="sizes" value={form.sizes} onChange={onChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Cores (ex: Preto:#000000,Rosa:#ff66aa)</label>
          <input className="form-control" name="colors" value={form.colors} onChange={onChange} />
        </div>

        <div className="col-12 d-flex gap-3 align-items-center">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="isNew" name="isNew" checked={form.isNew} onChange={onChange} />
            <label className="form-check-label" htmlFor="isNew">Novo</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="isHighlighted" name="isHighlighted" checked={form.isHighlighted} onChange={onChange} />
            <label className="form-check-label" htmlFor="isHighlighted">Em destaque</label>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">Imagens</label>
          <div className="d-flex gap-2 align-items-center">
            <input 
                type="file" 
                accept="image/*" 
                className="form-control" 
                onChange={(e) => {
                    console.log('Evento onChange disparado', e.target.files);
                    addImage(e.target.files?.[0]);
                }} 
                disabled={uploading} 
            />
            <span className="text-muted small">{uploading ? 'Enviando...' : 'Selecione uma imagem para enviar'}</span>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {form.images.map((url) => (
              <div key={url} className="position-relative">
                <img src={url} alt="preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />
                <button type="button" className="btn btn-sm btn-outline-danger position-absolute top-0 end-0" onClick={() => removeImage(url)}>x</button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <button className="btn btn-success" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
