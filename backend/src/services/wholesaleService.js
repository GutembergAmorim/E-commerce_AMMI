import WholesaleConfig from "../models/WholesaleConfig.js";

/**
 * Calcula o desconto atacado baseado na configuração do banco.
 *
 * @param {Array} cartItems - Itens do carrinho com { price, quantity }
 * @param {string} paymentMethod - "pix" | "debit" | "credit"
 * @returns {Object} { eligible, rate, discountAmount, totalQuantity, minQuantity, config }
 */
export async function calculateWholesaleDiscount(cartItems, paymentMethod) {
  const config = await WholesaleConfig.getConfig();

  // Se o atacado está desativado, retorna sem desconto
  if (!config.isActive) {
    return {
      eligible: false,
      rate: 0,
      discountAmount: 0,
      totalQuantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
      minQuantity: config.minQuantity,
      blockCoupon: false,
    };
  }

  const totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  if (totalQuantity < config.minQuantity) {
    return {
      eligible: false,
      rate: 0,
      discountAmount: 0,
      totalQuantity,
      minQuantity: config.minQuantity,
      blockCoupon: false,
    };
  }

  // Mapear método de pagamento para a taxa correta
  const rateMap = {
    pix: config.discountRates.pix,
    debit: config.discountRates.debit,
    credit: config.discountRates.credit,
    credit_card: config.discountRates.credit,
  };

  const ratePercent = rateMap[paymentMethod] || config.discountRates.credit;
  const rate = ratePercent / 100;

  // Desconto sobre itemsPrice (preço dos produtos, já com promoção)
  const itemsPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Number((itemsPrice * rate).toFixed(2));

  return {
    eligible: true,
    rate: ratePercent,
    discountAmount,
    totalQuantity,
    minQuantity: config.minQuantity,
    blockCoupon: config.blockCoupon,
  };
}

/**
 * Retorna a configuração pública do atacado (sem dados sensíveis).
 */
export async function getPublicWholesaleConfig() {
  const config = await WholesaleConfig.getConfig();
  return {
    isActive: config.isActive,
    minQuantity: config.minQuantity,
    discountRates: config.discountRates,
    blockCoupon: config.blockCoupon,
  };
}
