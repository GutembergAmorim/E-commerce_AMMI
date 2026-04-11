import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

// @desc    Validar e aplicar cupom
// @route   POST /coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal, userId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Código do cupom é obrigatório" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Cupom não encontrado" });
    }

    // Validações básicas (ativo, expirado, esgotado, pedido mínimo)
    const validation = coupon.isValid(orderTotal || 0);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    // ── Validações condicionais ──
    if (coupon.condition && coupon.condition !== "none") {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Você precisa estar logado para usar este cupom",
        });
      }

      if (coupon.condition === "first_purchase") {
        // Verificar se o usuário já fez alguma compra (exceto canceladas)
        const orderCount = await Order.countDocuments({
          user: userId,
          status: { $nin: ["Cancelado"] },
        });

        if (orderCount > 0) {
          return res.status(400).json({
            success: false,
            message: "Este cupom é válido apenas para a primeira compra",
          });
        }
      }

      if (coupon.condition === "max_uses_per_user") {
        // Verificar quantas vezes este usuário já usou o cupom
        const userUsage = coupon.usedBy.find(
          (entry) => entry.user.toString() === userId.toString()
        );

        if (userUsage && userUsage.count >= coupon.maxUsesPerUser) {
          return res.status(400).json({
            success: false,
            message: `Você já utilizou este cupom ${coupon.maxUsesPerUser === 1 ? "" : coupon.maxUsesPerUser + " vezes"}`.trim(),
          });
        }
      }
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
        condition: coupon.condition,
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
    const userId = req.user?._id; // vem do middleware protect

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (coupon) {
      coupon.usedCount += 1;

      // Rastrear uso por usuário
      if (userId) {
        const existingEntry = coupon.usedBy.find(
          (entry) => entry.user.toString() === userId.toString()
        );

        if (existingEntry) {
          existingEntry.count += 1;
          existingEntry.lastUsedAt = new Date();
        } else {
          coupon.usedBy.push({
            user: userId,
            count: 1,
            lastUsedAt: new Date(),
          });
        }
      }

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
