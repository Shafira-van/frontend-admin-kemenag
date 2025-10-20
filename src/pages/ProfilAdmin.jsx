import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import ProfilAdminCRUD from "../components/ProfilAdminCRUD";
import Footer from "../components/Footer";

const ProfilAdmin = () => {
  return (
    <LayoutNavbar>
      <ProfilAdminCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default ProfilAdmin;
