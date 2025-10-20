import React, { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./../styles/AdminNavbar.css";

const AdminNavbar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil nama user dari localStorage saat komponen dimount
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Fungsi logout
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token"); // 🧹 hapus token login
      localStorage.removeItem("username"); // 🧹 hapus juga username
      navigate("/login"); // 🔁 arahkan ke halaman login
    }
  };

  // Fungsi menuju halaman profil
  const handleProfile = () => {
    navigate("/login/profil"); // 🔗 ganti dengan route profil kamu
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/82/Seal_of_the_Ministry_of_Religious_Affairs_of_the_Republic_of_Indonesia.svg"
          alt="Logo Kemenag"
          className="navbar-logo"
        />
        <div className="navbar-text">
          <h1>KEMENTERIAN AGAMA</h1>
          <p>Kota Pematangsiantar</p>
        </div>
      </div>

      <div className="navbar-right">
        <User
          className="icon clickable"
          onClick={handleProfile}
          title="Profil"
        />
        <span className="admin-name clickable" onClick={handleProfile}>
          {username || "Admin"}
        </span>
        <LogOut className="icon logout" onClick={handleLogout} title="Keluar" />
      </div>
    </header>
  );
};

export default AdminNavbar;
