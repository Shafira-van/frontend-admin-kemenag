import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import "../styles/InformasiCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const InformasiCRUD = () => {
  const [informasiList, setInformasiList] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit"

  // Filter bar
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    date: "",
    file: "", // File object
  });
  const [filePreview, setFilePreview] = useState(null);

  // Error state
  const [errors, setErrors] = useState({
    title: "",
    date: "",
    file: "",
  });

  /* ============================================================
     📡 Fetch data
  ============================================================ */
  useEffect(() => {
    const fetchInformasi = async () => {
      try {
        let url = `${API_URL}/informasi`;
        if (itemsPerPage && Number(itemsPerPage) > 0) {
          url = `${API_URL}/informasi?limit=${itemsPerPage}`;
        }
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : data;
        setInformasiList(list);
        setFilteredInfo(list);
      } catch (err) {
        console.error("Error fetching informasi:", err);
      }
    };
    fetchInformasi();
  }, [itemsPerPage]);

  /* ============================================================
     🔍 Filter (search + date range)
  ============================================================ */
  useEffect(() => {
    let result = [...informasiList];

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        return title.includes(keyword);
      });
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      result = result.filter((item) => {
        const d = item.date ? new Date(item.date) : null;
        return d && d >= from && d <= to;
      });
    }

    setFilteredInfo(result);
  }, [searchTerm, dateRange, informasiList]);

  /* ============================================================
     ✅ Validasi (PDF, ukuran MAKSIMAL 5MB)
  ============================================================ */
  const validate = () => {
    const newErr = { title: "", date: "", file: "" };

    if (!formData.title || !formData.title.trim())
      newErr.title = "Judul wajib diisi.";
    if (!formData.date) newErr.date = "Tanggal wajib diisi.";

    const isCreate = !formData.id;
    const hasExistingFile = !!filePreview;
    const hasNewFile = formData.file instanceof File;

    if (
      (isCreate && !hasNewFile) ||
      (!isCreate && !hasExistingFile && !hasNewFile)
    ) {
      newErr.file = "File wajib diunggah (PDF maksimal 5MB).";
    }

    if (hasNewFile) {
      const f = formData.file;
      const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
      const isMax5Mb = f.size <= 5 * 1024 * 1024; // <= 5MB
      if (!isPdf || !isMax5Mb)
        newErr.file = "Format harus PDF dan ukuran maksimal 5MB.";
    }

    setErrors(newErr);
    return Object.values(newErr).every((m) => m === "");
  };

  /* ============================================================
     📝 Submit (create / update)
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/informasi/${formData.id}`
        : `${API_URL}/informasi`;

      const body = new FormData();
      body.append("title", formData.title || "");
      body.append("date", formData.date || "");
      if (formData.file instanceof File) body.append("file", formData.file);

      const res = await fetch(url, { method, body, credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${await res.text()}`);

      const updated = await fetch(
        itemsPerPage && Number(itemsPerPage) > 0
          ? `${API_URL}/informasi?limit=${itemsPerPage}`
          : `${API_URL}/informasi`,
        { credentials: "include" }
      ).then((r) => r.json());

      const list = Array.isArray(updated.data) ? updated.data : updated;
      setInformasiList(list);
      setFilteredInfo(list);
      closeModal();
      alert("✅ Informasi berhasil disimpan!");
    } catch (err) {
      console.error("❌ Error submit informasi:", err);
      alert("Gagal menyimpan informasi. Cek console/log backend.");
    }
  };

  /* ============================================================
     ✏️ Edit
  ============================================================ */
  const handleEdit = (info) => {
    const dateValue = info.date
      ? new Date(info.date).toISOString().split("T")[0]
      : "";
    setFormData({
      id: info.id ?? null,
      title: info.title ?? "",
      date: dateValue,
      file: "", // kosong: jika tidak ganti, backend pakai file lama
    });

    setFilePreview(info.file_path ? `${API_UPLOADS}/${info.file_path}` : null);
    setErrors({ title: "", date: "", file: "" });
    setModalMode("edit");
  };

  /* ============================================================
     🗑️ Hapus
  ============================================================ */
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data informasi ini?")) return;
    await fetch(`${API_URL}/informasi/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setInformasiList((prev) => prev.filter((n) => n.id !== id));
    setFilteredInfo((prev) => prev.filter((n) => n.id !== id));
  };

  /* ============================================================
     📎 OnChange file: PDF & MAKS 5MB + preview
  ============================================================ */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isMax5Mb = file.size <= 5 * 1024 * 1024; // <= 5MB

    if (!isPdf || !isMax5Mb) {
      setErrors((prev) => ({
        ...prev,
        file: "Format harus PDF dan ukuran maksimal 5MB.",
      }));
      setFormData((prev) => ({ ...prev, file: "" }));
      setFilePreview(null);
      return;
    }

    setFormData((prev) => ({ ...prev, file }));
    setFilePreview(URL.createObjectURL(file));
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  /* ============================================================
     ❌ Tutup modal
  ============================================================ */
  const closeModal = () => {
    setModalMode(null);
    setFormData({ id: null, title: "", date: "", file: "" });
    setFilePreview(null);
    setErrors({ title: "", date: "", file: "" });
  };

  /* ============================================================
     🧩 Render
  ============================================================ */
  return (
    <div className="informasi-crud-container">
      {/* Header */}
      <div className="crud-header">
        <h2>Manajemen Informasi</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Informasi
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari judul informasi..."
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

            <div className="filter-item date-range">
              <label>Periode</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                />
                <span>–</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
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
            {filteredInfo.map((info, idx) => (
              <tr key={info.id}>
                <td>{idx + 1}</td>
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
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(info)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(info.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInfo.length === 0 && (
          <p className="empty-text">Tidak ada informasi ditemukan.</p>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>{formData.id ? "Edit Informasi" : "Tambah Informasi"}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div>
                <label>
                  Judul Informasi<span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: "" });
                  }}
                  required
                  aria-invalid={!!errors.title}
                  className={errors.title ? "is-invalid" : ""}
                />
                {errors.title && (
                  <div className="error-text">{errors.title}</div>
                )}
              </div>

              <div className="form-grid">
                <div>
                  <label>
                    Tanggal<span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (errors.date) setErrors({ ...errors, date: "" });
                    }}
                    required
                    aria-invalid={!!errors.date}
                    className={errors.date ? "is-invalid" : ""}
                  />
                  {errors.date && (
                    <div className="error-text">{errors.date}</div>
                  )}
                </div>

                <div>
                  <label>
                    File <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    aria-invalid={!!errors.file}
                    className={errors.file ? "is-invalid" : ""}
                  />
                  {!filePreview && (
                    <div className="image-hint-inline">
                      Hanya PDF, ukuran maksimal 5MB
                    </div>
                  )}
                  {filePreview && (
                    <div className="preview-wrap">
                      <iframe
                        src={filePreview}
                        title="Preview File"
                        className="preview-file"
                      />
                      <div className="image-hint">PDF maksimal 5MB</div>
                    </div>
                  )}
                  {errors.file && (
                    <div className="error-text">{errors.file}</div>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default InformasiCRUD;
