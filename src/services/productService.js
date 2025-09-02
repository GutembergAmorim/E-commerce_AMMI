import api from './api';

export const productService = {
  // Buscar todos os produtos
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.isNew) params.append('isNew', filters.isNew);
      if (filters.isHighlighted) params.append('isHighlighted', filters.isHighlighted);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar produtos' };
    }
  },

  // Buscar produto por ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar produto' };
    }
  },

  // Criar produto (admin)
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar produto' };
    }
  },

  // Atualizar produto (admin)
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar produto' };
    }
  },

  // Deletar produto (admin)
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao deletar produto' };
    }
  },

  // Buscar produtos em destaque
  async getHighlightedProducts() {
    try {
      const response = await api.get('/products?isHighlighted=true'); 
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar produtos em destaque' };
    }
  },

  // Buscar produtos novos
  async getNewProducts() {
    try {
      const response = await api.get('/products?isNew=true');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar produtos novos' };
    }
  },

  // Buscar produtos por categoria
  async getProductsByCategory(category) {
    try {
      const response = await api.get(`/products?category=${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar produtos por categoria' };
    }
  }
};
