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
      enum: ["Top", "Short", "Legging", "Macaquinho"],
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    // stock: {
    //   type: Number,
    //   required: [true, "Estoque é obrigatório"],
    //   min: [0, "Estoque não pode ser negativo"],
    //   default: 0,
    // },
    // status: {
    //   type: String,
    //   enum: ["", "Em Estoque", "Baixo Estoque", "Esgotado"],
    //   default: "",
    // },
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
    // Controle de Estoque
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockAlert: {
    type: Number,
    default: 5
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Variações (cores, tamanhos)
  variations: [{
    color: String,
    size: String,
    stock: {
      type: Number,
      default: 0
    },
    sku: String,
    price: Number // Preço específico para variação
  }],
  
  // Histórico de Estoque
  stockHistory: [{
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUST', 'RETURN'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: Number,
    newStock: Number,
    reason: String,
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Métricas
  totalSold: {
    type: Number,
    default: 0
  },
  lastRestock: Date,
  
  // Configurações
  trackStock: {
    type: Boolean,
    default: true
  },
  allowBackorder: {
    type: Boolean,
    default: false
  }
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
