import api from './api';

export const uploadService = {
  async uploadImage(file, folder = 'amii/products') {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/upload/image?folder=${encodeURIComponent(folder)}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  async deleteImage(publicId) {
    const response = await api.delete(`/upload/image/${encodeURIComponent(publicId)}`);
    return response.data;
  },
};


