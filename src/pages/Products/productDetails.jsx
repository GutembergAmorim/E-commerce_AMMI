import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useFavorites } from "../../Context/FavoritesContext";
import { useProduct } from "../../hooks/useProducts";
import StarRating from "../../components/StarRating/StarRating";
import ProductReviews from "../../components/ProductReviews/ProductReviews";
import RelatedProducts from "../../components/RelatedProducts/RelatedProducts";
import tabela_de_medidas from "../../assets/tabela_de_medidas.png";
import CartToast from "../../components/CartToast/CartToast";
import "./ProductDetails.css";

// ── Skeleton Loader ──
const ProductSkeleton = () => (
  <div className="container py-5">
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="pdp-skeleton">
          <div className="pdp-skeleton__thumbs">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="pdp-skeleton__thumb" />
            ))}
          </div>
          <div className="pdp-skeleton__main-img" />
        </div>
      </div>
      <div className="col-lg-5">
        <div className="pdp-skeleton__info">
          <div className="pdp-skeleton__line pdp-skeleton__line--title" />
          <div className="pdp-skeleton__line pdp-skeleton__line--price" />
          <div className="pdp-skeleton__line pdp-skeleton__line--desc" />
          <div className="pdp-skeleton__line pdp-skeleton__line--desc2" />
          <div className="pdp-skeleton__line pdp-skeleton__line--desc" />
          <div className="pdp-skeleton__line pdp-skeleton__line--btn" />
        </div>
      </div>
    </div>
  </div>
);

// ── Helper: get variation stock for a color+size combo ──
const getVariationStock = (variations, color, size) => {
  if (!variations || variations.length === 0) return null; // no variation data
  const match = variations.find(
    (v) => v.color === color && v.size === size
  );
  return match ? match.stock : null;
};

// ── Helper: check if a size has any stock across all colors ──
const sizeHasStock = (variations, sizeOption) => {
  if (!variations || variations.length === 0) return true; // no variation data = assume available
  const sizeVariations = variations.filter((v) => v.size === sizeOption);
  if (sizeVariations.length === 0) return true; // size not tracked in variations
  return sizeVariations.some((v) => v.stock > 0);
};

// ── Helper: check if a color has any stock across all sizes ──
const colorHasStock = (variations, colorValue) => {
  if (!variations || variations.length === 0) return true;
  const colorVariations = variations.filter((v) => v.color === colorValue);
  if (colorVariations.length === 0) return true;
  return colorVariations.some((v) => v.stock > 0);
};

const ProductDetails = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const [selectedImage, setSelectedImage] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [buttonState, setButtonState] = useState("idle");
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const buttonTimerRef = useRef(null);

  const { addItemToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const productImages = product?.images || [];
  const productColors = product?.colors || [];
  const productSizes = product?.sizes || [];
  const productVariations = product?.variations || [];

  const isFav = product ? isFavorite(product._id) : false;

  // Stock calculations
  const globalStock = typeof product?.stock === "number" ? product.stock : null;
  const lowStockAlert = product?.lowStockAlert ?? 5;
  const isGlobalOutOfStock = globalStock !== null && globalStock === 0;
  const isGlobalLowStock = globalStock !== null && globalStock > 0 && globalStock <= lowStockAlert;

  // Selected variation stock
  const selectedVariationStock =
    color && size ? getVariationStock(productVariations, color, size) : null;
  const isSelectedOutOfStock =
    selectedVariationStock !== null ? selectedVariationStock === 0 : false;

  // Max quantity for selected variation
  const maxQuantity =
    selectedVariationStock !== null
      ? selectedVariationStock
      : globalStock !== null
      ? globalStock
      : 99;

  // Imagem selecionada quando produto carrega
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  // Reset quantity when variation changes
  useEffect(() => {
    setQuantity(1);
  }, [color, size]);

  const incrementQuantity = () =>
    setQuantity((q) => (q < maxQuantity ? q + 1 : q));
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const canAddToCart = () => {
    if (!product || !color || !size || quantity <= 0) return false;
    if (isGlobalOutOfStock) return false;
    if (isSelectedOutOfStock) return false;
    return true;
  };

  const addToCart = () => {
    if (!canAddToCart()) {
      setButtonState("shake");
      setTimeout(() => setButtonState("idle"), 500);
      return;
    }

    const productImage = product.images?.[0] || selectedImage;

    addItemToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity,
      color,
      size,
      image: productImage,
      originalPrice: product.oldPrice || null,
    });

    if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
    setButtonState("added");
    buttonTimerRef.current = setTimeout(() => setButtonState("idle"), 2000);

    setToastProduct({
      name: product.name,
      image: productImage,
      color,
      size,
    });
    setShowToast(true);
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product);
    }
  };

  // Calcular desconto
  const discountPercent =
    product?.oldPrice && product?.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  // ── Loading ──
  if (loading) return <ProductSkeleton />;

  // ── Error ──
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

  // ── Not Found ──
  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Produto não encontrado</h4>
          <p>O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/collections" className="btn btn-dark rounded-pill px-4 mt-2">
            Ver coleção
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-5">
        <div className="row g-5">
          {/* ━━ Image Gallery ━━ */}
          <div className="col-lg-7">
            <div className="pdp-gallery">
              {/* Thumbnails */}
              <div className="pdp-thumbs">
                {productImages.length > 0
                  ? productImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className={`pdp-thumb ${selectedImage === imgUrl ? "pdp-thumb--active" : ""}`}
                        onClick={() => setSelectedImage(imgUrl)}
                      >
                        <img src={imgUrl} alt={`${product.name} - foto ${index + 1}`} />
                      </div>
                    ))
                  : [...Array(4)].map((_, i) => (
                      <div key={i} className="pdp-thumb pdp-thumb--placeholder">
                        <span>Img</span>
                      </div>
                    ))}
              </div>

              {/* Main Image */}
              <div className="pdp-main-image">
                <img
                  src={selectedImage || "https://via.placeholder.com/600x600/cccccc/ffffff?text=Imagem"}
                  alt={product.name}
                />
                {/* Out of stock overlay */}
                {isGlobalOutOfStock && (
                  <div className="pdp-sold-out-overlay">
                    <span>ESGOTADO</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ━━ Product Info ━━ */}
          <div className="col-lg-5">
            <div className="pdp-info">
              {/* Title + Favorite */}
              <div className="pdp-title-row">
                <div>
                  <h1 className="pdp-title">{product.name}</h1>
                  {/* Star Rating */}
                  {product.numReviews > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <StarRating
                        rating={product.averageRating || 0}
                        size={14}
                        count={product.numReviews}
                      />
                    </div>
                  )}
                  {/* Stock badges */}
                  {isGlobalOutOfStock && (
                    <span className="pdp-stock-badge pdp-stock-badge--out">
                      <i className="fas fa-ban" style={{ marginRight: 5 }}></i>
                      Produto Esgotado
                    </span>
                  )}
                  {isGlobalLowStock && (
                    <span className="pdp-stock-badge pdp-stock-badge--low">
                      <i className="fas fa-fire" style={{ marginRight: 5 }}></i>
                      Últimas {globalStock} unidades!
                    </span>
                  )}
                </div>
                <button
                  className={`pdp-fav-btn ${isFav ? "pdp-fav-btn--active" : ""}`}
                  onClick={handleToggleFavorite}
                  title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  type="button"
                >
                  <i className={`${isFav ? "fas" : "far"} fa-heart fs-4`}></i>
                </button>
              </div>

              {/* Price */}
              <div className="pdp-price">
                <span className="pdp-price__current">
                  R$ {product.price?.toFixed(2).replace(".", ",")}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="pdp-price__old">
                      R$ {product.oldPrice.toFixed(2).replace(".", ",")}
                    </span>
                    {discountPercent > 0 && (
                      <span className="pdp-price__discount">-{discountPercent}%</span>
                    )}
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="pdp-description">{product.description}</p>
              )}

              {/* Colors */}
              {productColors.length > 0 && (
                <div className="mb-3">
                  <p className="pdp-label">
                    Cor{color && <span style={{ textTransform: "none", fontWeight: 500 }}> — {productColors.find(c => c.value === color)?.name || color}</span>}
                  </p>
                  <div className="pdp-colors">
                    {productColors.map((opt) => {
                      const hasStock = colorHasStock(productVariations, opt.value);
                      return (
                        <button
                          key={opt.value}
                          className={`pdp-color-swatch ${color === opt.value ? "pdp-color-swatch--active" : ""} ${!hasStock ? "pdp-color-swatch--disabled" : ""}`}
                          style={{ backgroundColor: opt.colorCode }}
                          onClick={() => hasStock && setColor(opt.value)}
                          title={hasStock ? opt.name : `${opt.name} — Esgotado`}
                          type="button"
                          aria-label={`Cor ${opt.name}${!hasStock ? " — Esgotado" : ""}`}
                          disabled={!hasStock}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {productSizes.length > 0 && (
                <div className="mb-3">
                  <p className="pdp-label">Tamanho</p>
                  <div className="pdp-sizes">
                    {productSizes.map((sizeOption) => {
                      const hasStock = sizeHasStock(productVariations, sizeOption);
                      return (
                        <button
                          key={sizeOption}
                          className={`pdp-size-btn ${size === sizeOption ? "pdp-size-btn--active" : ""} ${!hasStock ? "pdp-size-btn--disabled" : ""}`}
                          onClick={() => hasStock && setSize(sizeOption)}
                          type="button"
                          title={!hasStock ? "Esgotado" : sizeOption}
                          disabled={!hasStock}
                        >
                          {sizeOption}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected variation out-of-stock notice */}
              {color && size && isSelectedOutOfStock && (
                <div className="pdp-variation-notice">
                  <i className="fas fa-info-circle"></i>
                  Esta combinação de cor e tamanho está esgotada.
                </div>
              )}

              {/* Shipping */}
              <div className="pdp-shipping">
                <div className="pdp-shipping__row">
                  <div className="pdp-shipping__icon pdp-shipping__icon--truck">
                    <i className="fas fa-truck"></i>
                  </div>
                  <span>
                    Frete fixo para Fortaleza: <strong className="text-success">R$ 15,00</strong>
                  </span>
                </div>
                <div className="pdp-shipping__row">
                  <div className="pdp-shipping__icon pdp-shipping__icon--return">
                    <i className="fas fa-undo"></i>
                  </div>
                  <span>Devolução grátis em até 7 dias</span>
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="pdp-actions">
                <div className="pdp-qty">
                  <button className="pdp-qty__btn" onClick={decrementQuantity} type="button" disabled={isGlobalOutOfStock}>−</button>
                  <span className="pdp-qty__value">{quantity}</span>
                  <button className="pdp-qty__btn" onClick={incrementQuantity} type="button" disabled={isGlobalOutOfStock || quantity >= maxQuantity}>+</button>
                </div>
                <button
                  className={`pdp-add-btn ${buttonState === "added" ? "pdp-add-btn--added" : ""} ${buttonState === "shake" ? "pdp-add-btn--shake" : ""} ${isGlobalOutOfStock || isSelectedOutOfStock ? "pdp-add-btn--disabled" : ""}`}
                  onClick={addToCart}
                  type="button"
                  disabled={buttonState === "added" || isGlobalOutOfStock || isSelectedOutOfStock}
                >
                  {isGlobalOutOfStock
                    ? "Produto Esgotado"
                    : isSelectedOutOfStock
                    ? "Combinação Indisponível"
                    : buttonState === "added"
                    ? "✓ Adicionado!"
                    : "Adicionar ao carrinho"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ━━ Tabs ━━ */}
        <div className="pdp-tabs">
          <div className="pdp-tabs__nav">
            <button
              className={`pdp-tab-btn ${activeTab === "desc" ? "pdp-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("desc")}
              type="button"
            >
              Descrição
            </button>
            <button
              className={`pdp-tab-btn ${activeTab === "specs" ? "pdp-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("specs")}
              type="button"
            >
              Especificações Técnicas
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === "desc" && (
              <p>{product.description || "Descrição detalhada do produto."}</p>
            )}
            {activeTab === "specs" && (
              <img src={tabela_de_medidas} alt="Tabela de Medidas" />
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container pb-5">
        <ProductReviews productId={id} />
        <RelatedProducts currentProductId={id} category={product?.category} />
      </div>

      {/* Toast */}
      <CartToast
        show={showToast}
        onClose={() => setShowToast(false)}
        product={toastProduct}
      />
    </>
  );
};

export default ProductDetails;
