import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import LayananCRUD from "../components/LayananCRUD";
import Footer from "../components/Footer";

const Layanan= () => {
  return (
    <LayoutNavbar>
      <LayananCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default Layanan;
