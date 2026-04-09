// /backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      number: {
        type: String,
        required: true,
      },
      complement: {
        type: String,
      },
      neighborhood: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
        maxlength: 2,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "Brasil",
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "PIX", "CREDIT_CARD", "DEBIT_CARD",
        "Cartão de Crédito", "Cartão de Débito",
        "INFINITEPAY", "Boleto", "Não definido"
      ],
    },
    infinitePayCheckoutUrl: String,
    infinitePayTransactionNsu: String,
    installments: {
      type: Number,
      default: 1,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    total: {
      type: Number,
      required: true,
      default: 0.0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pendente", "Processando", "Pago", "Preparando", "Enviado", "Entregue", "Cancelado"],
      default: "Pendente",
    },
    stockUpdated: {
      type: Boolean,
      default: false,
    },
    pixDiscount: {
      type: Number,
      default: 0,
    },
    pixDiscountApplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);