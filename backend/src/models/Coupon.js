import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Código do cupom é obrigatório"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Valor do desconto é obrigatório"],
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: null, // null = ilimitado
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null, // null = sem expiração
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    // ── Conditional coupon fields ──
    condition: {
      type: String,
      enum: ["none", "first_purchase", "max_uses_per_user"],
      default: "none",
    },
    maxUsesPerUser: {
      type: Number,
      default: 1, // Usado quando condition === "max_uses_per_user"
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 1 },
        lastUsedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Virtual: verifica se o cupom está válido
couponSchema.methods.isValid = function (orderTotal) {
  if (!this.isActive) return { valid: false, message: "Cupom desativado" };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, message: "Cupom expirado" };
  if (this.maxUses && this.usedCount >= this.maxUses) return { valid: false, message: "Cupom esgotado" };
  if (orderTotal < this.minOrderValue) return { valid: false, message: `Pedido mínimo de R$ ${this.minOrderValue.toFixed(2)}` };
  return { valid: true };
};

// Calcula o desconto
couponSchema.methods.calculateDiscount = function (orderTotal) {
  if (this.discountType === "percentage") {
    return Math.min((orderTotal * this.discountValue) / 100, orderTotal);
  }
  return Math.min(this.discountValue, orderTotal);
};

export default mongoose.model("Coupon", couponSchema);
