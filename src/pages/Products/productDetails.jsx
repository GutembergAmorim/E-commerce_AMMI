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
      <div className="row g-4">
        {/* Product Images Section */}
        <div className="col-md-6">
          {/* Main Image */}
          <div
            className="bg-white rounded shadow-sm overflow-hidden mb-4"
            style={{ height: "600px" }}
          >
            <img
              id="mainImage"
              src={selectedImage || "https://via.placeholder.com/600x600/cccccc/ffffff?text=Imagem+Principal"} // selectedImage já será a URL completa
              alt={product.name || "Imagem Principal do Produto"}
              className="p-5 img-fluid h-100 w-100"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Thumbnails */}
          <div className="row row-cols-4 g-2">
            {productImages.length > 0
              ? productImages.map((imgUrl, index) => (
                  <div className="col" key={index}>
                    <div
                      className={`thumbnail cursor-pointer rounded border ${
                        selectedImage === imgUrl
                          ? "border-primary border-2"
                          : "border-secondary"
                      } overflow-hidden`}
                      onClick={() => handleThumbnailClick(imgUrl)}
                      style={{ height: "6rem" }}
                    >
                      <img
                        src={imgUrl} // imgUrl já será a URL completa vinda da API
                        alt={`Miniatura ${index + 1} de ${product.name}`}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                ))
              : Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="thumbnail bg-light rounded d-flex align-items-center justify-content-center"
                    style={{ height: "6rem" }}
                  >
                    <span className="small text-muted">
                      Thumb {index + 1}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="col-md-6">
          <div className="bg-white rounded shadow-sm p-4">
            {/* Product Title */}
            <h1 className="h2 fw-bold text-dark mb-2">
              {product.name || "Nome do Produto"}
            </h1>

            {/* Price */}
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

            {/* Description */}
            <div className="mb-4">
              <h2 className="h5 fw-semibold text-dark mb-2">Descrição</h2>
              <p className="text-muted">
                {product.description || "Descrição do produto não disponível."}
              </p>
            </div>

            {/* Colors */}
            <div className="mb-4">
              <h2 className="h5 fw-semibold text-dark mb-3">Cores</h2>
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
              <h2 className="h5 fw-semibold text-dark mb-3">Tamanhos</h2>
              <div className="d-flex flex-wrap gap-2">
                {productSizes.map((sizeOption) => (
                  <button
                    key={sizeOption}
                    className={`btn btn-outline-secondary ${
                      size === sizeOption ? "bg-dark text-white" : ""
                    }`}
                    onClick={() => handleSizeChange(sizeOption)}
                    title={sizeOption}
                    type="button"
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping Calculator */}
            <div className="mb-4">
              <h2 className="h5 fw-semibold text-dark mb-3">Calcular Frete</h2>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Digite seu CEP"
                  className="form-control"
                />
                <button className="btn btn-primary" type="button">
                  Calcular
                </button>
              </div>
              <div className="mt-2 small text-muted">
                <p>
                  <i className="fas fa-truck me-2"></i> Frete grátis para
                  compras acima de R$ 150,00
                </p>
                <p>
                  <i className="fas fa-undo me-2"></i> Devolução grátis em até
                  30 dias
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="d-flex flex-column flex-sm-row gap-2">
              <div className="input-group" style={{ maxWidth: "110px" }}>
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
                  id="quantity"
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
                className="btn btn-primary btn-lg flex-grow-1"
                onClick={addToCart}
                type="button"
              >
                <i className="fas fa-shopping-cart me-2"></i> Adicionar ao
                Carrinho
              </button>
            </div>
          </div>

          {/* Product Info Tabs */}
          <div className="bg-white rounded shadow-sm mt-4">
            <ul
              className="nav nav-tabs nav-fill mb-3"
              id="productInfoTabs"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="description-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#description-content"
                  type="button"
                  role="tab"
                  aria-controls="description-content"
                  aria-selected="true"
                >
                  Descrição
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="specs-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#specs-content"
                  type="button"
                  role="tab"
                  aria-controls="specs-content"
                  aria-selected="false"
                >
                  Especificações
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="reviews-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#reviews-content"
                  type="button"
                  role="tab"
                  aria-controls="reviews-content"
                  aria-selected="false"
                >
                  Avaliações
                </button>
              </li>
            </ul>
          </div>
          
          <div className="tab-content p-3" id="productInfoTabsContent">
            <div
              className="tab-pane fade show active"
              id="description-content"
              role="tabpanel"
              aria-labelledby="description-tab"
            >
              <p className="text-muted">
                {product.description || "Informações detalhadas do produto."}
              </p>
            </div>
            <div
              className="tab-pane fade"
              id="specs-content"
              role="tabpanel"
              aria-labelledby="specs-tab"
            >
              <p className="text-muted">Especificações do produto aqui...</p>
            </div>
            <div
              className="tab-pane fade"
              id="reviews-content"
              role="tabpanel"
              aria-labelledby="reviews-tab"
            >
              <p className="text-muted">Avaliações dos clientes aqui...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
