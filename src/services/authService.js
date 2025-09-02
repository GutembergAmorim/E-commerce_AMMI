import api from './api';

// Função auxiliar para lidar com o sucesso da autenticação
const handleAuthSuccess = (response) => {
  if (response.data.success) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('currentUser', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const authService = {
  // Registrar usuário
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return handleAuthSuccess(response);
      
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao registrar usuário' };
    }
  },

  // Login
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return handleAuthSuccess(response);
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Pegar usuário atual
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  // Pegar token
  getToken() {
    return localStorage.getItem('token');
  },

  // Atualizar dados do usuário
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar dados do usuário' };
    }
  }
};
