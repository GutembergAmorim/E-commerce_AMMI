import api from './api';

/**
 * Calcula as opções de frete para um CEP e lista de produtos.
 * @param {string} cep - CEP de destino (8 dígitos)
 * @param {Array} products - Lista de produtos [{ id, quantity, weight? }]
 * @returns {Promise<{success: boolean, options: Array}>}
 */
export async function calculateShipping(cep, products) {
  const response = await api.post('/shipping/calculate', { cep, products });
  return response.data;
}
