import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import Footer from "../components/Footer";
import InfografisCRUD from "../components/InfografisCRUD";

const Infografis = () => {
  return (
    <LayoutNavbar>
      <InfografisCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default Infografis;
