import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name image');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Pedido não encontrado'
    });
  }

  // Verificar se o usuário tem permissão
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('orderItems.product', 'name image')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
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
});

const updateOrderStatus = asyncHandler(async (req, res) => {
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
});

export { getOrderById, getUserOrders, getAllOrders, updateOrderStatus };