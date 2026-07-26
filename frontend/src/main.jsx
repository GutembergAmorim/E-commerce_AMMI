import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";
import { FavoritesProvider } from "./Context/FavoritesContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Pages
import Home from "./pages/Home/Home";
import Collections from "./pages/Collections/Collections";
import ProductDetails from "./pages/Products/productDetails";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import OrderConfirmation from "./pages/Order/OrderConfirmation.jsx";
import OrderStatus from "./pages/Order/OrderStatus.jsx";
import Favorites from "./pages/Favorites/Favorites";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import ForgotPassword from "./pages/Login/ForgotPassword.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import AboutUs from "./pages/Institutional/AboutUs.jsx";
import ExchangePolicy from "./pages/Institutional/ExchangePolicy.jsx";
import TermsAndPrivacy from "./pages/Institutional/TermsAndPrivacy.jsx";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Route modules
import adminRoutes from "./routes/adminRoutes";
import profileRoutes from "./routes/profileRoutes";

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
      { index: true, element: <Home /> },
      { path: "collections", element: <Collections /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "cart", element: <Cart /> },
      { path: "sobre", element: <AboutUs /> },
      { path: "trocas", element: <ExchangePolicy /> },
      { path: "termos", element: <TermsAndPrivacy /> },
      { path: "favorites", element: <Favorites /> },
      {
        path: "checkout",
        element: <ProtectedRoute><Checkout /></ProtectedRoute>,
      },
      {
        path: "order-confirmation/:orderId",
        element: <ProtectedRoute><OrderConfirmation /></ProtectedRoute>,
      },
      {
        path: "order-pending/:orderId",
        element: <ProtectedRoute><OrderStatus /></ProtectedRoute>,
      },
      {
        path: "order-status/:orderId",
        element: <ProtectedRoute><OrderStatus /></ProtectedRoute>,
      },
      // Admin routes
      ...adminRoutes,
    ],
  },
  // Profile routes
  profileRoutes,
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);