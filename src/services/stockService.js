// src/services/stockService.js
import Product from '../../backend/src/models/Product.js';

class StockService {
  // Atualizar estoque quando um pedido é criado/pago
  static async updateStockOnOrder(order, type = 'OUT') {
    try {
      console.log(`📦 Atualizando estoque para pedido ${order._id}, tipo: ${type}`);
      
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          console.error(`❌ Produto não encontrado: ${item.product}`);
          continue;
        }

        if (!product.trackStock) continue;

        const previousStock = product.stock;
        let newStock;

        if (type === 'OUT') {
          newStock = previousStock - item.quantity;
          if (newStock < 0 && !product.allowBackorder) {
            throw new Error(`Estoque insuficiente para ${product.name}`);
          }
        } else if (type === 'RETURN') {
          newStock = previousStock + item.quantity;
        }

        // Atualizar estoque principal
        product.stock = Math.max(0, newStock);
        product.totalSold += type === 'OUT' ? item.quantity : 0;

        // Adicionar ao histórico
        product.stockHistory.push({
          type,
          quantity: item.quantity,
          previousStock,
          newStock: product.stock,
          reason: `Pedido ${order._id}`,
          order: order._id,
          createdBy: order.user
        });

        await product.save();
        
        console.log(`✅ Estoque atualizado: ${product.name} - ${previousStock} → ${product.stock}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar estoque:', error);
      throw error;
    }
  }

  // Ajuste manual de estoque
  static async manualStockAdjustment(productId, adjustment, reason, userId) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      const previousStock = product.stock;
      const newStock = previousStock + adjustment;

      if (newStock < 0) {
        throw new Error('Estoque não pode ser negativo');
      }

      product.stock = newStock;

      product.stockHistory.push({
        type: adjustment > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(adjustment),
        previousStock,
        newStock,
        reason,
        createdBy: userId
      });

      if (adjustment > 0) {
        product.lastRestock = new Date();
      }

      await product.save();

      console.log(`✅ Ajuste de estoque: ${product.name} - ${previousStock} → ${newStock}`);
      
      return product;
    } catch (error) {
      console.error('❌ Erro no ajuste de estoque:', error);
      throw error;
    }
  }

  // Verificar produtos com estoque baixo
  static async getLowStockProducts() {
    try {
      const products = await Product.find({
        trackStock: true,
        $expr: { $lte: ['$stock', '$lowStockAlert'] }
      }).select('name stock lowStockAlert sku variations');

      return products;
    } catch (error) {
      console.error('❌ Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }

  // Relatório de movimentação de estoque
  static async getStockReport(startDate, endDate) {
    try {
      const products = await Product.find({
        'stockHistory.createdAt': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).populate('stockHistory.createdBy', 'name');

      const report = products.map(product => ({
        product: product.name,
        sku: product.sku,
        currentStock: product.stock,
        movements: product.stockHistory
          .filter(history => 
            history.createdAt >= new Date(startDate) && 
            history.createdAt <= new Date(endDate)
          )
          .map(history => ({
            date: history.createdAt,
            type: history.type,
            quantity: history.quantity,
            reason: history.reason,
            user: history.createdBy?.name || 'Sistema'
          }))
      }));

      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }
}

export default StockService;