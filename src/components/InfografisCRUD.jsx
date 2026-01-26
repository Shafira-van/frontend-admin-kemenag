import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import "../styles/InfografisCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const InfografisCRUD = () => {
  const [infografisList, setInfografisList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"

  // Filter bar
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form
  const [formData, setFormData] = useState({
    id: null,
    desc: "",
    image: "", // File
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Errors
  const [errors, setErrors] = useState({
    desc: "",
    image: "",
  });

  /* ============================================================
     📡 Fetch data
  ============================================================ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          itemsPerPage && Number(itemsPerPage) > 0
            ? `${API_URL}/infografis?limit=${itemsPerPage}`
            : `${API_URL}/infografis`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        setInfografisList(list);
        setFilteredList(list);
      } catch (e) {
        console.error("Error fetching infografis:", e);
      }
    };
    fetchData();
  }, [itemsPerPage]);

  /* ============================================================
     🔍 Filter: search
  ============================================================ */
  useEffect(() => {
    let result = [...infografisList];
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) =>
        (item.desc || "").toLowerCase().includes(q)
      );
    }
    setFilteredList(result);
  }, [searchTerm, infografisList]);

  /* ============================================================
     ✅ Validasi
  ============================================================ */
  const validate = () => {
    const newErr = { desc: "", image: "" };

    if (!formData.desc || !formData.desc.trim()) {
      newErr.desc = "Deskripsi wajib diisi.";
    }

    const isCreate = !formData.id;
    const hasExistingImage = !!imagePreview; // dari server / dari preview saat edit
    const hasNewFile = formData.image instanceof File;

    // Wajib unggah saat create, atau saat edit tapi belum ada gambar lama
    if (
      (isCreate && !hasNewFile) ||
      (!isCreate && !hasExistingImage && !hasNewFile)
    ) {
      newErr.image = "Gambar wajib diunggah (JPG/PNG/WebP maksimal 2MB).";
    }

    // Jika user pilih file baru ⇒ cek tipe & ukuran MAKSIMAL 2MB
    if (hasNewFile) {
      const f = formData.image;
      const isAllowed =
        f.type === "image/jpeg" ||
        f.type === "image/png" ||
        f.type === "image/webp" ||
        /\.(jpe?g|png|webp)$/i.test(f.name);
      const isMax2Mb = f.size <= 2 * 1024 * 1024;
      if (!isAllowed || !isMax2Mb) {
        newErr.image = "Format harus JPG/PNG/WebP dan ukuran maksimal 2MB.";
      }
    }

    setErrors(newErr);
    return Object.values(newErr).every((m) => m === "");
  };

  /* ============================================================
     🖼️ OnChange Gambar: tipe + ukuran maksimal 2MB + preview
  ============================================================ */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAllowed =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      /\.(jpe?g|png|webp)$/i.test(file.name);
    const isMax2Mb = file.size <= 2 * 1024 * 1024;

    if (!isAllowed || !isMax2Mb) {
      setErrors((prev) => ({
        ...prev,
        image: "Format harus JPG/PNG/WebP dan ukuran maksimal 2MB.",
      }));
      setFormData((prev) => ({ ...prev, image: "" }));
      setImagePreview(null);
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  /* ============================================================
     📝 Submit
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/infografis/${formData.id}`
        : `${API_URL}/infografis`;

      const body = new FormData();
      body.append("desc", formData.desc || "");
      if (formData.image instanceof File) body.append("image", formData.image);

      const res = await fetch(url, { method, body, credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${await res.text()}`);

      // Refresh list
      const updated = await fetch(
        itemsPerPage && Number(itemsPerPage) > 0
          ? `${API_URL}/infografis?limit=${itemsPerPage}`
          : `${API_URL}/infografis`,
        { credentials: "include" }
      ).then((r) => r.json());

      const list = Array.isArray(updated?.data) ? updated.data : updated;
      setInfografisList(list);
      setFilteredList(list);
      closeModal();
      alert("✅ Infografis berhasil disimpan!");
    } catch (err) {
      console.error("❌ Error submit infografis:", err);
      alert("Gagal menyimpan infografis. Cek console/log backend.");
    }
  };

  /* ============================================================
     ✏️ Edit / Preview / Delete
  ============================================================ */
  const handleEdit = (item) => {
    setFormData({
      id: item.id ?? null,
      desc: item.desc ?? "",
      image: "", // jika tak ganti, backend tetap pakai image lama
    });
    setImagePreview(
      item.image ? `${API_UPLOADS}/uploads/infografis/${item.image}` : null
    );
    setErrors({ desc: "", image: "" });
    setModalMode("edit");
  };

  const handlePreview = (item) => {
    setFormData({
      id: item.id ?? null,
      desc: item.desc ?? "",
      image: "",
    });
    setImagePreview(
      item.image ? `${API_UPLOADS}/uploads/infografis/${item.image}` : null
    );
    setModalMode("preview");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus infografis ini?")) return;
    await fetch(`${API_URL}/infografis/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setInfografisList((prev) => prev.filter((n) => n.id !== id));
    setFilteredList((prev) => prev.filter((n) => n.id !== id));
  };

  /* ============================================================
     ❌ Tutup modal
  ============================================================ */
  const closeModal = () => {
    setModalMode(null);
    setFormData({ id: null, desc: "", image: "" });
    setImagePreview(null);
    setErrors({ desc: "", image: "" });
  };

  /* ============================================================
     🧩 Render
  ============================================================ */
  return (
    <div className="infografis-crud-container">
      {/* Header */}
      <div className="crud-header">
        <h2>Manajemen Infografis</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Infografis
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari deskripsi infografis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-inline">
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
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="infografis-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Gambar</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  {item.image ? (
                    <img
                      src={`${API_UPLOADS}/uploads/infografis/${item.image}`}
                      alt="Infografis"
                      style={{
                        width: "3rem",
                        height: "4rem",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{item.desc}</td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handlePreview(item)}>
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(item)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredList.length === 0 && (
          <p className="empty-text">Tidak ada infografis ditemukan.</p>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content  modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Infografis" : "Tambah Infografis"}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="addInfografis">
                    <label>
                      Deskripsi<span className="required">*</span>
                    </label>
                    <textarea
                      rows="3"
                      value={formData.desc}
                      onChange={(e) => {
                        setFormData({ ...formData, desc: e.target.value });
                        if (errors.desc) setErrors({ ...errors, desc: "" });
                      }}
                      required
                      aria-invalid={!!errors.desc}
                      className={errors.desc ? "is-invalid" : ""}
                    />
                    {errors.desc && (
                      <div className="error-text">{errors.desc}</div>
                    )}
                  </div>

                  <div>
                    <label>
                      Gambar<span className="required">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      aria-invalid={!!errors.image}
                      className={errors.image ? "is-invalid" : ""}
                    />
                    {/* Preview + hint */}
                    {imagePreview ? (
                      <div className="preview-wrap">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="preview-img"
                        />
                        <div className="image-hint">
                          Format JPG/PNG/WebP, maksimal 2MB
                        </div>
                      </div>
                    ) : (
                      <div className="image-hint-inline">
                        Format JPG/PNG/WebP, maksimal 2MB
                      </div>
                    )}
                    {errors.image && (
                      <div className="error-text">{errors.image}</div>
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
                <p className="text-muted" style={{ marginTop: 10 }}>
                  {formData.desc}
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

export default InfografisCRUD;
