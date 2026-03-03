import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, ImagePlus } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { productService } from '../../services/productService';
import './AdminDashboard.css';

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
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadService.uploadImage(file);
      if (response.success) {
        setForm((prev) => ({ ...prev, images: [...prev.images, response.data.url] }));
      } else {
        showNotification(response.message || 'Falha no upload', 'error');
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      showNotification(serverMessage || err.message || 'Erro ao enviar imagem', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  const parseSizes = (sizesStr) => sizesStr.split(',').map((s) => s.trim()).filter(Boolean);

  const parseColors = (colorsStr) => {
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

      const response = await productService.createProduct(payload);
      if (response.success) {
        showNotification('✅ Produto criado com sucesso!', 'success');
        setForm(defaultForm);
      } else {
        showNotification(response.message || 'Erro ao criar produto', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Erro ao criar produto', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Toast */}
      {notification.show && (
        <div
          className={`checkout-toast checkout-toast--${notification.type} checkout-toast--visible`}
          role="alert"
        >
          <span>{notification.message}</span>
          <button
            type="button"
            className="checkout-toast__close"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="admin-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <Link
            to="/admin/dashboard"
            style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}
          >
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </Link>
          <h1 className="admin-header__title">Novo Produto</h1>
          <p className="admin-header__subtitle">Preencha os dados do produto</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row g-4">
          {/* Left: Form */}
          <div className="col-lg-8">
            {/* Basic Info */}
            <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-card__header">
                <h2 className="admin-card__title">Informações Básicas</h2>
              </div>
              <div className="admin-card__body--padded">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="checkout-label">Nome do Produto *</label>
                    <input className="form-control checkout-input" name="name" value={form.name} onChange={onChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Categoria</label>
                    <select className="form-select checkout-input" name="category" value={form.category} onChange={onChange}>
                      <option>Top</option>
                      <option>Short</option>
                      <option>Legging</option>
                      <option>Macaquinho</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="checkout-label">Descrição *</label>
                    <textarea className="form-control checkout-input" rows={3} name="description" value={form.description} onChange={onChange} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-card__header">
                <h2 className="admin-card__title">Preço & Estoque</h2>
              </div>
              <div className="admin-card__body--padded">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="checkout-label">Preço (R$) *</label>
                    <input type="number" step="0.01" className="form-control checkout-input" name="price" value={form.price} onChange={onChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Preço Antigo (R$)</label>
                    <input type="number" step="0.01" className="form-control checkout-input" name="oldPrice" value={form.oldPrice} onChange={onChange} placeholder="Opcional" />
                  </div>
                  <div className="col-md-4">
                    <label className="checkout-label">Estoque Inicial</label>
                    <input type="number" className="form-control checkout-input" name="stock" value={form.stock} onChange={onChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-card__header">
                <h2 className="admin-card__title">Variações</h2>
              </div>
              <div className="admin-card__body--padded">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="checkout-label">Tamanhos (separados por vírgula)</label>
                    <input className="form-control checkout-input" name="sizes" value={form.sizes} onChange={onChange} placeholder="P,M,G,GG" />
                  </div>
                  <div className="col-md-6">
                    <label className="checkout-label">Cores (Nome:#hex)</label>
                    <input className="form-control checkout-input" name="colors" value={form.colors} onChange={onChange} placeholder="Preto:#000000,Rosa:#ff66aa" />
                  </div>
                  <div className="col-12 d-flex gap-4">
                    <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" name="isNew" checked={form.isNew} onChange={onChange} style={{ width: 16, height: 16, accentColor: '#1a1a1a' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Novo</span>
                    </label>
                    <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" name="isHighlighted" checked={form.isHighlighted} onChange={onChange} style={{ width: 16, height: 16, accentColor: '#1a1a1a' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Destaque</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Images + Submit */}
          <div className="col-lg-4">
            <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-card__header">
                <h2 className="admin-card__title">Imagens</h2>
              </div>
              <div className="admin-card__body--padded">
                {/* Upload Area */}
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '24px 16px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 12,
                    cursor: uploading ? 'wait' : 'pointer',
                    background: '#fafafa',
                    transition: 'border-color 0.2s',
                    marginBottom: 16,
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => addImage(e.target.files?.[0])}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
                      <span style={{ fontSize: '0.78rem', color: '#999' }}>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={24} color="#bbb" />
                      <span style={{ fontSize: '0.78rem', color: '#999' }}>Clique para adicionar</span>
                    </>
                  )}
                </label>

                {/* Previews */}
                <div className="d-flex flex-wrap gap-2">
                  {form.images.map((url) => (
                    <div key={url} style={{ position: 'relative' }}>
                      <img src={url} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #f0f0f0' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 22, height: 22, borderRadius: '50%',
                          background: '#1a1a1a', color: '#fff', border: 'none',
                          fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {form.images.length === 0 && (
                  <p style={{ fontSize: '0.73rem', color: '#bbb', textAlign: 'center', margin: 0 }}>
                    Nenhuma imagem adicionada
                  </p>
                )}
              </div>
            </div>

            <button
              className="checkout-btn checkout-btn--primary"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Salvando...
                </>
              ) : (
                'Criar Produto'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
