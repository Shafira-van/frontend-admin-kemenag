import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import Footer from "../components/Footer";
import SekolahCRUD from "../components/SekolahCRUD";

const Kua = () => {
  return (
    <LayoutNavbar>
      <SekolahCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default Kua;
