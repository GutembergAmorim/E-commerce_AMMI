import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useProduct } from "../../hooks/useProducts";

const ProductDetails = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const [selectedImage, setSelectedImage] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");

  const { addItemToCart } = useCart();

  const productImages = product?.images || [];
  const productColors = product?.colors || [];
  const productSizes = product?.sizes || [];

  // Definir imagem selecionada quando o produto carregar
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleColorChange = (item) => {
    setColor(item);
  };

  const handleSizeChange = (item) => {
    setSize(item);
  };

  const incrementQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const addToCart = () => {
    if (!product || !color || !size || quantity <= 0) {
      alert("Por favor, selecione todas as opções antes de adicionar ao carrinho.");
      return;
    }

    const productItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      color: color,
      size: size,
      image: product.images?.[0] || selectedImage,
      originalPrice: product.oldPrice || null,
    };

    addItemToCart(productItem);
    alert(`Produto adicionado ao carrinho: ${product.name}`);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Produto não encontrado</h4>
          <p>O produto que você está procurando não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-5">
        {/* Product Images Section */}
        <div className="col-lg-7">
          <div className="d-flex gap-3">
             {/* Thumbnails (Vertical) */}
             <div className="d-flex flex-column gap-2" style={{ width: "100px" }}>
                {productImages.length > 0
                  ? productImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer rounded border ${
                          selectedImage === imgUrl
                            ? "border-dark border-2"
                            : "border-light"
                        } overflow-hidden`}
                        onClick={() => handleThumbnailClick(imgUrl)}
                        style={{ height: "100px", width: "100px" }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Miniatura ${index + 1}`}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))
                  : Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ height: "100px", width: "100px" }}
                      >
                        <span className="small text-muted">Img</span>
                      </div>
                    ))}
             </div>

             {/* Main Image */}
             <div className="flex-grow-1 bg-white rounded shadow-sm overflow-hidden" style={{ height: "500px" }}>
                <img
                  id="mainImage"
                  src={selectedImage || "https://via.placeholder.com/600x600/cccccc/ffffff?text=Imagem+Principal"}
                  alt={product.name}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
             </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="col-lg-5">
          <div className="ps-lg-4">
            {/* Product Title (Centered) */}
            <h1 className="h2 fw-bold text-dark mb-4 text-center">
              {product.name || "Nome do Produto"}
            </h1>

            {/* Price (Left Aligned) */}
            <div className="mb-4">
              <span className="display-6 fw-bold text-dark">
                R$ {product.price?.toFixed(2).replace(".", ",") || "0,00"}
              </span>
              {product.oldPrice && (
                <span className="fs-5 text-muted text-decoration-line-through ms-2">
                  R$ {product.oldPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>

            {/* Description (Short) */}
            <div className="mb-4">
              <p className="text-muted">
                {product.description || "lorem ipsum dolor sit amet consectetur adipiscing elit lorem ipsum dolor sit amet consectetur adipiscing elit lorem ipsum dolor sit amet consectetur adipiscing elit lorem ipsum dolor sit amet consectetur adipiscing elit"}
              </p>
            </div>

            {/* Colors */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2">Cores</h6>
              <div className="d-flex gap-2">
                {productColors.map((opt) => (
                  <button
                    key={opt.value}
                    className={`rounded-circle border ${
                      color === opt.value
                        ? "border-dark border-2 shadow-sm"
                        : "border-secondary"
                    }`}
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: opt.colorCode,
                    }}
                    onClick={() => handleColorChange(opt.value)}
                    title={opt.name}
                    type="button"
                  ></button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2">Tamanhos</h6>
              <div className="d-flex flex-wrap gap-2">
                {productSizes.map((sizeOption) => (
                  <button
                    key={sizeOption}
                    className={`btn btn-sm ${
                      size === sizeOption ? "btn-dark" : "btn-outline-secondary"
                    }`}
                    onClick={() => handleSizeChange(sizeOption)}
                    title={sizeOption}
                    type="button"
                    style={{ minWidth: "40px" }}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping Info (Static) */}
            <div className="mb-4 p-3 bg-light rounded">
                <p className="mb-1 fw-medium">
                  <i className="fas fa-truck me-2"></i> Frete fixo para Fortaleza: <span className="text-success fw-bold">R$ 15,00</span>
                </p>
                <p className="mb-0 small text-muted">
                  <i className="fas fa-undo me-2"></i> Devolução grátis em até 7 dias
                </p>
            </div>

            {/* Add to Cart */}
            <div className="d-flex gap-3">
              <div className="input-group" style={{ maxWidth: "120px" }}>
                <button
                  className="btn btn-outline-secondary"
                  onClick={decrementQuantity}
                  type="button"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  className="form-control text-center"
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={incrementQuantity}
                  type="button"
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-dark flex-grow-1 py-2 fw-bold"
                onClick={addToCart}
                type="button"
              >
                ADICIONAR AO CARRINHO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section (Description & Specs) */}
      <div className="row mt-5">
        <div className="col-12">
            <div className="border-bottom mb-4">
                <ul className="nav nav-tabs border-0 justify-content-center" id="productTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link border-0 fw-bold text-uppercase ${activeTab === 'desc' ? 'active text-dark' : 'text-muted'}`}
                            onClick={() => setActiveTab('desc')}
                            type="button"
                        >
                            Descrição
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link border-0 fw-bold text-uppercase ${activeTab === 'specs' ? 'active text-dark' : 'text-muted'}`} 
                            onClick={() => setActiveTab('specs')}
                            type="button"
                        >
                            Especificações Técnicas
                        </button>
                    </li>
                </ul>
            </div>
            
            <div className="tab-content" id="productTabsContent">
                {activeTab === 'desc' && (
                    <div className="tab-pane fade show active text-center" role="tabpanel">
                        <p className="text-muted mx-auto" style={{ maxWidth: "800px" }}>
                            {product.description || "Descrição detalhada do produto."}
                        </p>
                    </div>
                )}
                {activeTab === 'specs' && (
                    <div className="tab-pane fade show active text-center" role="tabpanel">
                        <p className="text-muted">
                            Informações técnicas não disponíveis no momento.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
