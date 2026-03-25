import Coupon from "../models/Coupon.js";

// @desc    Validar e aplicar cupom
// @route   POST /coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Código do cupom é obrigatório" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Cupom não encontrado" });
    }

    const validation = coupon.isValid(orderTotal || 0);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const discount = coupon.calculateDiscount(orderTotal || 0);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        description: coupon.description,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao validar cupom", error: error.message });
  }
};

// @desc    Incrementar uso do cupom (chamado ao finalizar compra)
// @route   POST /coupons/use
// @access  Private
export const useCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao registrar uso do cupom" });
  }
};

// ── Admin Endpoints ──

// @desc    Listar todos os cupons
// @route   GET /coupons
// @access  Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar cupons" });
  }
};

// @desc    Criar cupom
// @route   POST /coupons
// @access  Admin
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Já existe um cupom com este código" });
    }
    res.status(500).json({ success: false, message: "Erro ao criar cupom", error: error.message });
  }
};

// @desc    Atualizar cupom
// @route   PUT /coupons/:id
// @access  Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Cupom não encontrado" });
    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar cupom", error: error.message });
  }
};

// @desc    Deletar cupom
// @route   DELETE /coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Cupom não encontrado" });
    res.json({ success: true, message: "Cupom removido" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao deletar cupom" });
  }
};
