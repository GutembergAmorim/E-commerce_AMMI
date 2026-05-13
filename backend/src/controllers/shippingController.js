import { calculateShipping } from '../services/shippingService.js';

// POST /api/shipping/calculate
// Body: { cep: "01001000", products: [{ id, quantity, weight? }] }
// Público — cotação de frete não requer autenticação
export const calculateShippingController = async (req, res) => {
  try {
    const { cep, products } = req.body;

    if (!cep) {
      return res.status(400).json({
        success: false,
        message: 'CEP é obrigatório.',
      });
    }

    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'CEP inválido. Deve conter 8 dígitos.',
      });
    }

    // Products é opcional — se não vier, usa defaults
    const productList = Array.isArray(products) && products.length > 0
      ? products
      : [{ id: 'default', quantity: 1, weight: 0.3 }];

    const result = await calculateShipping(cleanCep, productList);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('❌ Erro no controller de shipping:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao calcular frete.',
    });
  }
};
