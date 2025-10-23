import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/SatuanKerjaCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

// const API_URL = "http://localhost:3000/api/satuankerja";

const SatuanKerjaCRUD = () => {
  const [satkerList, setSatkerList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    singkatan: "",
    tugas: "",
    fungsi: "",
  });

  const tugasEditor = useRef(null);
  const fungsiEditor = useRef(null);

useEffect(() => {
  fetch(`${API_URL}/satuankerja`)
    .then((res) => res.json())
    .then((data) => {
      setSatkerList(data);
    })
    .catch((err) => console.error("Gagal memuat data:", err));
}, []);


  // 🔹 Simpan data (tambah/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${API_URL}/satuankerja/${formData.id}`
      : `${API_URL}/satuankerja`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const updated = await fetch(`${API_URL}/satuankerja`).then((res) =>
      res.json()
    );

    setSatkerList(Array.isArray(updated.data) ? updated.data : updated);
    closeModal();
  };

  const handleEdit = (satker) => {
    setFormData(satker);
    setModalMode("edit");
  };

  const handlePreview = (satker) => {
    setFormData(satker);
    setModalMode("preview");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus satuan kerja ini?")) {
      await fetch(`${API_URL}/satuankerja/${id}`, { method: "DELETE" });
      setSatkerList(satkerList.filter((n) => n.id !== id));
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      nama: "",
      singkatan: "",
      tugas: "",
      fungsi: "",
    });
  };

  return (
    <div className="satker-crud-container">
      <div className="crud-header">
        <h2>Manajemen Satuan Kerja</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Satuan Kerja
        </button>
      </div>

      {/* 🔹 Tabel Data */}
      <div className="table-wrapper">
        <table className="satker-table">
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
            {satkerList.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.nama}</td>
                <td>{item.singkatan}</td>
                <td>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.tugas?.slice(0, 60) + "...",
                    }}
                  />
                </td>
                <td>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.fungsi?.slice(0, 60) + "...",
                    }}
                  />
                </td>
                <td className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handlePreview(item)}>
                    <Eye size={16} />
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(item)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Modal Edit / Preview */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>
                  {formData.id ? "Edit Satuan Kerja" : "Tambah Satuan Kerja"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>Nama Satuan Kerja</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Singkatan</label>
                    <input
                      type="text"
                      value={formData.singkatan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          singkatan: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Tugas</label>
                    <JoditEditor
                      ref={tugasEditor}
                      value={formData.tugas}
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
                        // aktifkan fitur font & ukuran huruf
                        style: {
                          fontSize: "14px",
                        },
                        toolbarAdaptive: false,
                        toolbarButtonSize: "middle",
                        removeButtons: ["source"], // opsional, sembunyikan tombol kode HTML
                      }}
                      onBlur={(newContent) =>
                        setFormData({ ...formData, tugas: newContent })
                      }
                    />
                  </div>

                  <div>
                    <label>Fungsi</label>
                    <JoditEditor
                      ref={tugasEditor}
                      value={formData.fungsi}
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
                        // aktifkan fitur font & ukuran huruf
                        style: {
                          fontSize: "14px",
                        },
                        toolbarAdaptive: false,
                        toolbarButtonSize: "middle",
                        removeButtons: ["source"], // opsional, sembunyikan tombol kode HTML
                      }}
                      onBlur={(newContent) =>
                        setFormData({ ...formData, fungsi: newContent })
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
                <h3>{formData.nama}</h3>
                <p>
                  <strong>Singkatan:</strong> {formData.singkatan}
                </p>

                <div className="about-section">
                  <h4>Tugas:</h4>
                  <div dangerouslySetInnerHTML={{ __html: formData.tugas }} />
                </div>

                <div className="about-section">
                  <h4>Fungsi:</h4>
                  <div dangerouslySetInnerHTML={{ __html: formData.fungsi }} />
                </div>

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

export default SatuanKerjaCRUD;
