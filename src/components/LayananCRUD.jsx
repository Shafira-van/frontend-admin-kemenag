import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/LayananCRUD.css";
import { API_URL } from "../config";

const LayananCRUD = () => {
  const [layananList, setLayananList] = useState([]);
  const [filteredLayanan, setFilteredLayanan] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"

  // Filter bar
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "",
    desc: "",
    procedure: "",
    requirements: "",
  });

  // Error state per-field
  const [errors, setErrors] = useState({
    title: "",
    category: "",
    desc: "",
    procedure: "",
    requirements: "",
  });

  /* ============================================================
    📡 Fetch layanan (support limit bila ada di backend)
  ============================================================ */
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const url =
          itemsPerPage && Number(itemsPerPage) > 0
            ? `${API_URL}/layanan?limit=${itemsPerPage}`
            : `${API_URL}/layanan`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : data;
        setLayananList(list);
        setFilteredLayanan(list);
      } catch (err) {
        console.error("Error fetching layanan:", err);
      }
    };
    fetchLayanan();
  }, [itemsPerPage]);

  /* ============================================================
     🔍 Filter kombinasi (search + category)
  ============================================================ */
  useEffect(() => {
    let result = [...layananList];

    // Search by title/category (case-insensitive)
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const category = item.category?.toLowerCase() || "";
        return title.includes(keyword) || category.includes(keyword);
      });
    }

    // Filter category
    if (categoryFilter) {
      result = result.filter(
        (n) =>
          n.category &&
          n.category.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    setFilteredLayanan(result);
  }, [searchTerm, categoryFilter, layananList]);

  /* ============================================================
     ✅ Validasi
  ============================================================ */
  const validate = () => {
    const newErr = {
      title: "",
      category: "",
      desc: "",
      procedure: "",
      requirements: "",
    };

    if (!formData.title || !formData.title.trim())
      newErr.title = "Judul wajib diisi.";
    if (!formData.category) newErr.category = "Kategori wajib dipilih.";

    const cleanText = (html) =>
      (html || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

    if (!cleanText(formData.desc)) newErr.desc = "Deskripsi wajib diisi.";
    if (!cleanText(formData.procedure))
      newErr.procedure = "Prosedur wajib diisi.";
    if (!cleanText(formData.requirements))
      newErr.requirements = "Syarat wajib diisi.";

    setErrors(newErr);
    return Object.values(newErr).every((m) => m === "");
  };

  /* ============================================================
     📝 Submit (create / update) — JSON body
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/layanan/${formData.id}`
        : `${API_URL}/layanan`;

      const body = {
        title: formData.title || "",
        category: formData.category || "",
        desc: formData.desc || "",
        procedure: formData.procedure || "",
        requirements: formData.requirements || "",
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} – ${errorText}`);
      }

      // Refresh list
      const updated = await fetch(
        itemsPerPage && Number(itemsPerPage) > 0
          ? `${API_URL}/layanan?limit=${itemsPerPage}`
          : `${API_URL}/layanan`,
        { credentials: "include" },
      ).then((r) => r.json());

      const list = Array.isArray(updated.data) ? updated.data : updated;
      setLayananList(list);
      setFilteredLayanan(list);
      closeModal();
      alert("✅ Layanan berhasil disimpan!");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Terjadi kesalahan saat menyimpan data layanan!");
    }
  };

  /* ============================================================
     ✏️ Edit / 👁️ Preview / 🗑️ Hapus
  ============================================================ */
  const handleEdit = (item) => {
    setFormData({
      id: item.id ?? null,
      title: item.title ?? "",
      category: item.category ?? "",
      desc: item.desc ?? "",
      procedure: item.procedure ?? "",
      requirements: item.requirements ?? "",
    });
    setErrors({
      title: "",
      category: "",
      desc: "",
      procedure: "",
      requirements: "",
    });
    setModalMode("edit");
  };

  const handlePreview = (item) => {
    setFormData(item);
    setModalMode("preview");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini?"))
      return;
    await fetch(`${API_URL}/layanan/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setLayananList((prev) => prev.filter((n) => n.id !== id));
    setFilteredLayanan((prev) => prev.filter((n) => n.id !== id));
  };

  /* ============================================================
     ❌ Tutup modal
  ============================================================ */
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      title: "",
      category: "",
      desc: "",
      procedure: "",
      requirements: "",
    });
    setErrors({
      title: "",
      category: "",
      desc: "",
      procedure: "",
      requirements: "",
    });
  };

  const truncateHTML = (html, wordLimit = 10) => {
    const text = (html || "").replace(/<[^>]+>/g, "");
    const words = text.split(/\s+/);
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "…"
      : text;
  };

  /* ============================================================
     🧩 Render
  ============================================================ */
  return (
    <div className="layanan-crud-container">
      {/* Header */}
      <div className="crud-header">
        <h2>Manajemen Layanan</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Layanan
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari judul atau kategori layanan…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-inline">
            <div className="filter-item">
              <label>Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">Semua</option>
                <option value="Bimas Islam">Bimas Islam</option>
                <option value="Sekretariat Jenderal">
                  Sekretariat Jenderal
                </option>
                <option value="Bimas Kristen">Bimas Kristen</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Penyelenggara Katolik">
                  Penyelenggara Katolik
                </option>
                <option value="Penyelenggara Buddha">
                  Penyelenggara Buddha
                </option>
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
      </div>

      {/* Tabel */}
      <div className="table-wrapper">
        <table className="layanan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLayanan.map((layanan, idx) => (
              <tr key={layanan.id}>
                <td>{idx + 1}</td>
                <td>{layanan.title}</td>
                <td>{layanan.category}</td>
                <td>{truncateHTML(layanan.desc, 12)}</td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handlePreview(layanan)}>
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(layanan)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(layanan.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLayanan.length === 0 && (
          <p className="empty-text">Tidak ada layanan ditemukan.</p>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Layanan" : "Tambah Layanan"}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div>
                    <label>
                      Judul Layanan<span className="required">*</span>
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
                        Kategori<span className="required">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          });
                          if (errors.category)
                            setErrors({ ...errors, category: "" });
                        }}
                        required
                        aria-invalid={!!errors.category}
                        className={errors.category ? "is-invalid" : ""}>
                        <option value="">-- Pilih Kategori --</option>
                        <option value="Bimas Islam">Bimas Islam</option>
                        <option value="Sekretariat Jenderal">
                          Sekretariat Jenderal
                        </option>
                        <option value="Bimas Kristen">Bimas Kristen</option>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Penyelenggara Katolik">
                          Penyelenggara Katolik
                        </option>
                        <option value="Penyelenggara Buddha">
                          Penyelenggara Buddha
                        </option>
                      </select>
                      {errors.category && (
                        <div className="error-text">{errors.category}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label>
                      Deskripsi<span className="required">*</span>
                    </label>
                    <textarea
                      rows={3}
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
                      Prosedur<span className="required">*</span>
                    </label>
                    <JoditEditor
                      value={formData.procedure}
                      config={{
                        height: 400,
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
                        setFormData({ ...formData, procedure: content });
                        if (errors.procedure)
                          setErrors({ ...errors, procedure: "" });
                      }}
                    />
                    {errors.procedure && (
                      <div className="error-text">{errors.procedure}</div>
                    )}
                  </div>

                  <div>
                    <label>
                      Syarat<span className="required">*</span>
                    </label>
                    <JoditEditor
                      value={formData.requirements}
                      config={{
                        height: 400,
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
                        setFormData({ ...formData, requirements: content });
                        if (errors.requirements)
                          setErrors({ ...errors, requirements: "" });
                      }}
                    />
                    {errors.requirements && (
                      <div className="error-text">{errors.requirements}</div>
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
                <h3>{formData.title}</h3>
                <p>
                  <strong>Kategori:</strong> {formData.category || "-"}
                </p>
                <p>
                  <strong>Deskripsi:</strong> {formData.desc || "-"}
                </p>

                <h4>Prosedur</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.procedure || "-",
                  }}
                />
                <h4>Syarat</h4>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.requirements || "-",
                  }}
                />
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

export default LayananCRUD;
