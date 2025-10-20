// src/controllers/stockController.js
import Product from '../models/Product.js';
import StockService from '../../../src/services/stockService.js';

// Ajuste manual de estoque
const adjustStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { adjustment, reason } = req.body;

    if (!adjustment || adjustment === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ajuste deve ser diferente de zero'
      });
    }

    const product = await StockService.manualStockAdjustment(
      productId, 
      parseInt(adjustment), 
      reason, 
      req.user.id
    );

    res.json({
      success: true,
      data: product,
      message: `Estoque ajustado em ${adjustment} unidades`
    });

  } catch (error) {
    console.error('Erro no ajuste de estoque:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Produtos com estoque baixo
const getLowStock = async (req, res) => {
  try {
    const products = await StockService.getLowStockProducts();

    res.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('Erro ao buscar estoque baixo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Histórico de estoque do produto
const getStockHistory = async (req, res) => {
    try {
      const { productId } = req.params;
      const { limit = 100, page = 1 } = req.query;
  
      const product = await Product.findById(productId)
        .populate('stockHistory.createdBy', 'name email')
        .populate('stockHistory.order', '_id');
  
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
  
      // Ordenar por data mais recente primeiro
      const history = product.stockHistory
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit);
  
      // Calcular totais
      const totalIn = product.stockHistory
        .filter(h => h.type === 'IN' || h.type === 'RETURN')
        .reduce((sum, h) => sum + h.quantity, 0);
      
      const totalOut = product.stockHistory
        .filter(h => h.type === 'OUT')
        .reduce((sum, h) => sum + h.quantity, 0);
  
      res.json({
        success: true,
        data: {
          product: {
            name: product.name,
            sku: product.sku,
            currentStock: product.stock,
            lowStockAlert: product.lowStockAlert
          },
          history,
          summary: {
            totalMovements: product.stockHistory.length,
            totalIn,
            totalOut,
            netChange: totalIn - totalOut
          }
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: product.stockHistory.length,
          pages: Math.ceil(product.stockHistory.length / limit)
        }
      });
  
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

// Relatório de estoque
const getStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Data inicial e final são obrigatórias'
      });
    }

    const report = await StockService.getStockReport(startDate, endDate);

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export { adjustStock, getLowStock, getStockHistory, getStockReport };