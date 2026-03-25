import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc    Dashboard analytics overview
// @route   GET /api/analytics/dashboard
// @access  Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ── Total Revenue (all time paid orders) ──
    const revenueAll = await Order.aggregate([
      { $match: { status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);

    // ── This Month Revenue ──
    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);

    // ── Last Month Revenue (for comparison) ──
    const revenueLastMonth = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);

    // ── Daily revenue for the last 30 days ──
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── Revenue by category (from order items) ──
    const categoryRevenue = await Order.aggregate([
      { $match: { status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$productInfo.category",
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ── Top Selling Products ──
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ["Pago", "Preparando", "Enviado", "Entregue"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$product.name",
          image: { $arrayElemAt: ["$product.images", 0] },
          category: "$product.category",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // ── Orders by status ──
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── Total users, new users this month ──
    const totalUsers = await User.countDocuments({ role: "customer" });
    const newUsersThisMonth = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfMonth },
    });

    // ── Calculate metrics ──
    const totalRevenue = revenueAll[0]?.total || 0;
    const totalOrders = revenueAll[0]?.count || 0;
    const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const thisMonthTotal = revenueThisMonth[0]?.total || 0;
    const lastMonthTotal = revenueLastMonth[0]?.total || 0;
    const revenueGrowth =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0
        ? 100
        : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders,
          ticketMedio: Math.round(ticketMedio * 100) / 100,
          thisMonthRevenue: thisMonthTotal,
          thisMonthOrders: revenueThisMonth[0]?.count || 0,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          totalUsers,
          newUsersThisMonth,
        },
        dailyRevenue,
        categoryRevenue,
        topProducts,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("Erro analytics:", error);
    res.status(500).json({ success: false, message: "Erro ao gerar relatórios" });
  }
};
