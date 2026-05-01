import Order from '../models/Order.js';

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [GET ORDER] Buscando pedido ID:', id);
    console.log('👤 [GET ORDER] Usuário autenticado:', req.user.id);
    
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    if (!order) {
      console.log('❌ [GET ORDER] Pedido não encontrado no banco');
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    console.log('✅ [GET ORDER] Pedido encontrado:', order._id);
    console.log('👤 [GET ORDER] Dono do pedido:', order.user._id.toString());
    console.log('🔐 [GET ORDER] Usuário solicitante:', req.user.id);

    // Verificar se o usuário tem permissão
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('🚫 [GET ORDER] Acesso negado - pedido pertence a outro usuário');
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('💥 [GET ORDER] Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    console.log('📋 [GET USER ORDERS] Usuário:', req.user.id);
    
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 });

    console.log('✅ [GET USER ORDERS] Pedidos encontrados:', orders.length);
    
    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('💥 [GET USER ORDERS] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    order.status = status;
    
    // Atualizar isPaid automaticamente baseado no status
    const paidStatuses = ['Pago', 'Preparando', 'Enviado', 'Entregue'];
    if (paidStatuses.includes(status)) {
      order.isPaid = true;
      if (!order.paidAt) {
        order.paidAt = new Date();
      }
    } else if (status === 'Pendente' || status === 'Cancelado') {
      order.isPaid = false;
      order.paidAt = undefined;
    }

    // Se o status for "Enviado", pode adicionar data de envio
    if (status === 'Enviado') {
      order.shippedAt = new Date();
    }
    
    // Se o status for "Entregue", pode adicionar data de entrega
    if (status === 'Entregue') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Status do pedido atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export { getOrderById, getUserOrders, getAllOrders, updateOrderStatus };