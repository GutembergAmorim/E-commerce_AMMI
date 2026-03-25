import { useState, useEffect } from "react";
import { productService } from "../services/productService";

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProducts(filters);
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.message || "Erro ao buscar produtos");
        }
      } catch (err) {
        setError(err.message || "Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProductById(id);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message || "Produto não encontrado");
        }
      } catch (err) {
        setError(err.message || "Erro ao buscar produto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};

export const useHighlightedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productService.getHighlightedProducts();
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.message || "Erro ao buscar produtos em destaque");
        }
      } catch (err) {
        console.log("err", err);
        setError(err.message || "Erro ao buscar produtos em destaque");
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedProducts();
  }, []);

  return { products, loading, error };
};

export const useBestSellers = (limit = 8) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getBestSellers(limit);
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.message || "Erro ao buscar mais vendidos");
        }
      } catch (err) {
        setError(err.message || "Erro ao buscar mais vendidos");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [limit]);

  return { products, loading, error };
};
