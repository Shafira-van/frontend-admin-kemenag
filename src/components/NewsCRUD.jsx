import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/NewsCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const NewsCRUD = () => {
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    date: "",
    category: "",
    editor: "",
    content: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  // ===========================================================
  // 🔹 Ambil data berita dari backend (refetch tiap limit berubah)
  // ===========================================================
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_URL}/berita?limit=${itemsPerPage}`, {
          credentials: "include",
        });
        const data = await res.json();
        const allNews = Array.isArray(data.data) ? data.data : data;
        setNewsList(allNews);
        setFilteredNews(allNews);
      } catch (err) {
        console.error("Error fetching berita:", err);
      }
    };

    fetchNews();
  }, [itemsPerPage]);

  // ===========================================================
  // 🔍 Filter kombinasi (kategori, pencarian, tanggal)
  // ===========================================================
  useEffect(() => {
    let result = [...newsList];

    // Filter kategori
    if (categoryFilter) {
      result = result.filter(
        (n) =>
          n.category &&
          n.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Filter pencarian
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const category = item.category?.toLowerCase() || "";
        const editor = item.editor?.toLowerCase() || "";
        return (
          title.includes(keyword) ||
          category.includes(keyword) ||
          editor.includes(keyword)
        );
      });
    }

    // Filter rentang tanggal
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      result = result.filter((item) => {
        const date = new Date(item.date);
        return date >= from && date <= to;
      });
    }

    setFilteredNews(result);
  }, [searchTerm, categoryFilter, dateRange, newsList]);

  // ===========================================================
  // 📝 Handle submit berita baru / edit
  // ===========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/berita/${formData.id}`
        : `${API_URL}/berita`;

      const body = new FormData();

      // ✅ Simpan tanggal asli tanpa ubah timezone
      let adjustedDate = formData.date;

      body.append("title", formData.title || "");
      body.append("date", adjustedDate || "");
      body.append("category", formData.category || "");
      body.append("editor", formData.editor || "");
      body.append("content", formData.content || "");
      if (formData.image instanceof File) body.append("image", formData.image);

      const res = await fetch(url, { method, body, credentials: "include" });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} – ${errText}`);
      }

      // Refresh data terbaru
      const updated = await fetch(`${API_URL}/berita?limit=${itemsPerPage}`, {
        credentials: "include",
      }).then((res) => res.json());

      const allNews = Array.isArray(updated.data) ? updated.data : updated;
      setNewsList(allNews);
      closeModal();
      alert("✅ Berita berhasil disimpan!");
    } catch (err) {
      console.error("❌ Error saat submit berita:", err);
      alert("Gagal menyimpan berita. Cek console/log backend.");
    }
  };

  // ===========================================================
  // ✏️ Edit berita
  // ===========================================================
  const handleEdit = (news) => {
    const dateValue = news.date
      ? new Date(news.date).toISOString().split("T")[0]
      : "";

    setFormData({ ...news, date: dateValue });
    setImagePreview(
      news.image ? `${API_UPLOADS}/uploads/berita/${news.image}` : null
    );
    setModalMode("edit");
  };

  // ===========================================================
  // 👁️ Preview berita
  // ===========================================================
  const handlePreview = (news) => {
    setFormData(news);
    setImagePreview(
      news.image ? `${API_UPLOADS}/uploads/berita/${news.image}` : null
    );
    setModalMode("preview");
  };

  // ===========================================================
  // 🗑️ Hapus berita
  // ===========================================================
  const handleDelete = async (id) => {
    if (window.confirm("Hapus berita ini?")) {
      await fetch(`${API_URL}/berita/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNewsList(newsList.filter((n) => n.id !== id));
    }
  };

  // ===========================================================
  // ❌ Tutup modal
  // ===========================================================
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      title: "",
      date: "",
      category: "",
      editor: "",
      content: "",
      image: "",
    });
    setImagePreview(null);
  };

  // ===========================================================
  // 🧩 Render UI
  // ===========================================================
  return (
    <div className="news-crud-container">
      <div className="crud-header">
        <h2>Manajemen Berita</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Berita
        </button>
      </div>

      {/* === FILTER BAR === */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari judul, kategori, atau editor..."
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

      {/* === TABEL BERITA === */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Editor</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.map((news, index) => (
              <tr key={news.id}>
                <td>{index + 1}</td>
                <td>{news.title}</td>
                <td>{news.category}</td>
                <td>
                  {news.date
                    ? new Date(news.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td>{news.editor}</td>
                <td className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handlePreview(news)}>
                    <Eye size={16} />
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(news)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(news.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredNews.length === 0 && (
          <p className="empty-text">Tidak ada berita ditemukan.</p>
        )}
      </div>

      {/* === MODAL TAMBAH / EDIT / PREVIEW === */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Berita" : "Tambah Berita"}</h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>Judul Berita</label>
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
                      <label>Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          })
                        }
                        required>
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
                    </div>

                    <div>
                      <label>Editor</label>
                      <input
                        type="text"
                        value={formData.editor}
                        onChange={(e) =>
                          setFormData({ ...formData, editor: e.target.value })
                        }
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
                  </div>

                  <label>Isi Berita</label>
                  <JoditEditor
                    value={formData.content}
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
                        "fullscreen",
                      ],
                    }}
                    onBlur={(newContent) =>
                      setFormData({ ...formData, content: newContent })
                    }
                  />

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
                  <strong>Kategori:</strong> {formData.category}
                </p>
                <p>
                  <strong>Editor:</strong> {formData.editor}
                </p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={formData.title}
                    className="preview-img"
                  />
                )}
                <div
                  className="news-content"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
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

export default NewsCRUD;
