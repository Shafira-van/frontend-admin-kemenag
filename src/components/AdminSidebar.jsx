import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Info,
  Users,
  Menu,
  X,
  LogOut,
  Headset,
  MessageSquareText,
  House,
  ShieldUser,
} from "lucide-react";
import "./../styles/AdminSidebar.css";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Tutup sidebar otomatis saat klik link (di HP/tablet)
  const handleLinkClick = () => {
    if (window.innerWidth <= 1000) setIsOpen(false);
  };

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // 🧹 hapus token login
    handleLinkClick(); // tutup sidebar (kalau di HP)
    navigate("/login"); // 🔁 arahkan ke halaman login
  };

  return (
    <>
      {/* Tombol toggle di tablet/HP */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/login/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/berita"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <FileText size={18} />
              <span>Berita</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/informasi"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <Info size={18} />
              <span>Informasi</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/layanan"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <Headset size={18} />
              <span>Layanan</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/pengaduan"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <MessageSquareText size={18} />
              <span>Pengaduan</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/infografis"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <House size={18} />
              <span>Infografis</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/satuan-kerja"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <House size={18} />
              <span>Satuan Kerja</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/kua"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <House size={18} />
              <span>Kua</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/profil-ketua"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <ShieldUser size={18} />
              <span>Profil Ketua</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}>
              <Users size={18} />
              <span>Admin</span>
            </NavLink>
          </li>
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
};

export default AdminSidebar;
