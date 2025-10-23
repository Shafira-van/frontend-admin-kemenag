import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import "../styles/NewsCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const InfografisCRUD = () => {
  const [infografisList, setInfografisList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    desc: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // 🔹 Fetch semua infografis
  useEffect(() => {
    fetch(`${API_URL}/infografis`)
      .then((res) => res.json())
      .then((data) => setInfografisList(data))
      .catch((err) => console.error("Error fetching infografis:", err));
  }, []);

  // 🔹 Handle submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${API_URL}/infografis/${formData.id}`
      : `${API_URL}/infografis`;

    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => body.append(key, val));

    await fetch(url, { method, body });

    const updated = await fetch(`${API_URL}/infografis`).then((res) =>
      res.json()
    );
    setInfografisList(updated);
    closeModal();
  };

  // 🔹 Edit
  const handleEdit = (item) => {
    setFormData(item);
    setImagePreview(
      item.image ? `${API_UPLOADS}/uploads/infografis/${item.image}` : null
    );
    setModalMode("edit");
  };

  // 🔹 Preview
  const handlePreview = (item) => {
    setFormData(item);
    setImagePreview(
      item.image ? `${API_UPLOADS}/uploads/infografis/${item.image}` : null
    );
    setModalMode("preview");
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (window.confirm("Hapus infografis ini?")) {
      await fetch(`${API_URL}/infografis/${id}`, { method: "DELETE" });
      setInfografisList(infografisList.filter((n) => n.id !== id));
    }
  };

  // 🔹 Tutup modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({ id: null, desc: "", image: "" });
    setImagePreview(null);
  };

  return (
    <div className="news-crud-container">
      <div className="crud-header">
        <h2>Manajemen Infografis</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Infografis
        </button>
      </div>

      {/* 🔹 Tabel Data */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Gambar</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {infografisList.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  {item.image && (
                    <img
                      src={`${API_UPLOADS}/uploads/infografis/${item.image}`}
                      alt="Infografis"
                      style={{ width: "100px", borderRadius: "8px" }}
                    />
                  )}
                </td>
                <td>{item.desc}</td>
                <td className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handlePreview(item)}>
                    <Eye size={16} />
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(item)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Modal Edit & Preview */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-medium">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Infografis" : "Tambah Infografis"}</h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>Deskripsi</label>
                    <textarea
                      rows="3"
                      value={formData.desc}
                      onChange={(e) =>
                        setFormData({ ...formData, desc: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Gambar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, image: file });
                        setImagePreview(URL.createObjectURL(file));
                      }}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="preview-img"
                      />
                    )}
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
                <h3>Pratinjau Infografis</h3>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Infografis"
                    className="preview-img"
                  />
                )}
                <p>{formData.desc}</p>
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

export default InfografisCRUD;
