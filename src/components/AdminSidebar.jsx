import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import './../styles/AdminSidebar.css';
import { API_URL } from '../config';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  /* ============================================================
     👤 Fetch profil user dari localStorage id + token
  ============================================================ */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      if (!userId || !token) return;

      try {
        const res = await fetch(`${API_URL}/profilAdmin/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Gagal fetch profil');
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching user sidebar:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const role = currentUser?.role;

  // Tutup sidebar otomatis saat klik link (di HP/tablet)
  const handleLinkClick = () => {
    if (window.innerWidth <= 1000) setIsOpen(false);
  };

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    handleLinkClick();
    navigate('/login');
  };

  /* ============================================================
     🔐 Konfigurasi menu berdasarkan role
     - superadmin : semua menu
     - admin      : dashboard, berita, informasi, layanan, pengaduan, infografis, profil ketua
     - editor     : dashboard, berita
  ============================================================ */
  const menuItems = [
    {
      to: '/login/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
      roles: ['superadmin', 'admin', 'editor'],
    },
    {
      to: '/login/berita',
      icon: <FileText size={18} />,
      label: 'Berita',
      roles: ['superadmin', 'admin', 'editor'],
    },
    {
      to: '/login/informasi',
      icon: <Info size={18} />,
      label: 'Informasi',
      roles: ['superadmin'],
    },
    {
      to: '/login/layanan',
      icon: <Headset size={18} />,
      label: 'Layanan',
      roles: ['superadmin'],
    },
    {
      to: '/login/pengaduan',
      icon: <MessageSquareText size={18} />,
      label: 'Pengaduan',
      roles: ['superadmin'],
    },
    {
      to: '/login/infografis',
      icon: <House size={18} />,
      label: 'Infografis',
      roles: ['superadmin'],
    },
    {
      to: '/login/satuan-kerja',
      icon: <House size={18} />,
      label: 'Satuan Kerja',
      roles: ['superadmin'],
    },
    {
      to: '/login/kua',
      icon: <House size={18} />,
      label: 'KUA',
      roles: ['superadmin'],
    },
    {
      to: '/login/profil-ketua',
      icon: <ShieldUser size={18} />,
      label: 'Profil Ketua',
      roles: ['superadmin'],
    },
    {
      to: '/login/admin',
      icon: <Users size={18} />,
      label: 'Admin',
      roles: ['superadmin'],
    },
  ];

  // Filter menu sesuai role, tampilkan semua saat user belum di-fetch
  const visibleMenus = role
    ? menuItems.filter((item) => item.roles.includes(role))
    : [];

  return (
    <>
      {/* Tombol toggle di tablet/HP */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Info user yang login */}
        {/* {currentUser && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {currentUser.username?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-detail">
              <span className="sidebar-user-name">{currentUser.username}</span>
              <span className="sidebar-user-role">{currentUser.role}</span>
            </div>
          </div>
        )} */}

        <ul className="sidebar-menu">
          {visibleMenus.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={handleLinkClick}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          {/* Tombol logout selalu tampil */}
          {/* <li>
            <button
              className="logout-btn"
              onClick={handleLogout}>
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </li> */}
        </ul>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
