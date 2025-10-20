import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import PengaduanCRUD from "../components/PengaduanCRUD";
import Footer from "../components/Footer";

const Pengaduan = () => {
  return (
    <LayoutNavbar>
      <PengaduanCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default Pengaduan;
