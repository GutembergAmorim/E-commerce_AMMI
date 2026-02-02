import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Breadcrumbs from "./components/Breadcrumbs/Breadcrumbs";
import { FavoritesProvider } from "./Context/FavoritesContext";
import Favorites from "./pages/Favorites/Favorites";
import { Routes, Route } from "react-router-dom";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <FavoritesProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className={`flex-grow-1 ${!isHome ? "content-spacer" : ""}`}>
          {!isHome && <Breadcrumbs />}
          <Routes>
            <Route path="/" element={<Outlet />} /> {/* Mantém a estrutura existente */}
            <Route path="/favorites" element={<Favorites />} />
            {/* Outras rotas seriam renderizadas aqui pelo Outlet se estivessem definidas no App, 
                mas como o App usa Outlet, assumo que as rotas estão definidas no index.js ou main.jsx. 
                Vou verificar o main.jsx para garantir a estrutura de rotas correta. */}
             <Route path="*" element={<Outlet />} />
          </Routes>
          <Outlet />
        </main>
        <Footer />
      </div>
    </FavoritesProvider>
  );
}

export default App;
