import axios from 'axios';


// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30s para acomodar cold start do Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Retry interceptor para GET requests ──
// Tenta novamente até 2x com backoff exponencial quando falhar por timeout/network
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Só retry em GETs, e só para erros de rede/timeout (não para 4xx/5xx)
    const isRetryable =
      config &&
      config.method === 'get' &&
      !config.__retryCount &&
      (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK');

    if (isRetryable) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = 2;

      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 2000; // 2s, 4s

        console.log(`🔄 Retry ${config.__retryCount}/${maxRetries} em ${delay / 1000}s: ${config.url}`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Tratar 401 (token expirado)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
