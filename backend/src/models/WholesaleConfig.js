import mongoose from "mongoose";

const wholesaleConfigSchema = new mongoose.Schema(
  {
    minQuantity: {
      type: Number,
      required: [true, "Quantidade mínima é obrigatória"],
      min: [1, "Quantidade mínima deve ser pelo menos 1"],
      default: 6,
    },
    discountRates: {
      pix: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 20,
      },
      debit: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 20,
      },
      credit: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 20,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Quando atacado está ativo, bloqueia cupons
    blockCoupon: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Singleton: garante que exista apenas uma configuração
wholesaleConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

export default mongoose.model("WholesaleConfig", wholesaleConfigSchema);
