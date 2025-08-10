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
import Customer from "./pages/Customer/Customer.jsx";

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
    path: "/",
    element: <App />, // O componente App atua como o layout principal
    children: [
      // Rotas aninhadas serão renderizadas dentro do <Outlet /> do App
      {
        index: true, // Isso faz com que Home seja a rota filha padrão para "/"
        element: <Home />,
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
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "collections",
        element: <Collections />,
      },
      {
        path: "customer",
        element: <Customer />,
      },
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
