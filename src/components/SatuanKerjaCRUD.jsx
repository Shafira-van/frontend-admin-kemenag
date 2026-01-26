import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/SatuanKerjaCRUD.css";
import { API_URL } from "../config";

const SatuanKerjaCRUD = () => {
  const [satkerList, setSatkerList] = useState([]);
  const [filteredSatker, setFilteredSatker] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    singkatan: "",
    tugas: "",
    fungsi: "",
    // optional created_at / date if backend supports it
    created_at: "",
  });

  const [errors, setErrors] = useState({
    nama: "",
    singkatan: "",
    tugas: "",
    fungsi: "",
  });

  /* ============================================================
     📡 Fetch satuan kerja (limit support)
  ============================================================ */
  useEffect(() => {
    const fetchSatker = async () => {
      try {
        const url =
          itemsPerPage && Number(itemsPerPage) > 0
            ? `${API_URL}/satuankerja?limit=${itemsPerPage}`
            : `${API_URL}/satuankerja`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        const all = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : data;
        setSatkerList(all);
        setFilteredSatker(all);
      } catch (err) {
        console.error("Error fetching satuan kerja:", err);
      }
    };

    fetchSatker();
  }, [itemsPerPage]);

  /* ============================================================
     🔍 Filter: search + date range (if created_at exists)
  ============================================================ */
  useEffect(() => {
    let result = [...satkerList];

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const nama = item.nama?.toLowerCase() || "";
        const sing = item.singkatan?.toLowerCase() || "";
        return nama.includes(q) || sing.includes(q);
      });
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      result = result.filter((item) => {
        const d = item.created_at ? new Date(item.created_at) : null;
        return d && d >= from && d <= to;
      });
    }

    setFilteredSatker(result);
  }, [searchTerm, dateRange, satkerList]);

  /* ============================================================
     🔧 Helpers
  ============================================================ */
  const stripHtml = (html = "") =>
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const truncate = (txt = "", n = 80) =>
    txt.length > n ? txt.slice(0, n) + "…" : txt;

  /* ============================================================
     ✅ Validasi form
  ============================================================ */
  const validate = () => {
    const newErr = { nama: "", singkatan: "", tugas: "", fungsi: "" };
    if (!formData.nama || !formData.nama.trim())
      newErr.nama = "Nama wajib diisi.";
    if (!formData.singkatan || !formData.singkatan.trim())
      newErr.singkatan = "Singkatan wajib diisi.";

    const tugasText = stripHtml(formData.tugas || "");
    const fungsiText = stripHtml(formData.fungsi || "");
    if (!tugasText) newErr.tugas = "Tugas wajib diisi.";
    if (!fungsiText) newErr.fungsi = "Fungsi wajib diisi.";

    setErrors(newErr);
    return Object.values(newErr).every((v) => v === "");
  };

  /* ============================================================
     📝 Submit tambah / edit (JSON body)
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/satuankerja/${formData.id}`
        : `${API_URL}/satuankerja`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nama: formData.nama,
          singkatan: formData.singkatan,
          tugas: formData.tugas,
          fungsi: formData.fungsi,
          created_at: formData.created_at || undefined,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} — ${txt}`);
      }

      // refresh data
      const updated = await fetch(
        itemsPerPage && Number(itemsPerPage) > 0
          ? `${API_URL}/satuankerja?limit=${itemsPerPage}`
          : `${API_URL}/satuankerja`,
        { credentials: "include" }
      ).then((r) => r.json());
      const list = Array.isArray(updated.data)
        ? updated.data
        : Array.isArray(updated)
        ? updated
        : updated;
      setSatkerList(list);
      setFilteredSatker(list);
      closeModal();
      alert("✅ Data satuan kerja tersimpan.");
    } catch (err) {
      console.error("Error submit satuan kerja:", err);
      alert("Gagal menyimpan. Cek console/backend.");
    }
  };

  /* ============================================================
     ✏️ Edit / 👁 Preview / 🗑 Delete
  ============================================================ */
  const handleEdit = (row) => {
    setFormData({
      id: row.id ?? null,
      nama: row.nama ?? "",
      singkatan: row.singkatan ?? "",
      tugas: row.tugas ?? "",
      fungsi: row.fungsi ?? "",
      created_at: row.created_at ?? "",
    });
    setErrors({ nama: "", singkatan: "", tugas: "", fungsi: "" });
    setModalMode("edit");
  };

  const handlePreview = (row) => {
    setFormData(row);
    setModalMode("preview");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus satuan kerja ini?")) {
      try {
        await fetch(`${API_URL}/satuankerja/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setSatkerList((prev) => prev.filter((s) => s.id !== id));
        setFilteredSatker((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error("Gagal menghapus:", err);
        alert("Gagal menghapus. Cek console.");
      }
    }
  };

  /* ============================================================
     ❌ Tutup modal (reset)
  ============================================================ */
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      nama: "",
      singkatan: "",
      tugas: "",
      fungsi: "",
      created_at: "",
    });
    setErrors({ nama: "", singkatan: "", tugas: "", fungsi: "" });
  };

  /* ============================================================
     🧩 Render UI (style uses NewsCRUD.css)
  ============================================================ */
  return (
    <div className="satker-crud-container">
      <div className="crud-header">
        <h2>Manajemen Satuan Kerja</h2>
        <button
          className="btn-add"
          onClick={() => {
            setFormData({
              id: null,
              nama: "",
              singkatan: "",
              tugas: "",
              fungsi: "",
              created_at: "",
            });
            setModalMode("edit");
          }}>
          <PlusCircle size={18} /> Tambah Satuan Kerja
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama atau singkatan..."
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

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Singkatan</th>
              <th>Tugas</th>
              <th>Fungsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredSatker.map((s, idx) => (
              <tr key={s.id}>
                <td>{idx + 1}</td>
                <td>{s.nama}</td>
                <td>{s.singkatan}</td>
                <td title={stripHtml(s.tugas)}>
                  {truncate(stripHtml(s.tugas), 80)}
                </td>
                <td title={stripHtml(s.fungsi)}>
                  {truncate(stripHtml(s.fungsi), 80)}
                </td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handlePreview(s)}>
                      <Eye size={16} />
                    </button>
                    <button className="btn-edit" onClick={() => handleEdit(s)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(s.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSatker.length === 0 && (
          <p className="empty-text">Tidak ada data ditemukan.</p>
        )}
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>
                  {formData.id ? "Edit Satuan Kerja" : "Tambah Satuan Kerja"}
                </h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div>
                    <label>
                      Nama Satuan Kerja<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => {
                        setFormData({ ...formData, nama: e.target.value });
                        if (errors.nama) setErrors({ ...errors, nama: "" });
                      }}
                      required
                      aria-invalid={!!errors.nama}
                      className={errors.nama ? "is-invalid" : ""}
                    />
                    {errors.nama && (
                      <div className="error-text">{errors.nama}</div>
                    )}
                  </div>

                  <div>
                    <label>
                      Singkatan<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.singkatan}
                      onChange={(e) => {
                        setFormData({ ...formData, singkatan: e.target.value });
                        if (errors.singkatan)
                          setErrors({ ...errors, singkatan: "" });
                      }}
                      required
                      aria-invalid={!!errors.singkatan}
                      className={errors.singkatan ? "is-invalid" : ""}
                    />
                    {errors.singkatan && (
                      <div className="error-text">{errors.singkatan}</div>
                    )}
                  </div>

                  <div>
                    <label>
                      Tugas<span className="required">*</span>
                    </label>
                    <JoditEditor
                      value={formData.tugas}
                      config={{
                        height: 320,
                        toolbarSticky: true,
                        readonly: false,
                        askBeforePasteHTML: false,
                        askBeforePasteFromWord: false,
                        disablePlugins: ["pasteStorage"],
                        defaultActionOnPaste: "insert_as_html",
                        pasteHTMLActionList: [
                          "insert_as_html",
                          "insert_clear_html",
                        ],
                        buttons: [
                          "bold",
                          "italic",
                          "underline",
                          "|",
                          "ul",
                          "ol",
                          "indent",
                          "outdent",
                          "|",
                          "align",
                          "|",
                          "link",
                          "image",
                          "|",
                          "undo",
                          "redo",
                        ],
                      }}
                      onBlur={(content) => {
                        setFormData({ ...formData, tugas: content });
                        if (errors.tugas) setErrors({ ...errors, tugas: "" });
                      }}
                    />
                    {errors.tugas && (
                      <div className="error-text">{errors.tugas}</div>
                    )}
                  </div>

                  <div>
                    <label>
                      Fungsi<span className="required">*</span>
                    </label>
                    <JoditEditor
                      value={formData.fungsi}
                      config={{
                        height: 320,
                        toolbarSticky: true,
                        readonly: false,
                        askBeforePasteHTML: false,
                        askBeforePasteFromWord: false,
                        disablePlugins: ["pasteStorage"],
                        defaultActionOnPaste: "insert_as_html",
                        pasteHTMLActionList: [
                          "insert_as_html",
                          "insert_clear_html",
                        ],
                        buttons: [
                          "bold",
                          "italic",
                          "underline",
                          "|",
                          "ul",
                          "ol",
                          "indent",
                          "outdent",
                          "|",
                          "align",
                          "|",
                          "link",
                          "image",
                          "|",
                          "undo",
                          "redo",
                        ],
                      }}
                      onBlur={(content) => {
                        setFormData({ ...formData, fungsi: content });
                        if (errors.fungsi) setErrors({ ...errors, fungsi: "" });
                      }}
                    />
                    {errors.fungsi && (
                      <div className="error-text">{errors.fungsi}</div>
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
                <h3>{formData.nama}</h3>
                <p>
                  <strong>Singkatan:</strong> {formData.singkatan}
                </p>

                <div className="about-section">
                  <h4>Tugas</h4>
                  <div dangerouslySetInnerHTML={{ __html: formData.tugas }} />
                </div>

                <div className="about-section">
                  <h4>Fungsi</h4>
                  <div dangerouslySetInnerHTML={{ __html: formData.fungsi }} />
                </div>

                <div style={{ textAlign: "right", marginTop: 12 }}>
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

export default SatuanKerjaCRUD;
