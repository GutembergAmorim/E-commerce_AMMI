import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";

// ── Helper: retry com backoff ──
const fetchWithRetry = async (fetchFn, maxRetries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn();
      return response;
    } catch (err) {
      lastError = err;

      // Não retry se for erro 4xx (ex: 404)
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }

      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 2000; // 2s, 4s
        console.log(`🔄 Hook retry ${attempt + 1}/${maxRetries} em ${delay / 1000}s`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithRetry(() => productService.getProducts(filters));
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
      const response = await fetchWithRetry(() => productService.getProductById(id));
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
      const response = await fetchWithRetry(() => productService.getHighlightedProducts());
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
      const response = await fetchWithRetry(() => productService.getBestSellers(limit));
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
