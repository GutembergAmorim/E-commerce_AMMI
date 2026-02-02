import React from "react";
import "./CategoryGrid.css";

const CategoryGrid = ({ categories, selectedCategory, onSelectCategory }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="category-grid-section">
      <div className="container">
        <h2 className="category-grid-title story-script-regular section-title-separator">CATEGORIAS</h2>
        
        <div className="row g-4">
          <div className="col-12 text-center">
             {/* <button 
                className={`btn btn-outline-dark rounded-pill px-4 ${!selectedCategory ? 'active' : ''}`}
                onClick={() => onSelectCategory(null)}
             >
                Ver Todas
             </button> */}
          </div>
           
          {categories.map((category) => (
            <div key={category._id} className="col-6 col-md-4 col-lg-3">
              <div 
                className={`category-card ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => onSelectCategory(category._id === selectedCategory ? null : category._id)}
              >
                <div className="category-card-content">
                    <h3 className="category-card-title">{category.name}</h3>
                    <div className="category-card-image-wrapper">
                        <img 
                            src={category.image || "https://via.placeholder.com/300x200?text=Category"} 
                            alt={category.name} 
                            className="category-card-image"
                        />
                    </div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
