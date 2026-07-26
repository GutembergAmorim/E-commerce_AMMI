import WholesaleConfig from "../models/WholesaleConfig.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Obter configuração do atacado (público)
// @route   GET /api/wholesale/config
// @access  Public
export const getConfig = asyncHandler(async (req, res) => {
  const config = await WholesaleConfig.getConfig();

  res.json({
    success: true,
    data: {
      isActive: config.isActive,
      minQuantity: config.minQuantity,
      discountRates: config.discountRates,
      blockCoupon: config.blockCoupon,
    },
  });
});

// @desc    Obter configuração completa do atacado (admin)
// @route   GET /api/wholesale/admin
// @access  Admin
export const getAdminConfig = asyncHandler(async (req, res) => {
  const config = await WholesaleConfig.getConfig();
  res.json({ success: true, data: config });
});

// @desc    Atualizar configuração do atacado
// @route   PUT /api/wholesale/admin
// @access  Admin
export const updateConfig = asyncHandler(async (req, res) => {
  const { minQuantity, discountRates, isActive, blockCoupon } = req.body;

  const config = await WholesaleConfig.getConfig();

  if (minQuantity !== undefined) config.minQuantity = minQuantity;
  if (isActive !== undefined) config.isActive = isActive;
  if (blockCoupon !== undefined) config.blockCoupon = blockCoupon;

  if (discountRates) {
    if (discountRates.pix !== undefined) config.discountRates.pix = discountRates.pix;
    if (discountRates.debit !== undefined) config.discountRates.debit = discountRates.debit;
    if (discountRates.credit !== undefined) config.discountRates.credit = discountRates.credit;
  }

  await config.save();

  res.json({
    success: true,
    data: config,
    message: "Configuração de atacado atualizada com sucesso",
  });
});
