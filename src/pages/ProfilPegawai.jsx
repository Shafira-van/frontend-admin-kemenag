import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import ProfilPegawaiCRUD from "../components/ProfilPegawaiCRUD.jsx";
import Footer from "../components/Footer";

const ProfilPegawai = () => {
  return (
    <LayoutNavbar>
      <ProfilPegawaiCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default ProfilPegawai;
