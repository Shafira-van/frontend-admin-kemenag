import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import NewsCRUD from "../components/NewsCRUD";
import Footer from "../components/Footer";

const News = () => {
  return (
    <LayoutNavbar>
      <NewsCRUD />
      <Footer />
    </LayoutNavbar>
  );
};

export default News;
