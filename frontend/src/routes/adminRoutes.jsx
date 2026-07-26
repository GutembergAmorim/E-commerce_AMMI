import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import OrderManagement from "../pages/Admin/OrderManagement";
import OrderDetails from "../pages/Admin/OrderDetails";
import MediaUpload from "../pages/Admin/MediaUpload";
import ProductCreate from "../pages/Admin/ProductCreate";
import ProductEdit from "../pages/Admin/ProductEdit";
import Users from "../pages/Admin/Users";
import CouponManagement from "../pages/Admin/CouponManagement";
import StockManagement from "../pages/Admin/StockManagement";
import StockHistory from "../pages/Admin/StockHistory";
import WholesaleSettings from "../pages/Admin/WholesaleSettings";

const adminRoutes = [
  {
    path: "admin/dashboard",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/orders",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <OrderManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/orders/:id",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <OrderDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/media",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <MediaUpload />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/products/new",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <ProductCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/products/edit/:id",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <ProductEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/users",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/coupons",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <CouponManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/stock",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <StockManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/stock/history/:productId",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <StockHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/wholesale",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <WholesaleSettings />
      </ProtectedRoute>
    ),
  },
];

export default adminRoutes;
