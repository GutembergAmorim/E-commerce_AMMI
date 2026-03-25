import Product from "../models/Product.js";

// @desc    Buscar todos os produtos
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, isNew, isHighlighted, search, sort, sale, limit } = req.query;

    // Construir filtros
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (isNew === "true") {
      filter.isNew = true;
    }

    if (isHighlighted === "true") {
      filter.isHighlighted = true;
    }

    if (sale === "true") {
      filter.oldPrice = { $exists: true, $gt: 0 };
      filter.$expr = { $gt: ["$oldPrice", "$price"] };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Determinar ordenação
    let sortOption = { createdAt: -1 };
    if (sort === "best-sellers") {
      sortOption = { totalSold: -1, createdAt: -1 };
    }

    let query = Product.find(filter).sort(sortOption);

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query;

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos",
      error: error.message,
    });
  }
};

// @desc    Buscar produto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produto",
      error: error.message,
    });
  }
};

// @desc    Criar produto
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    console.log('Body recebido na criação de produto:', req.body);
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao criar produto",
      error: error.message,
    });
  }
};

// @desc    Atualizar produto
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar produto",
      error: error.message,
    });
  }
};

// @desc    Deletar produto
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Produto removido com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao deletar produto",
      error: error.message,
    });
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
