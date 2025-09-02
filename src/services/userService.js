import api from './api';

export const userService = {
  async list() {
    const response = await api.get('/users');
    return response.data;
  },
  async get(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  async setRole(id, role) {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  async setStatus(id, isActive) {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};


