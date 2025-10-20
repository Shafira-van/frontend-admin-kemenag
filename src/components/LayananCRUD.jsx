import React, { useState, useEffect } from "react";
import "../styles/LayananCRUD.css";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import JoditEditor, { Jodit } from "jodit-react";

const API_URL = "http://localhost:3000/api/layanan";

const LayananCRUD = () => {
  const [layananList, setLayananList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    icon: "",
    title: "",
    desc: "",
    procedure: "",
    requirements: "",
  });

  // Ambil data layanan dari API
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setLayananList(data))
      .catch((err) => console.error("Error fetching layanan:", err));
  }, []);

  // Simpan (Tambah / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `${API_URL}/${formData.id}` : API_URL;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const updated = await fetch(API_URL).then((res) => res.json());
    setLayananList(updated);
    closeModal();
  };

  // Edit data
  const handleEdit = (data) => {
    setFormData(data);
    setModalMode("edit");
  };

  // Preview data
  const handlePreview = (data) => {
    setFormData(data);
    setModalMode("preview");
  };

  // Hapus data
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setLayananList(layananList.filter((n) => n.id !== id));
    }
  };

  // Tutup modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      icon: "",
      title: "",
      desc: "",
      procedure: "",
      requirements: "",
    });
  };

  // Batasi teks panjang di tabel
  const truncateHTML = (html, wordLimit = 20) => {
    const text = html.replace(/<[^>]+>/g, ""); // hapus tag HTML
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

      <div className="table-wrapper">
        <table className="layanan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {layananList.map((layanan, index) => (
              <tr key={layanan.id}>
                <td>{index + 1}</td>
                <td>{layanan.title}</td>
                <td>{truncateHTML(layanan.requirements, 5)}</td>
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

      {/* Modal */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Layanan" : "Tambah Layanan"}</h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>Judul</label>
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
                    <label>Prosedur</label>
                    <JoditEditor
                      value={formData.procedure}
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
                        setFormData({ ...formData, procedure: newContent })
                      }
                    />
                  </div>

                  <div>
                    <label>Syarat</label>
                    <JoditEditor
                      value={formData.requirements}
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
                        setFormData({ ...formData, requirements: newContent })
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
                  <strong>Deskripsi:</strong> {formData.desc}
                </p>
                <p>
                  <strong>Prosedur:</strong>
                </p>
                <div dangerouslySetInnerHTML={{ __html: formData.procedure }} />
                <p>
                  <strong>Syarat:</strong>
                </p>
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
