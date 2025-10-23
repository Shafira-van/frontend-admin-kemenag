import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import "../styles/ProfilAdminCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

// const API_URL = "http://localhost:3000/api/profilAdmin"; // Ganti sesuai endpoint kamu

const ProfilAdminCRUD = () => {
  const [adminList, setAdminList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
    role: "",
    created_at: "",
  });

  // Fetch data admin dari API
  useEffect(() => {
    fetch(`${API_URL}/profilAdmin`)
      .then((res) => res.json())
      .then((data) => setAdminList(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  // Handle create / update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${API_URL}/profilAdmin/${formData.id}`
      : `${API_URL}/profilAdmin`;

    // Jika tambah admin baru, gunakan password default
    const payload = {
      ...formData,
      password: formData.id ? formData.password : "123456",
    };

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const updated = await fetch(`${API_URL}/profilAdmin`).then((res) =>
      res.json()
    );
    setAdminList(updated);
    closeModal();
  };

  // Edit admin
  const handleEdit = (admin) => {
    setFormData({
      ...admin,
      password: "",
    });
    setModalMode("edit");
  };

  // Preview admin
  const handlePreview = (admin) => {
    setFormData(admin);
    setModalMode("preview");
  };

  // Hapus admin
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus admin ini?")) {
      await fetch(`${API_URL}/profilAdmin/${id}`, { method: "DELETE" });
      setAdminList(adminList.filter((a) => a.id !== id));
    }
  };

  // Tutup modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      username: "",
      email: "",
      password: "",
      role: "",
      created_at: "",
    });
  };

  return (
    <div className="profiladmin-container">
      <div className="crud-header">
        <h2>Manajemen Admin</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Admin
        </button>
      </div>

      <div className="table-wrapper">
        <table className="profiladmin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {adminList.length > 0 ? (
              adminList.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handlePreview(admin)}>
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(admin)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(admin.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}>
                  Belum ada data admin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Admin" : "Tambah Admin"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div>
                      <label>Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    {formData.id && (
                      <div>
                        <label>Password (opsional)</label>
                        <input
                          type="password"
                          placeholder="Isi untuk ubah password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    <div>
                      <label>Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        required>
                        <option value="">-- Pilih Role --</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
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
                    ? new Date(formData.created_at).toLocaleString("id-ID")
                    : "-"}
                </p>
                <button className="btn-cancel" onClick={closeModal}>
                  Tutup
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilAdminCRUD;
