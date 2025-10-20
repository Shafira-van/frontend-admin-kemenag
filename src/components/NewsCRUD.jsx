import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/NewsCRUD.css";
import { formatISO, parseISO, format } from "date-fns";

const API_URL = "http://localhost:3000/api/berita";
const API_UPLOADS = "http://localhost:3000/uploads/berita";

const NewsCRUD = () => {
  const [newsList, setNewsList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
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

  // Fetch berita
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setNewsList(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  // Handle submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `${API_URL}/${formData.id}` : API_URL;

    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => body.append(key, val));

    await fetch(url, { method, body });
    const updated = await fetch(API_URL).then((res) => res.json());
    setNewsList(updated);

    closeModal();
  };

  // Open modal edit
  // Saat edit
 const handleEdit = (news) => {
   const dateValue = news.date ? format(parseISO(news.date), "yyyy-MM-dd") : "";
   setFormData({ ...news, date: dateValue });
   setImagePreview(news.image ? `${API_UPLOADS}/${news.image}` : null);
   setModalMode("edit");
 };

  // Open modal preview
  const handlePreview = (news) => {
    setFormData(news);
    setImagePreview(
      news.image
        ? typeof news.image === "string"
          ? `${API_UPLOADS}/${news.image}`
          : URL.createObjectURL(news.image)
        : null
    );
    setModalMode("preview");
  };

  // Delete berita
  const handleDelete = async (id) => {
    if (window.confirm("Hapus berita ini?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setNewsList(newsList.filter((n) => n.id !== id));
    }
  };

  // Close modal
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

  

  return (
    <div className="news-crud-container">
      <div className="crud-header">
        <h2>Manajemen Berita</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Berita
        </button>
      </div>

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
            {newsList.map((news, index) => (
              <tr key={news.id}>
                <td>{index + 1}</td>
                <td>{news.title}</td>
                <td>{news.category}</td>
                <td>
                  {new Date(news.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
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
      </div>

      {/* Modal untuk edit & preview */}
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
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required>
                        <option value="">-- Pilih Kategori --</option>
                        <option value="Bimas Islam">Bimas Islam</option>
                        <option value="Sekjend">Sekjend</option>
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
                      askBeforePasteHTML: false,
                      askBeforePasteFromWord: false,
                      pasteHTMLAction: "insert_as_html",
                      processPasteHTML: true,
                      defaultActionOnPaste: "insert_clear_html",
                      allowPaste: true,
                      cleanHTML: {
                        fillEmptyParagraph: false,
                      },
                      buttons:
                        "font,fontsize,paragraph,|,bold,italic,underline,strikethrough,|,ul,ol,indent,outdent,|,link,image,table,|,align,undo,redo",
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
                  <strong>Tanggal:</strong>
                  {new Date(formData.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
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
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
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
