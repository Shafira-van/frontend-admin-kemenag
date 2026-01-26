import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import "../styles/ProfilAdminCRUD.css";
import { API_URL } from "../config";

const ProfilAdminCRUD = () => {
  const [adminList, setAdminList] = useState([]);
  const [filteredAdmin, setFilteredAdmin] = useState([]);

  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
  });

  /* =========================
     Fetch admins
  ========================= */
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        let url = `${API_URL}/profilAdmin?limit=${itemsPerPage}`;
        if (itemsPerPage === 0) url = `${API_URL}/profilAdmin`;

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : data;

        setAdminList(list);
        setFilteredAdmin(list);
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };

    fetchAdmins();
  }, [itemsPerPage]);

  /* =========================
     Search + Filter
  ========================= */
  useEffect(() => {
    let result = [...adminList];

    if (roleFilter) {
      result = result.filter((a) => a.role === roleFilter);
    }

    if (searchTerm.trim() !== "") {
      const kw = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.username.toLowerCase().includes(kw) ||
          a.email.toLowerCase().includes(kw)
      );
    }

    setFilteredAdmin(result);
  }, [searchTerm, roleFilter, adminList]);

  /* =========================
     Validation
  ========================= */
  const validate = () => {
    const v = { username: "", email: "", role: "", password: "" };

    if (!formData.username?.trim()) v.username = "Username wajib diisi.";
    if (!formData.email?.trim()) v.email = "Email wajib diisi.";
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    )
      v.email = "Format email tidak valid.";
    if (!formData.role) v.role = "Role wajib dipilih.";
    if (formData.password && formData.password.length < 6)
      v.password = "Password minimal 6 karakter.";

    setErrors(v);
    return Object.values(v).every((e) => e === "");
  };

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";

      const url = formData.id
        ? `${API_URL}/profilAdmin/${formData.id}`
        : `${API_URL}/profilAdmin`;

      const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        ...(formData.password ? { password: formData.password } : {}),
      };

      if (!formData.id && !formData.password) {
        payload.password = "123456"; // default password
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }

      // refresh list
      const updated = await fetch(`${API_URL}/profilAdmin`, {
        credentials: "include",
      }).then((r) => r.json());

      const list = Array.isArray(updated)
        ? updated
        : Array.isArray(updated.data)
        ? updated.data
        : updated;

      setAdminList(list);
      setFilteredAdmin(list);

      closeModal();
      alert("Admin berhasil disimpan.");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan admin.");
    }
  };

  /* =========================
     Edit / Preview / Delete
  ========================= */
  const handleEdit = (admin) => {
    setFormData({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      password: "",
      role: admin.role,
    });
    setErrors({});
    setModalMode("edit");
  };

  const handlePreview = (admin) => {
    setFormData(admin);
    setModalMode("preview");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus admin ini?")) return;

    try {
      await fetch(`${API_URL}/profilAdmin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setAdminList((p) => p.filter((a) => a.id !== id));
      setFilteredAdmin((p) => p.filter((a) => a.id !== id));
    } catch (err) {
      alert("Gagal menghapus admin");
    }
  };

  const openCreateModal = () => {
    setFormData({
      id: null,
      username: "",
      email: "",
      password: "",
      role: "",
    });
    setErrors({});
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      username: "",
      email: "",
      password: "",
      role: "",
    });
    setErrors({});
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="profiladmin-container">
      <div className="crud-header">
        <h2>Manajemen Admin</h2>
        <button className="btn-add" onClick={openCreateModal}>
          <PlusCircle size={18} /> Tambah Admin
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari username atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-inline">
          <div className="filter-item">
            <label>Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Semua</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Tampilkan</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={0}>Semua</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmin.length ? (
              filteredAdmin.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>{a.username}</td>
                  <td>{a.email}</td>
                  <td>{a.role}</td>
                  <td>
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(a)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(a.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-text">
                  Tidak ada admin ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {/* =======================
                EDIT / CREATE FORM
            ======================= */}
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Admin" : "Tambah Admin"}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-grid">
                    <div>
                      <label>
                        Username <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            username: e.target.value,
                          });
                          if (errors.username)
                            setErrors({ ...errors, username: "" });
                        }}
                        className={errors.username ? "is-invalid" : ""}
                      />
                      {errors.username && (
                        <div className="error-text">{errors.username}</div>
                      )}
                    </div>

                    <div>
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={errors.email ? "is-invalid" : ""}
                      />
                      {errors.email && (
                        <div className="error-text">{errors.email}</div>
                      )}
                    </div>

                    <div>
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder={
                          formData.id
                            ? "Isi untuk ubah password (opsional)"
                            : "Kosongkan untuk default: 123456"
                        }
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className={errors.password ? "is-invalid" : ""}
                      />
                      {errors.password && (
                        <div className="error-text">{errors.password}</div>
                      )}
                    </div>

                    <div>
                      <label>
                        Role <span className="required">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({ ...formData, role: e.target.value });
                          if (errors.role) setErrors({ ...errors, role: "" });
                        }}
                        className={errors.role ? "is-invalid" : ""}>
                        <option value="">-- Pilih Role --</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                      {errors.role && (
                        <div className="error-text">{errors.role}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">
                      Simpan
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={closeModal}>
                      Batal
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* =======================
                  PREVIEW MODE
              ======================= */
              <>
                <h3>Detail Admin</h3>

                <p>
                  <strong>Username:</strong> {formData.username}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Role:</strong> {formData.role}
                </p>
                <p>
                  <strong>Dibuat:</strong>{" "}
                  {formData.created_at
                    ? new Date(formData.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </p>

                <div
                  className="form-actions"
                  style={{ justifyContent: "flex-end" }}>
                  <button className="btn-cancel" onClick={closeModal}>
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilAdminCRUD;
