import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import { SlidersHorizontal, Package, X, Flame, Tag } from "lucide-react";
import "./style.css";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/ProductCard/ProductCard";

function Collections() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { products: fetchProducts, loading, error, refetch } = useProducts();

  // Read URL params for sort, sale, and search modes
  const urlSort = searchParams.get("sort");
  const urlSale = searchParams.get("sale");
  const urlSearch = searchParams.get("search");
  const isSaleMode = urlSale === "true";
  const isBestSellersMode = urlSort === "best-sellers";
  const isSearchMode = !!urlSearch;

  // Sync sortBy from URL
  useEffect(() => {
    if (isBestSellersMode) {
      setSortBy("best-sellers");
    }
  }, [isBestSellersMode]);

  // Dynamic page title
  const pageTitle = isSearchMode
    ? `Resultados para "${urlSearch}"`
    : isSaleMode
    ? "Promoções"
    : isBestSellersMode
    ? "Mais Vendidos"
    : "Nossa Coleção";

  const pageSubtitle = isSearchMode
    ? "Veja o que encontramos para você"
    : isSaleMode
    ? "Aproveite os melhores preços em produtos selecionados"
    : isBestSellersMode
    ? "Os favoritos das nossas clientes"
    : "Encontre o look perfeito para seu treino";

  // Extract unique categories
  const categories = useMemo(
    () => ["Todos", ...new Set(fetchProducts.map((p) => p.category))],
    [fetchProducts]
  );

  // Extract unique colors
  const colors = useMemo(() => {
    const allColors = fetchProducts.flatMap((p) =>
      Array.isArray(p.colors) ? p.colors.map((c) => c.name) : []
    );
    return [...new Set(allColors)];
  }, [fetchProducts]);

  // Determine max price
  useEffect(() => {
    if (fetchProducts.length > 0) {
      const max = Math.max(...fetchProducts.map((p) => p.price));
      setMaxPrice(Math.ceil(max));
      setPriceRange([0, Math.ceil(max)]);
    }
  }, [fetchProducts]);

  // Update active category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = fetchProducts.filter((product) => {
      const categoryMatch =
        activeCategory === "Todos" ||
        product.category.toLowerCase() === activeCategory.toLowerCase();
      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const colorMatch =
        selectedColors.length === 0 ||
        (product.colors && product.colors.some((c) => selectedColors.includes(c.name)));

      // Sale filter: only products with oldPrice > price
      const saleMatch = isSaleMode
        ? product.oldPrice && product.oldPrice > product.price
        : true;

      // Search filter
      const searchMatch = isSearchMode
        ? product.name?.toLowerCase().includes(urlSearch.toLowerCase()) ||
          product.description?.toLowerCase().includes(urlSearch.toLowerCase()) ||
          product.category?.toLowerCase().includes(urlSearch.toLowerCase())
        : true;

      return categoryMatch && priceMatch && colorMatch && saleMatch && searchMatch;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "best-sellers":
        result = [...result].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        break;
      case "discount":
        result = [...result].sort((a, b) => {
          const discA = a.oldPrice ? ((a.oldPrice - a.price) / a.oldPrice) * 100 : 0;
          const discB = b.oldPrice ? ((b.oldPrice - b.price) / b.oldPrice) * 100 : 0;
          return discB - discA;
        });
        break;
      case "newest":
      default:
        // Keep original order (newest first from API)
        break;
    }

    return result;
  }, [activeCategory, priceRange, selectedColors, fetchProducts, sortBy, isSaleMode, isSearchMode, urlSearch]);

  const handleColorChange = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handlePriceChange = (e, index) => {
    const value = Number(e.target.value);
    setPriceRange((prev) => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  // Custom slider drag logic
  const sliderRef = useRef(null);
  const draggingRef = useRef(null); // 'min' | 'max' | null

  const getValueFromPosition = useCallback((clientX) => {
    const slider = sliderRef.current;
    if (!slider) return 0;
    const rect = slider.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(percent * maxPrice);
  }, [maxPrice]);

  const handlePointerMove = useCallback((e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const val = getValueFromPosition(clientX);
    if (draggingRef.current === 'min') {
      setPriceRange((prev) => [Math.min(val, prev[1] - 1), prev[1]]);
    } else if (draggingRef.current === 'max') {
      setPriceRange((prev) => [prev[0], Math.max(val, prev[0] + 1)]);
    }
  }, [getValueFromPosition]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
    document.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('mouseup', handlePointerUp);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('touchend', handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = useCallback((which, e) => {
    e.preventDefault();
    draggingRef.current = which;
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
  }, [handlePointerMove, handlePointerUp]);

  const clearAllFilters = () => {
    setActiveCategory("Todos");
    setPriceRange([0, maxPrice]);
    setSelectedColors([]);
  };

  const hasActiveFilters =
    activeCategory !== "Todos" ||
    selectedColors.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  // ---- Shared filter content (desktop sidebar + mobile offcanvas) ----
  const FilterContent = () => (
    <>
      {/* Categories */}
      <div className="filter-section">
        <p className="filter-section__title">Categorias</p>
        <div className="d-flex flex-column gap-1">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-category-btn ${
                activeCategory === category ? "filter-category-btn--active" : ""
              }`}
              onClick={() => {
                setActiveCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="filter-section">
        <p className="filter-section__title">Faixa de Preço</p>
        <div className="d-flex justify-content-between small mb-2" style={{ color: "#888" }}>
          <span>R$ {priceRange[0]}</span>
          <span>R$ {priceRange[1]}</span>
        </div>
        <div className="price-slider-container" ref={sliderRef}>
          <div className="slider-track"></div>
          <div
            className="slider-track-active"
            style={{
              left: `${(priceRange[0] / maxPrice) * 100}%`,
              right: `${100 - (priceRange[1] / maxPrice) * 100}%`,
            }}
          ></div>
          <div
            className="slider-thumb"
            style={{ left: `${(priceRange[0] / maxPrice) * 100}%` }}
            onMouseDown={(e) => startDrag('min', e)}
            onTouchStart={(e) => startDrag('min', e)}
            role="slider"
            aria-label="Preço mínimo"
            aria-valuemin={0}
            aria-valuemax={maxPrice}
            aria-valuenow={priceRange[0]}
            tabIndex={0}
          />
          <div
            className="slider-thumb"
            style={{ left: `${(priceRange[1] / maxPrice) * 100}%` }}
            onMouseDown={(e) => startDrag('max', e)}
            onTouchStart={(e) => startDrag('max', e)}
            role="slider"
            aria-label="Preço máximo"
            aria-valuemin={0}
            aria-valuemax={maxPrice}
            aria-valuenow={priceRange[1]}
            tabIndex={0}
          />
        </div>
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div className="filter-section">
          <p className="filter-section__title">Cores</p>
          <div className="d-flex flex-column gap-1">
            {colors.map((color) => (
              <div className="filter-color-check" key={color}>
                <input
                  type="checkbox"
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorChange(color)}
                />
                <label htmlFor={`color-${color}`}>{color}</label>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // ---- Skeleton loader ----
  const SkeletonGrid = () => (
    <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="col" key={i}>
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text skeleton-text--short"></div>
            <div className="skeleton-text skeleton-text--price"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container py-4">
      {/* ---- Header ---- */}
      <div className="collections-header">
        <div className="d-flex align-items-center justify-content-center gap-2">
          {isSaleMode && <Tag size={24} style={{ color: '#ef4444' }} />}
          {isBestSellersMode && <Flame size={24} style={{ color: '#f59e0b' }} />}
          <h1 className="collections-header__title">{pageTitle}</h1>
        </div>
        <p className="collections-header__subtitle">
          {pageSubtitle}
        </p>
      </div>

      <div className="row">
        {/* ---- Sidebar Filters (Desktop) ---- */}
        <div className="col-lg-3 mb-4 filter-sidebar-desktop">
          <div className="filter-sidebar p-3">
            <FilterContent />
          </div>
        </div>

        {/* ---- Main Content ---- */}
        <div className="col-lg-9">
          {/* Toolbar */}
          <div className="collections-toolbar">
            <span className="collections-toolbar__count">
              {loading
                ? "Carregando..."
                : `${filteredProducts.length} produto${filteredProducts.length !== 1 ? "s" : ""}`}
            </span>
            <div className="collections-toolbar__right">
              <select
                className="collections-toolbar__sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mais Recentes</option>
                <option value="best-sellers">Mais Vendidos</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name-asc">A - Z</option>
                {isSaleMode && <option value="discount">Maior Desconto</option>}
              </select>
              <button
                className="collections-toolbar__filter-btn"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={16} />
                Filtrar
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="filter-chips">
              {activeCategory !== "Todos" && (
                <button
                  className="filter-chip"
                  onClick={() => setActiveCategory("Todos")}
                >
                  {activeCategory}
                  <span className="filter-chip__x">✕</span>
                </button>
              )}
              {selectedColors.map((color) => (
                <button
                  key={color}
                  className="filter-chip"
                  onClick={() => handleColorChange(color)}
                >
                  {color}
                  <span className="filter-chip__x">✕</span>
                </button>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <button
                  className="filter-chip"
                  onClick={() => setPriceRange([0, maxPrice])}
                >
                  R$ {priceRange[0]} – R$ {priceRange[1]}
                  <span className="filter-chip__x">✕</span>
                </button>
              )}
              <button className="filter-chip filter-chip--clear" onClick={clearAllFilters}>
                Limpar tudo
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: '3rem 1rem',
              background: '#fafafa', borderRadius: '16px',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#f5f5f5', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem', color: '#bbb', fontSize: '1.3rem',
              }}>
                <i className="fas fa-sync-alt"></i>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.75rem' }}>
                Não foi possível carregar os produtos.
              </p>
              <button
                onClick={refetch}
                className="btn btn-dark rounded-pill px-4 py-2 fw-semibold"
                style={{ fontSize: '0.85rem' }}
              >
                <i className="fas fa-redo me-2" style={{ fontSize: '0.75rem' }}></i>
                Tentar novamente
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="collections-empty">
              <div className="collections-empty__icon">
                <Package size={28} />
              </div>
              <p className="collections-empty__text">
                {isSaleMode
                  ? "Nenhum produto em promoção no momento."
                  : "Nenhum produto encontrado com os filtros selecionados."}
              </p>
              {hasActiveFilters && (
                <button
                  className="btn btn-outline-dark btn-sm rounded-pill mt-3 px-4"
                  onClick={clearAllFilters}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-3">
              {filteredProducts.map((product) => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Mobile Filter Offcanvas ---- */}
      <Offcanvas
        show={showFilters}
        onHide={() => setShowFilters(false)}
        placement="start"
        className="filter-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filtros</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FilterContent />
          <button
            className="btn btn-dark w-100 rounded-pill mt-4 py-2 fw-bold"
            onClick={() => setShowFilters(false)}
          >
            Ver {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default Collections;
