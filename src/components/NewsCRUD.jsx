import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/NewsCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const NewsCRUD = () => {
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  /* ============================================================
     📡 Ambil data berita sesuai halaman dan limit
  ============================================================ */
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          `${API_URL}/berita?page=${currentPage}&limit=${itemsPerPage}`,
          { credentials: "include" }
        );
        const data = await res.json();

        const berita = Array.isArray(data.data) ? data.data : data;
        setNewsList(berita);

        // Hitung total halaman kalau backend kirim total count
        if (data.total) {
          setTotalPages(Math.ceil(data.total / itemsPerPage));
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching berita:", err);
      }
    };

    fetchNews();
  }, [currentPage, itemsPerPage]);

  /* ============================================================
     🔍 Filter kombinasi (kategori, pencarian, tanggal)
  ============================================================ */
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

    // Filter tanggal
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

  /* ============================================================
     🧭 Reset ke halaman pertama setiap filter berubah
  ============================================================ */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, dateRange, itemsPerPage]);

  /* ============================================================
     🔄 Pagination handler
  ============================================================ */
  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ============================================================
     🗑️ Hapus berita
  ============================================================ */
  const handleDelete = async (id) => {
    if (window.confirm("Hapus berita ini?")) {
      await fetch(`${API_URL}/berita/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNewsList(newsList.filter((n) => n.id !== id));
    }
  };

  // ============================================================
  // 🧩 Render UI
  // ============================================================
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
                <td>{(currentPage - 1) * itemsPerPage + (index + 1)}</td>
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
                    onClick={() => console.log(news)}>
                    <Eye size={16} />
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => console.log(news)}>
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

      {/* === PAGINATION === */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCRUD;
