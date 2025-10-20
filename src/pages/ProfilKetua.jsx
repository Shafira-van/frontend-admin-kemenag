import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import ProfilKetuaCRUD from "../components/ProfilKetuaCRUD";
import Footer from "../components/Footer";

const ProfilKetua = () => {
  return (
    <LayoutNavbar>
      <ProfilKetuaCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default ProfilKetua;
