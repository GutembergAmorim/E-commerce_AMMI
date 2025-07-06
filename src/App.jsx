import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import React from "react";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <Header />
        <Outlet />
      <Footer />
    </>
  );
}

export default App;
