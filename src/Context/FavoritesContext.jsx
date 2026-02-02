import React, { createContext, useState, useContext, useEffect } from "react";

const FavoritesContext = createContext();

const getInitialFavorites = () => {
  try {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch (error) {
    console.error("Failed to load favorites from localStorage", error);
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(getInitialFavorites);

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  }, [favorites]);

  const addFavorite = (product) => {
    setFavorites((prev) => {
      if (!prev.find((item) => item._id === product._id)) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const removeFavorite = (productId) => {
    setFavorites((prev) => prev.filter((item) => item._id !== productId));
  };

  const isFavorite = (productId) => {
    return favorites.some((item) => item._id === productId);
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product._id)) {
      removeFavorite(product._id);
    } else {
      addFavorite(product);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  return useContext(FavoritesContext);
};
