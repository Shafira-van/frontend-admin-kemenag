import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import InformasiCRUD from "../components/InformasiCRUD";
import Footer from "../components/Footer";

const Informasi = () => {
  return (
    <LayoutNavbar>
      <InformasiCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default Informasi;
