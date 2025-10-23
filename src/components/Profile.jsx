import React, { useState, useEffect } from "react";
import "../styles/Profile.css";
import { Edit, KeyRound } from "lucide-react";
import { API_URL} from "../config";

// const API_URL = "http://localhost:3000/api/profilAdmin";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "edit" | "password"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Ambil username dari localStorage dan fetch data lengkap
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;

    fetch(`${API_URL}/profilAdmin?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Kalau API /profilAdmin?username=... return array
          setProfile(data[0]);
          setFormData({
            username: data[0].username,
            email: data[0].email,
            role: data[0].role,
          });
        } else {
          // Kalau API langsung return objek
          setProfile(data);
          setFormData({
            username: data.username,
            email: data.email,
            role: data.role,
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  // ✅ Update profil admin
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profile?.id) return alert("Data admin tidak ditemukan.");

    try {
      const res = await fetch(`${API_URL}/profilAdmin/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const updated = await res.json();
      if (res.ok) {
        setProfile(updated);
        alert("Profil berhasil diperbarui!");
        setModalMode(null);
      } else {
        alert(updated.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Terjadi kesalahan saat memperbarui profil.");
    }
  };

  // ✅ Ubah password admin
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/profilAdmin/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: passwordData.newPassword,
        }),
      });

      if (res.ok) {
        alert("Password berhasil diubah!");
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setModalMode(null);
      } else {
        const error = await res.json();
        alert(error.message || "Gagal mengubah password.");
      }
    } catch (err) {
      console.error("Password update error:", err);
      alert("Terjadi kesalahan saat mengubah password.");
    }
  };

  if (!profile) return <p className="loading">Memuat data profil admin...</p>;

  return (
    <div className="profile-crud-container">
      <div className="crud-header">
        <h2>Profil Saya</h2>
        <div className="header-actions">
          <button className="btn-edit" onClick={() => setModalMode("edit")}>
            <Edit size={18} /> Edit Profil
          </button>
          <button
            className="btn-password"
            onClick={() => setModalMode("password")}>
            <KeyRound size={18} /> Ubah Password
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="profile-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Username</td>
              <td>{profile.username}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{profile.email}</td>
            </tr>
            <tr>
              <td>Role</td>
              <td>{profile.role}</td>
            </tr>
            <tr>
              <td>Dibuat Pada</td>
              <td>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleString("id-ID")
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal Edit Profil */}
      {modalMode === "edit" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profil</h3>
            <form onSubmit={handleUpdateProfile}>
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />

              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="editor">Editor</option>
              </select>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Simpan
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setModalMode(null)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Password */}
      {modalMode === "password" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ubah Password</h3>
            <form onSubmit={handleChangePassword}>
              <label>Password Baru</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
              />

              <label>Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Simpan Password
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setModalMode(null)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
