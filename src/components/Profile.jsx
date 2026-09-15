import React, { useState, useEffect } from "react";

import "../styles/Profile.css";

import { Edit, KeyRound } from "lucide-react";

import { API_URL } from "../config";

import Swal from "sweetalert2";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const [modalMode, setModalMode] = useState(null);
  // "edit" | "password"

  const [loading, setLoading] = useState(false);

  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState({
    username: "",
    nip: "",
    email: "",
  });

  // ============================================================
  // PASSWORD DATA
  // ============================================================

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ============================================================
  // ERRORS
  // ============================================================

  const [errors, setErrors] = useState({
    username: "",
    nip: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ============================================================
  // FETCH PROFIL USER
  // ============================================================

  useEffect(() => {
    const fetchProfile = async () => {
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

        // Support response langsung maupun { data: ... }
        const data = responseData?.data || responseData;

        setProfile(data);

        setFormData({
          username: data.username || "",
          nip: data.nip || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // ============================================================
  // VALIDASI EDIT PROFIL
  // ============================================================

  const validateProfile = () => {
    const newErrors = {
      username: "",
      nip: "",
      email: "",
    };

    // Username
    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi.";
    }

    // NIP WAJIB
    if (!formData.nip.trim()) {
      newErrors.nip = "NIP wajib diisi.";
    } else if (formData.nip.trim().length > 30) {
      newErrors.nip = "NIP maksimal 30 karakter.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Format email tidak valid.";
    }

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));

    return Object.values(newErrors).every((msg) => msg === "");
  };

  // ============================================================
  // VALIDASI PASSWORD
  // ============================================================

  const validatePassword = () => {
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Password baru wajib diisi.";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password minimal 6 karakter.";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));

    return Object.values(newErrors).every((msg) => msg === "");
  };

  // ============================================================
  // UPDATE PROFIL
  // Username + NIP + Email
  // ============================================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    const userId = localStorage.getItem("id");

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/profilAdmin/${userId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        credentials: "include",

        body: JSON.stringify({
          username: formData.username.trim(),

          // NIP
          nip: formData.nip.trim(),

          email: formData.email.trim(),

          // Tetap kirim role
          role: profile.role,

          // Tetap kirim satker
          id_satker: profile.id_satker,

          // Kosong = password tidak diubah
          password: "",
        }),
      });

      const updated = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: updated.message || "Gagal memperbarui profil.",
          showConfirmButton: false,
          timer: 1500,
        });

        return;
      }

      // ========================================================
      // UPDATE STATE PROFILE
      // ========================================================

      setProfile((prev) => ({
        ...prev,

        username: formData.username.trim(),

        nip: formData.nip.trim(),

        email: formData.email.trim(),
      }));

      // ========================================================
      // TUTUP MODAL
      // ========================================================

      setModalMode(null);

      Swal.fire({
        icon: "success",
        title: "Profil berhasil diperbarui!",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Update error:", err);

      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan saat memperbarui profil.",
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UBAH PASSWORD
  // ============================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    const userId = localStorage.getItem("id");

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/profilAdmin/${userId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        credentials: "include",

        body: JSON.stringify({
          username: profile.username,

          // NIP tetap dikirim
          nip: profile.nip,

          email: profile.email,

          role: profile.role,

          id_satker: profile.id_satker,

          password: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const error = await res.json();

        Swal.fire({
          icon: "error",
          title: error.message || "Gagal mengubah password.",
          showConfirmButton: false,
          timer: 1500,
        });

        return;
      }

      // ========================================================
      // RESET PASSWORD FORM
      // ========================================================

      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });

      setErrors((prev) => ({
        ...prev,

        newPassword: "",
        confirmPassword: "",
      }));

      setModalMode(null);

      Swal.fire({
        icon: "success",
        title: "Password berhasil diubah!",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Password update error:", err);

      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan saat mengubah password.",
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // TUTUP MODAL
  // ============================================================

  const closeModal = () => {
    setModalMode(null);

    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });

    setErrors({
      username: "",
      nip: "",
      email: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Reset formData ke data profile
    if (profile) {
      setFormData({
        username: profile.username || "",

        nip: profile.nip || "",

        email: profile.email || "",
      });
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!profile) {
    return <p className="loading">Memuat data profil...</p>;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="profile-crud-container">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="crud-header">
        <h2>Profil Saya</h2>

        <div className="header-actions">
          {/* EDIT PROFIL */}
          <button className="btn-edit" onClick={() => setModalMode("edit")}>
            <Edit size={18} />
            Edit Profil
          </button>

          {/* UBAH PASSWORD */}
          <button
            className="btn-password"
            onClick={() => setModalMode("password")}>
            <KeyRound size={18} />
            Ubah Password
          </button>
        </div>
      </div>

      {/* ======================================================
          TABEL PROFIL
      ====================================================== */}

      <div className="table-wrapper">
        <table className="profile-table">
          <tbody>
            {/* USERNAME */}
            <tr>
              <td>Username</td>

              <td>{profile.username || "-"}</td>
            </tr>

            {/* NIP */}
            <tr>
              <td>NIP</td>

              <td>{profile.nip || "-"}</td>
            </tr>

            {/* EMAIL */}
            <tr>
              <td>Email</td>

              <td>{profile.email || "-"}</td>
            </tr>

            {/* ROLE */}
            <tr>
              <td>Role</td>

              <td
                style={{
                  textTransform: "capitalize",
                }}>
                {profile.role || "-"}
              </td>
            </tr>

            {/* SATUAN KERJA */}
            <tr>
              <td>Satuan Kerja</td>

              <td>{profile.nama_satker || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ======================================================
          MODAL EDIT PROFIL
      ====================================================== */}

      {modalMode === "edit" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profil</h3>

            <form onSubmit={handleUpdateProfile} noValidate>
              {/* USERNAME */}
              <div>
                <label>
                  Username
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({
                      ...formData,

                      username: e.target.value,
                    });

                    if (errors.username) {
                      setErrors({
                        ...errors,
                        username: "",
                      });
                    }
                  }}
                  required
                  aria-invalid={!!errors.username}
                  className={errors.username ? "is-invalid" : ""}
                />

                {errors.username && (
                  <div className="error-text">{errors.username}</div>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label>
                  Email
                  <span className="required">*</span>
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({
                      ...formData,

                      email: e.target.value,
                    });

                    if (errors.email) {
                      setErrors({
                        ...errors,
                        email: "",
                      });
                    }
                  }}
                  required
                  aria-invalid={!!errors.email}
                  className={errors.email ? "is-invalid" : ""}
                />

                {errors.email && (
                  <div className="error-text">{errors.email}</div>
                )}
              </div>

              {/* NIP */}
              <label>NIP</label>

              <input
                type="text"
                value={profile.nip || ""}
                disabled
                className="input-locked"
                style={{
                  textTransform: "capitalize",
                }}
              />

              {/* ROLE READONLY */}
              <div>
                <label>Role</label>

                <input
                  type="text"
                  value={profile.role || ""}
                  disabled
                  className="input-locked"
                  style={{
                    textTransform: "capitalize",
                  }}
                />
              </div>

              {/* SATKER READONLY */}
              <div>
                <label>Satuan Kerja</label>

                <input
                  type="text"
                  value={profile.nama_satker || "-"}
                  disabled
                  className="input-locked"
                />
              </div>

              {/* BUTTON */}
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL UBAH PASSWORD
      ====================================================== */}

      {modalMode === "password" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ubah Password</h3>

            <form onSubmit={handleChangePassword} noValidate>
              {/* PASSWORD BARU */}
              <div>
                <label>
                  Password Baru
                  <span className="required">*</span>
                </label>

                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({
                      ...passwordData,

                      newPassword: e.target.value,
                    });

                    if (errors.newPassword) {
                      setErrors({
                        ...errors,
                        newPassword: "",
                      });
                    }
                  }}
                  required
                  aria-invalid={!!errors.newPassword}
                  className={errors.newPassword ? "is-invalid" : ""}
                  placeholder="Minimal 6 karakter"
                />

                {errors.newPassword && (
                  <div className="error-text">{errors.newPassword}</div>
                )}
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div>
                <label>
                  Konfirmasi Password Baru
                  <span className="required">*</span>
                </label>

                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({
                      ...passwordData,

                      confirmPassword: e.target.value,
                    });

                    if (errors.confirmPassword) {
                      setErrors({
                        ...errors,
                        confirmPassword: "",
                      });
                    }
                  }}
                  required
                  aria-invalid={!!errors.confirmPassword}
                  className={errors.confirmPassword ? "is-invalid" : ""}
                  placeholder="Ulangi password baru"
                />

                {errors.confirmPassword && (
                  <div className="error-text">{errors.confirmPassword}</div>
                )}
              </div>

              {/* BUTTON */}
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Password"}
                </button>

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}>
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
