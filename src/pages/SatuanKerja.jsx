import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import SatuanKerjaCRUD from "../components/SatuanKerjaCRUD";
import Footer from "../components/Footer";

const SatuanKerja = () => {
  return (
    <LayoutNavbar>
      <SatuanKerjaCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default SatuanKerja;
