import Review from "../models/Review.js";
import Order from "../models/Order.js";

// @desc    Criar avaliação
// @route   POST /reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Check if user already reviewed this product
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Você já avaliou este produto",
      });
    }

    // Optional: check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] },
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title: title || "",
      comment: comment || "",
    });

    // Populate user data for response
    await review.populate("user", "name");

    res.status(201).json({
      success: true,
      data: review,
      verified: !!hasPurchased,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Você já avaliou este produto" });
    }
    res.status(500).json({ success: false, message: "Erro ao criar avaliação", error: error.message });
  }
};

// @desc    Buscar avaliações de um produto
// @route   GET /reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({
      success: true,
      data: reviews,
      distribution,
      total: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar avaliações" });
  }
};

// @desc    Deletar avaliação (admin ou próprio usuário)
// @route   DELETE /reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Avaliação não encontrada" });
    }

    // Only admin or the review owner can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Sem permissão" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Avaliação removida" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao deletar avaliação" });
  }
};

// @desc    Listar todas avaliações (admin)
// @route   GET /reviews
// @access  Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar avaliações" });
  }
};

// @desc    Aprovar/reprovar avaliação (admin)
// @route   PUT /reviews/:id/approve
// @access  Admin
export const toggleApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Avaliação não encontrada" });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar avaliação" });
  }
};
