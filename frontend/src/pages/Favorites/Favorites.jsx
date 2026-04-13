import React from "react";
import { useFavorites } from "../../Context/FavoritesContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import { Link } from "react-router-dom";

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="container py-5">
      <h2 className="text-center font-brand mb-4">Meus Favoritos</h2>
      
      {favorites.length === 0 ? (
        <div className="text-center my-5">
          <i className="far fa-heart fa-3x mb-3 text-muted"></i>
          <p className="text-muted">Você ainda não tem favoritos.</p>
          <Link to="/collections" className="btn btn-custom-primary rounded-pill px-4">
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((product) => (
            <div key={product._id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
