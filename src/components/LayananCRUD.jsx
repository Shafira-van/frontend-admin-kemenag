import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/LayananCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const LayananCRUD = () => {
  const [layananList, setLayananList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "",
    desc: "",
    procedure: "",
    requirements: "",
  });

  // 🔍 Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 🔹 Ambil data layanan dari API
  useEffect(() => {
    fetch(`${API_URL}/layanan`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLayananList(Array.isArray(data) ? data : data.data);
      })
      .catch((err) => console.error("Error fetching layanan:", err));
  }, []);

  // 🔹 Filter otomatis
  const filteredLayanan = layananList
    .filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const category = item.category?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return title.includes(search) || category.includes(search);
    })

    .filter((item) =>
      categoryFilter ? item.category === categoryFilter : true
    )
    .slice(0, itemsPerPage);

  // 🔹 Simpan (Tambah / Edit)
  // 🔹 Simpan (Tambah / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tentukan mode dan URL API
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${API_URL}/layanan/${formData.id}`
      : `${API_URL}/layanan`;

    // 🔧 Buat body JSON (bukan FormData lagi)
    const body = {
      title: formData.title,
      category: formData.category,
      desc: formData.desc,
      procedure: formData.procedure,
      requirements: formData.requirements,
    };
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json", // ✅ penting
        },
        body: JSON.stringify(body), // kirim JSON string
        credentials: "include",
      });

      // Tangani error HTTP manual
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} – ${errorText}`);
      }

      // Refresh daftar layanan setelah simpan
      const updated = await fetch(`${API_URL}/layanan`, {
        credentials: "include",
      }).then((res) => res.json());

      setLayananList(Array.isArray(updated) ? updated : updated.data);
      closeModal();
      alert("✅ Layanan berhasil disimpan!");
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data layanan!");
    }
  };

  // 🔹 Edit data
  const handleEdit = (item) => {
    setFormData(item);
    setModalMode("edit");
  };

  // 🔹 Preview data
  const handlePreview = (item) => {
    setFormData(item);
    setModalMode("preview");
  };

  // 🔹 Hapus data
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      await fetch(`${API_URL}/layanan/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setLayananList(layananList.filter((n) => n.id !== id));
    }
  };

  // 🔹 Tutup modal
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
  };

  // 🔹 Fungsi bantu: potong HTML panjang
  const truncateHTML = (html, wordLimit = 20) => {
    const text = html.replace(/<[^>]+>/g, "");
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  return (
    <div className="layanan-crud-container">
      <div className="crud-header">
        <h2>Manajemen Layanan</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Layanan
        </button>
      </div>

      {/* === FILTER BAR === */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="search-box">
            <Search size={16} color="#00695c" />
            <input
              type="text"
              placeholder="Cari layanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Kategori:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Semua</option>
              <option value="Bimas Islam">Bimas Islam</option>
              <option value="Sekretariat Jenderal">Sekretariat Jenderal</option>
              <option value="Bimas Kristen">Bimas Kristen</option>
              <option value="Pendidikan">Pendidikan</option>
              <option value="Penyelenggara Katolik">
                Penyelenggara Katolik
              </option>
              <option value="Penyelenggara Buddha">Penyelenggara Buddha</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tampilkan:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* === Tabel Layanan === */}
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
            {filteredLayanan.map((layanan, index) => (
              <tr key={layanan.id}>
                <td>{index + 1}</td>
                <td>{layanan.title}</td>
                <td>{layanan.category}</td>
                <td>{truncateHTML(layanan.desc || "", 5)}</td>
                <td className="action-buttons">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Modal Edit / Preview === */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Layanan" : "Tambah Layanan"}</h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>Judul Layanan</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
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
                    <label>Deskripsi</label>
                    <textarea
                      value={formData.desc}
                      onChange={(e) =>
                        setFormData({ ...formData, desc: e.target.value })
                      }
                      rows="3"
                      required></textarea>
                  </div>

                  <div>
                    <label>Syarat</label>
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

                        // 🌟 Hanya tombol yang paling penting
                        buttons: [
                          "bold",
                          "italic",
                          "underline",
                          "|",
                          "ul", // bullet list
                          "ol", // numbered list
                          "indent",
                          "outdent",
                          "|",
                          "align", // left, center, right, justify
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
                        setFormData({ ...formData, requirements: newContent })
                      }
                    />
                  </div>

                  <div>
                    <label>Prosedur</label>
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

                        // 🌟 Hanya tombol yang paling penting
                        buttons: [
                          "bold",
                          "italic",
                          "underline",
                          "|",
                          "ul", // bullet list
                          "ol", // numbered list
                          "indent",
                          "outdent",
                          "|",
                          "align", // left, center, right, justify
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
                        setFormData({ ...formData, procedure: newContent })
                      }
                    />
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
                  <strong>Kategori:</strong> {formData.category}
                </p>
                <p>
                  <strong>Deskripsi:</strong> {formData.desc}
                </p>

                <h4>Prosedur:</h4>
                <div dangerouslySetInnerHTML={{ __html: formData.procedure }} />
                <h4>Syarat:</h4>
                <div
                  dangerouslySetInnerHTML={{ __html: formData.requirements }}
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
