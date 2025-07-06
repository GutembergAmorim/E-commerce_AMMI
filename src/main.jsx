import { createBrowserRouter, RouterProvider } from "react-router-dom";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ProductGrid from "./pages/Products/productPage";
import ProductDetails from "./pages/Products/productDetails";
import Cart from "./pages/Cart/cart";
import { CartProvider } from "./Context/CartContext";
import Home from "./pages/Home/Home";
import Collections from "./pages/Collections/Collections";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // O componente App atua como o layout principal
    children: [ // Rotas aninhadas serão renderizadas dentro do <Outlet /> do App
      {
        index: true, // Isso faz com que Home seja a rota filha padrão para "/"
        element: <Home />,
      },
      {
        path: "products", 
        element: <ProductGrid />,
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
        path: "collections", 
        element: <Collections />,
      },
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <CartProvider>
      <RouterProvider router={router} />;      
    </CartProvider>
  </React.StrictMode>
);

