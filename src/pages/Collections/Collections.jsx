import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/ProductCard/ProductCard";

function Collections() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);

  const { products: fetchProducts, loading, error } = useProducts();

  // Extract unique categories
  const categories = useMemo(
    () => ["Todos", ...new Set(fetchProducts.map((p) => p.category))],
    [fetchProducts]
  );

  // Extract unique colors
  const colors = useMemo(() => {
    const allColors = fetchProducts.flatMap((p) => 
      Array.isArray(p.colors) ? p.colors.map(c => c.name) : []
    );
    return [...new Set(allColors)];
  }, [fetchProducts]);

  // Determine max price from products for slider upper bound
  useEffect(() => {
    if (fetchProducts.length > 0) {
      const max = Math.max(...fetchProducts.map(p => p.price));
      setMaxPrice(Math.ceil(max));
      setPriceRange([0, Math.ceil(max)]);
    }
  }, [fetchProducts]);

  const filteredProducts = useMemo(
    () =>
      fetchProducts.filter((product) => {
        // Category Filter
        const categoryMatch = activeCategory === "Todos" || product.category.toLowerCase() === activeCategory.toLowerCase();
        
        // Price Filter
        const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

        // Color Filter
        const colorMatch = selectedColors.length === 0 || (product.colors && product.colors.some(c => selectedColors.includes(c.name)));

        return categoryMatch && priceMatch && colorMatch;
      }),
    [activeCategory, priceRange, selectedColors, fetchProducts]
  );

  const handleColorChange = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handlePriceChange = (e, index) => {
    const value = Number(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold font-pacifico">Nossa Coleção</h1>
        <p className="lead text-muted">
          Explore nossos produtos e encontre o look perfeito para seu treino.
        </p>
      </div>
      
      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-lg-3 mb-4">
          <div className="filter-sidebar p-3 bg-light rounded shadow-sm">
            <h4 className="mb-3">Filtros</h4>
            
            {/* Category Filter */}
            <div className="mb-4">
              <h5 className="h6 fw-bold">Categorias</h5>
              <div className="d-flex flex-column gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`btn btn-sm text-start ${
                      activeCategory === category ? "btn-secondary" : "btn-outline-secondary border-0"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter (Placeholder for Slider) */}
            <div className="mb-4">
              <h5 className="h6 fw-bold">Preço</h5>
              <div className="price-slider-container">
                 <div className="d-flex justify-content-between small text-muted mb-2">
                   <span>R$ {priceRange[0]}</span>
                   <span>R$ {priceRange[1]}</span>
                 </div>
                 {/* Dual Slider Implementation will go here in CSS/JS */}
                 <div className="position-relative" style={{ height: '30px', display: 'flex', alignItems: 'center' }}>
                    {/* Background Track */}
                    <div className="slider-track"></div>
                    {/* Active Track Range */}
                    <div 
                      className="slider-track-active"
                      style={{
                        left: `${(priceRange[0] / maxPrice) * 100}%`,
                        right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                      }}
                    ></div>

                    <input 
                      type="range" 
                      min="0" 
                      max={maxPrice} 
                      value={priceRange[0]} 
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                        handlePriceChange({ target: { value: val } }, 0);
                      }}
                      className="form-range position-absolute w-100 m-0 p-0"
                      style={{ zIndex: priceRange[0] > maxPrice / 2 ? 2 : 1, height: '4px' }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max={maxPrice} 
                      value={priceRange[1]} 
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                        handlePriceChange({ target: { value: val } }, 1);
                      }}
                      className="form-range position-absolute w-100 m-0 p-0"
                      style={{ zIndex: 1, height: '4px' }}
                    />
                 </div>
              </div>
            </div>

            {/* Color Filter */}
            <div className="mb-4">
              <h5 className="h6 fw-bold">Cores</h5>
              <div className="d-flex flex-column gap-2">
                {colors.map((color) => (
                  <div className="form-check" key={color}>
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onChange={() => handleColorChange(color)}
                    />
                    <label className="form-check-label" htmlFor={`color-${color}`}>
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        <div className="col-lg-9">
          <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredProducts.map((product) => (
              <div className="col" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-12 text-center py-5">
                <p className="text-muted">Nenhum produto encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
           
    </div>
  );
}

export default Collections;
