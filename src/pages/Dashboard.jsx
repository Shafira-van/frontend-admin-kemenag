import React from "react";
import LayoutNavbar from "../layouts/LayoutNavbar";
import DashboardLayout from "../components/Dashboard";
import Footer from "../components/Footer";

const Dashboard = () => {
  return (
    <LayoutNavbar>
      <DashboardLayout />
      <Footer/>
    </LayoutNavbar>
  );
};

export default Dashboard;
