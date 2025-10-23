import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import "../styles/InformasiCRUD.css";
import { format, parseISO } from "date-fns";
import { API_URL, API_UPLOADS } from "../config";

const InformasiCRUD = () => {
  const [informasiList, setInformasiList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    date: "",
    file: "",
  });
  const [filePreview, setFilePreview] = useState(null);
  // Fetch data informasi
  useEffect(() => {
    fetch(`${API_URL}/informasi`)
      .then((res) => res.json())
      .then((data) => setInformasiList(data))
      .catch((err) => console.error("Error fetching informasi:", err));
  }, []);

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${API_URL}/informasi/${formData.id}`
      : `${API_URL}/informasi`;

    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => body.append(key, val));

    await fetch(url, { method, body });
    const updated = await fetch(`${API_URL}/informasi`).then((res) =>
      res.json()
    );
    setInformasiList(updated);

    closeModal();
  };

  // Edit informasi
  const handleEdit = (info) => {
    const dateValue = info.date
      ? format(parseISO(info.date), "yyyy-MM-dd")
      : "";
    setFormData({ ...info, date: dateValue });
    setFilePreview(info.file_path ? `${API_UPLOADS}/${info.file_path}` : null);
    setModalMode("edit");
  };

  // Preview informasi
  const handlePreview = (info) => {
    setFormData(info);
    if (info.file_path && typeof info.file_path === "string") {
      setFilePreview(`${API_UPLOADS}/${info.file_path}`);
    } else if (info.file_path instanceof File) {
      setFilePreview(URL.createObjectURL(info.file_path));
    } else {
      setFilePreview(null);
    }

    setModalMode("preview");
  };

  // Hapus informasi
  const handleDelete = async (id) => {
    if (window.confirm("Hapus data informasi ini?")) {
      await fetch(`${API_URL}/informasi/${id}`, { method: "DELETE" });
      setInformasiList(informasiList.filter((n) => n.id !== id));
    }
  };

  // Tutup modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      title: "",
      date: "",
      file: "",
    });
    setFilePreview(null);
  };

  return (
    <div className="informasi-crud-container">
      <div className="crud-header">
        <h2>Manajemen Informasi</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Informasi
        </button>
      </div>

      <div className="table-wrapper">
        <table className="informasi-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Tanggal</th>
              <th>File</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {informasiList.map((info, index) => (
              <tr key={info.id}>
                <td>{index + 1}</td>
                <td>{info.title}</td>
                <td>
                  {info.date
                    ? new Date(info.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td>
                  {info.file_path ? (
                    <a
                      href={`${API_UPLOADS}/${info.file_path}`}
                      target="_blank"
                      rel="noreferrer">
                      Lihat File
                    </a>
                  ) : (
                    "Tidak ada"
                  )}
                </td>
                <td className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handlePreview(info)}>
                    <Eye size={16} />
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(info)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(info.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal untuk edit & preview */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Informasi" : "Tambah Informasi"}</h3>
                <form onSubmit={handleSubmit}>
                  <div>
                      <label>Judul Informasi</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                  </div>
                  <div className="form-grid">
                    <div>
                      <label>Tanggal</label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label>File</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFormData({ ...formData, file: file });
                          setFilePreview(URL.createObjectURL(file));
                        }}
                      />
                      {filePreview && (
                        <iframe
                          src={filePreview}
                          title="File Preview"
                          className="preview-file"
                        />
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
              <>
                <h3>{formData.title}</h3>
                <p>
                  <strong>Tanggal:</strong>{" "}
                  {formData.date
                    ? new Date(formData.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
                {filePreview && (
                  <iframe
                    src={filePreview}
                    title="Preview File"
                    className="preview-file"
                  />
                )}
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

export default InformasiCRUD;
