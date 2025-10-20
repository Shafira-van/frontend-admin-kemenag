import React from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import "./../styles/LayoutNavbar.css";

const LayoutNavbar = ({ children }) => {
  return (
    <div className="layout-navbar">
      <AdminNavbar />
      <div className="layout-body">
        <AdminSidebar />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default LayoutNavbar;
