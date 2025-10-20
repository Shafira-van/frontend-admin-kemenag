import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import KuaCRUD from "../components/KuaCRUD";
import Footer from "../components/Footer";

const Kua = () => {
  return (
    <LayoutNavbar>
      <KuaCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default Kua;
