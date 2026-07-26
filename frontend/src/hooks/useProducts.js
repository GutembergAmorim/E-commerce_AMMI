import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
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
      setError(err.message || "Erro ao buscar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};

export const useHighlightedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHighlightedProducts = useCallback(async () => {
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
      setError(err.message || "Erro ao buscar produtos em destaque");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighlightedProducts();
  }, [fetchHighlightedProducts]);

  return { products, loading, error, refetch: fetchHighlightedProducts };
};

export const useBestSellers = (limit = 8) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBestSellers = useCallback(async () => {
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
  }, [limit]);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  return { products, loading, error, refetch: fetchBestSellers };
};

