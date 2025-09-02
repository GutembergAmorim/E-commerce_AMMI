import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  colorCode: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome do produto é obrigatório"],
      trim: true,
      maxlength: [100, "Nome não pode ter mais de 100 caracteres"],
    },
    description: {
      type: String,
      required: [true, "Descrição é obrigatória"],
      maxlength: [500, "Descrição não pode ter mais de 500 caracteres"],
    },
    price: {
      type: Number,
      required: [true, "Preço é obrigatório"],
      min: [0, "Preço não pode ser negativo"],
    },
    oldPrice: {
      type: Number,
      min: [0, "Preço antigo não pode ser negativo"],
    },
    images: [
      {
        type: String,
        required: [true, "Pelo menos uma imagem é obrigatória"],
      },
    ],
    colors: [colorSchema],
    sizes: [
      {
        type: String,
        required: [true, "Pelo menos um tamanho é obrigatório"],
      },
    ],
    category: {
      type: String,
      required: [true, "Categoria é obrigatória"],
      enum: ["Top", "Short", "Legging", "Conjunto"],
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: [true, "Estoque é obrigatório"],
      min: [0, "Estoque não pode ser negativo"],
      default: 0,
    },
    status: {
      type: String,
      enum: ["", "Em Estoque", "Baixo Estoque", "Esgotado"],
      default: "",
    },
    statusColor: {
      type: String,
      default: "bg-custom-pink",
    },
    statusTextColor: {
      type: String,
      default: "text-white",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhor performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isHighlighted: 1 });
productSchema.index({ isNew: 1 });

export default mongoose.model("Product", productSchema);
