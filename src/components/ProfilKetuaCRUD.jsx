import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import "../styles/ProfilKetuaCRUD.css";

const API_URL = "http://localhost:3000/api/profilketua";

const ProfilKetuaCRUD = () => {
  const [profilList, setProfilList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    year: "",
  });

  // Fetch data profil ketua
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProfilList(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  // Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `${API_URL}/${formData.id}` : API_URL;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const updated = await fetch(API_URL).then((res) => res.json());
    setProfilList(updated);
    closeModal();
  };

  // Edit
  const handleEdit = (profil) => {
    setFormData(profil);
    setModalMode("edit");
  };

  // Preview
  const handlePreview = (profil) => {
    setFormData(profil);
    setModalMode("preview");
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ketua ini?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setProfilList(profilList.filter((p) => p.id !== id));
    }
  };

  // Close modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({ id: null, name: "", year: "" });
  };

  return (
    <div className="profilketua-container">
      <div className="crud-header">
        <h2>Manajemen Profil Ketua</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Ketua
        </button>
      </div>

      <div className="table-wrapper">
        <table className="profilketua-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Ketua</th>
              <th>Tahun Jabatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {profilList.map((profil, index) => (
              <tr key={profil.id}>
                <td>{index + 1}</td>
                <td>{profil.name}</td>
                <td>{profil.year}</td>
                <td className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handlePreview(profil)}>
                    <Eye size={16} />
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(profil)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(profil.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Ketua" : "Tambah Ketua"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div>
                      <label>Nama Ketua</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label>Tahun Jabatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: 2023 - 2025"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        required
                      />
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
                <h3>Detail Profil Ketua</h3>
                <p>
                  <strong>Nama Ketua:</strong> {formData.name}
                </p>
                <p>
                  <strong>Tahun Jabatan:</strong> {formData.year}
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

export default ProfilKetuaCRUD;
