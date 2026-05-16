import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import React from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router-dom";
import Breadcrumbs from "./components/Breadcrumbs/Breadcrumbs";
import WelcomeModal from "./components/WelcomeModal/WelcomeModal";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollRestoration />
      <Header />
      <main className={`flex-grow-1 ${!isHome ? "content-spacer" : ""}`}>
        {!isHome && <Breadcrumbs />}
        <Outlet />
      </main>
      <Footer />
      <WelcomeModal />
    </div>
  );
}

export default App;
