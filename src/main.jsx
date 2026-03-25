import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ProductDetails from "./pages/Products/productDetails";
import { CartProvider } from "./Context/CartContext";
import Home from "./pages/Home/Home";
import Collections from "./pages/Collections/Collections";
import { AuthProvider } from "./Context/AuthContext";
import Login from "./pages/Login/Login.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Register from "./pages/Register/Register.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MediaUpload from "./pages/Admin/MediaUpload.jsx";
import ProductCreate from "./pages/Admin/ProductCreate.jsx";
import Users from "./pages/Admin/Users.jsx";
import OrderConfirmation from './pages/Order/OrderConfirmation.jsx';
import OrderStatus from "./pages/Order/OrderStatus.jsx";
import PersonalData from "./pages/profile/PersonalData.jsx";
import UserProfile from "./pages/Customer/UserProfile.jsx";
import OrderHistory from "./pages/profile/OrderHistory.jsx";
import AddressManagement from './pages/profile/AddressManagement.jsx'; // ✅ Corrigido caminho
import ProfileSettings from './pages/profile/ProfileSettings.jsx'; // ✅ Corrigido caminho
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import OrderManagement from './pages/Admin/OrderManagement.jsx'
import OrderDetails from './pages/Admin/OrderDetails.jsx'
import StockManagement from './pages/Admin/StockManagement.jsx'
import StockHistory from './pages/Admin/StockHistory.jsx'
import ProductEdit from './pages/Admin/ProductEdit.jsx'
import CouponManagement from './pages/Admin/CouponManagement.jsx'
import AdminReports from './pages/Admin/AdminReports.jsx'
import ForgotPassword from './pages/Login/ForgotPassword.jsx'
import ResetPassword from './pages/Login/ResetPassword.jsx'
import AboutUs from './pages/Institutional/AboutUs.jsx'
import ExchangePolicy from './pages/Institutional/ExchangePolicy.jsx'
import TermsAndPrivacy from './pages/Institutional/TermsAndPrivacy.jsx'
import PixQrCode from './pages/Payment/PixQrCode.jsx'
import { FavoritesProvider } from "./Context/FavoritesContext";
import Favorites from "./pages/Favorites/Favorites";
import { GoogleOAuthProvider } from "@react-oauth/google";


const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "collections",
        element: <Collections />,
      },
      {
        path: "products/:id",
        element: <ProductDetails />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "sobre",
        element: <AboutUs />,
      },
      {
        path: "trocas",
        element: <ExchangePolicy />,
      },
      {
        path: "termos",
        element: <TermsAndPrivacy />,
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-confirmation/:orderId",
        element: (
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-pending/:orderId",
        element: (
          <ProtectedRoute>
            <OrderStatus />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-status/:orderId",
        element: (
          <ProtectedRoute>
            <OrderStatus />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/pix/:chargeId",
        element: (
          <ProtectedRoute>
            <PixQrCode />
          </ProtectedRoute>
        ),
      },
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
            <OrderDetails /> // Você vai criar este componente
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
        path: "favorites",
        element: <Favorites />,
      }
    ],
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <PersonalData />
      },
      {
        path: "orders", 
        element: <OrderHistory />
      },
      {
        path: "addresses",
        element: <AddressManagement />
      },
      {
        path: "settings",
        element: <ProfileSettings />
      }
    ]
  }
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <RouterProvider router={router} />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);