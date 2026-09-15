import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Info,
  Users,
  Menu,
  X,
  Headset,
  MessageSquareText,
  House,
  ShieldUser,
} from "lucide-react";
import "./../styles/AdminSidebar.css";
import { API_URL } from "../config";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [satkerList, setSatkerList] = useState([]);

  const navigate = useNavigate();

  /* ============================================================
     👤 FETCH PROFIL USER
  ============================================================ */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = localStorage.getItem("id");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const res = await fetch(`${API_URL}/profilAdmin/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Gagal fetch profil");
        }

        const responseData = await res.json();

        // Support:
        // 1. response langsung { id, role, id_satker }
        // 2. response { data: { id, role, id_satker } }
        const data = responseData?.data || responseData;

        console.log("Profil Sidebar:", data);

        setCurrentUser(data);
      } catch (err) {
        console.error("Error fetching user sidebar:", err);

        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  /* ============================================================
     🏢 FETCH DATA SATUAN KERJA
     
     Digunakan khusus untuk mengecek apakah
     id_satker Editor benar-benar ada di tabel satuankerja.
  ============================================================ */
  useEffect(() => {
    const fetchSatker = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/satuankerja`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil data satuan kerja");
        }

        const responseData = await res.json();

        // Support beberapa kemungkinan response API
        const data = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        console.log("Data Satuan Kerja Sidebar:", data);

        setSatkerList(data);
      } catch (err) {
        console.error("Error fetching satuan kerja sidebar:", err);

        setSatkerList([]);
      }
    };

    fetchSatker();
  }, []);

  /* ============================================================
     🔐 ROLE USER
  ============================================================ */
  const role = String(currentUser?.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = role === "admin";
  const isSuperadmin = role === "superadmin";
  const isEditor = role === "editor";

  /* ============================================================
     🏢 CEK ID SATKER EDITOR
     
     Editor hanya boleh mendapatkan menu Layanan apabila
     id_satker pada profilAdmin ditemukan di tabel satuankerja.
  ============================================================ */
  const editorSatkerValid =
    isEditor &&
    !!currentUser?.id_satker &&
    satkerList.some((satker) => {
      return (
        String(satker?.id_satker || "")
          .trim()
          .toLowerCase() === String(currentUser.id_satker).trim().toLowerCase()
      );
    });

  console.log("Role:", role);
  console.log("ID Satker User:", currentUser?.id_satker);
  console.log("Editor Satker Valid:", editorSatkerValid);

  // Tutup sidebar otomatis saat klik link
  const handleLinkClick = () => {
    if (window.innerWidth <= 1000) {
      setIsOpen(false);
    }
  };

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("username");

    handleLinkClick();

    navigate("/login");
  };

  /* ============================================================
     📋 KONFIGURASI MENU
  ============================================================ */
  const menuItems = [
    {
      to: "/login/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      roles: ["superadmin", "admin", "editor"],
    },

    {
      to: "/login/berita",
      icon: <FileText size={18} />,
      label: "Berita",
      roles: ["superadmin", "admin", "editor"],
    },

    {
      to: "/login/informasi",
      icon: <Info size={18} />,
      label: "Informasi",
      roles: ["superadmin", "admin", "editor"],
    },

    /* ========================================================
       LAYANAN

       Admin & Superadmin:
       -> selalu boleh melihat

       Editor:
       -> hanya jika id_satker terdaftar di satuankerja
    ======================================================== */
    {
      to: "/login/layanan",
      icon: <Headset size={18} />,
      label: "Layanan",
      roles: ["superadmin", "admin", "editor"],
      requiresEditorSatker: true,
    },

    {
      to: "/login/pengaduan",
      icon: <MessageSquareText size={18} />,
      label: "Pengaduan",
      roles: ["superadmin", "admin"],
    },

    {
      to: "/login/infografis",
      icon: <House size={18} />,
      label: "Infografis",
      roles: ["superadmin", "admin"],
    },

    {
      to: "/login/satuan-kerja",
      icon: <House size={18} />,
      label: "Satuan Kerja",
      roles: ["superadmin"],
    },

    {
      to: "/login/kua",
      icon: <House size={18} />,
      label: "KUA",
      roles: ["superadmin"],
    },

    {
      to: "/login/madrasah",
      icon: <House size={18} />,
      label: "Madrasah",
      roles: ["superadmin"],
    },

    {
      to: "/login/profil-ketua",
      icon: <ShieldUser size={18} />,
      label: "Profil Ketua",
      roles: ["superadmin"],
    },

    {
      to: "/login/admin",
      icon: <Users size={18} />,
      label: "Admin",
      roles: ["superadmin"],
    },
  ];

  /* ============================================================
     🔎 FILTER MENU
  ============================================================ */
  const visibleMenus = role
    ? menuItems.filter((item) => {
        // Role tidak memiliki akses
        if (!item.roles.includes(role)) {
          return false;
        }

        // ======================================================
        // KHUSUS MENU LAYANAN
        // ======================================================
        if (item.requiresEditorSatker && role === "editor") {
          return editorSatkerValid;
        }

        // Admin & Superadmin langsung boleh
        return true;
      })
    : [];

  /* ============================================================
     🎨 RENDER
  ============================================================ */
  return (
    <>
      {/* ======================================================
          Tombol toggle tablet / HP
      ====================================================== */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ======================================================
          Sidebar
      ====================================================== */}
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <ul className="sidebar-menu">
          {visibleMenus.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={handleLinkClick}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* ======================================================
          Overlay
      ====================================================== */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default AdminSidebar;
