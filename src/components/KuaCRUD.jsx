import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import "../styles/KuaCRUD.css";
import JoditEditor from "jodit-react";
import { API_URL, API_UPLOADS } from "../config";

// const API_URL = "http://localhost:3000/api/kua";
// const API_UPLOADS = "http://localhost:3000";

const KuaCRUD = () => {
  const [kuaList, setKuaList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
    desc: "",
    img: "",
    socialMedia: { facebook: "", whatsapp: "", instagram: "" },
  });
  const [imgPreview, setImgPreview] = useState(null);

  // Ambil data KUA
  useEffect(() => {
    fetch(`${API_URL}/kua`)
      .then((res) => res.json())
      .then((data) =>
        setKuaList(
          data.map((item) => ({
            ...item,
            socialMedia: item.socialMedia
              ? typeof item.socialMedia === "string"
                ? JSON.parse(item.socialMedia)
                : item.socialMedia
              : { facebook: "", whatsapp: "", instagram: "" },
          }))
        )
      )
      .catch((err) => console.error("Error fetching KUA:", err));
  }, []);

  // Submit (Tambah / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = formData.id ? "PUT" : "POST";
    const url = formData.id
      ? `${API_URL}/kua/${formData.id}`
      : `${API_URL}/kua`;

    const body = new FormData();
    body.append("name", formData.name);
    body.append("address", formData.address);
    body.append("phone", formData.phone);
    body.append("desc", formData.desc);
    body.append("socialMedia", JSON.stringify(formData.socialMedia));
    if (formData.img && typeof formData.img !== "string") {
      body.append("img", formData.img);
    }

    await fetch(url, { method, body });
    const updated = await fetch(`${API_URL}/kua`).then((res) => res.json());
    setKuaList(updated);
    closeModal();
  };

  // Edit KUA
  const handleEdit = (kua) => {
    setFormData({
      ...kua,
      socialMedia: kua.socialMedia || {
        facebook: "",
        whatsapp: "",
        instagram: "",
      },
    });
    setImgPreview(kua.img ? `${API_UPLOADS}/${kua.img}` : null);
    setModalMode("edit");
  };

  // Preview KUA
  const handlePreview = (kua) => {
    setFormData({
      ...kua,
      socialMedia: kua.socialMedia || {
        facebook: "",
        whatsapp: "",
        instagram: "",
      },
    });
    setImgPreview(kua.img ? `${API_UPLOADS}/${kua.img}` : null);
    setModalMode("preview");
  };

  // Hapus data
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      await fetch(`${API_URL}/kua/${id}`, { method: "DELETE" });
      setKuaList(kuaList.filter((n) => n.id !== id));
    }
  };

  // Upload Gambar
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, img: file });
      setImgPreview(URL.createObjectURL(file));
    }
  };

  // Tutup modal
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      name: "",
      address: "",
      phone: "",
      desc: "",
      img: "",
      socialMedia: { facebook: "", whatsapp: "", instagram: "" },
    });
    setImgPreview(null);
  };

  return (
    <div className="kua-crud-container">
      <div className="crud-header">
        <h2>Manajemen KUA</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah KUA
        </button>
      </div>

      <div className="table-wrapper">
        <table className="kua-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Alamat</th>
              <th>Telepon</th>
              <th>Deskripsi</th>
              <th>Gambar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kuaList.map((kua, index) => (
              <tr key={kua.id}>
                <td>{index + 1}</td>
                <td>{kua.name}</td>
                <td>{kua.address}</td>
                <td>{kua.phone}</td>
                <td>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: kua.desc?.slice(0, 60) + "...",
                    }}></div>
                </td>
                <td>
                  {kua.img ? (
                    <img
                      src={`${API_UPLOADS}/${kua.img}`}
                      alt="KUA"
                      style={{ width: "60px", borderRadius: "6px" }}
                    />
                  ) : (
                    "Tidak ada"
                  )}
                </td>
                <td className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handlePreview(kua)}>
                    <Eye size={16} />
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(kua)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(kua.id)}>
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
                <h3>{formData.id ? "Edit KUA" : "Tambah KUA"}</h3>
                <form onSubmit={handleSubmit}>
                  <label>Nama KUA</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />

                  <label>Alamat</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />

                  <label>Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />

                  <label>Deskripsi</label>
                  <JoditEditor
                    value={formData.desc}
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

                      // 🌟 Tombol penting + tambahan font size & style
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
                        "font", // ubah font family
                        "fontsize", // ubah ukuran font
                        "brush", // ubah warna / gaya huruf
                        "|",
                        "align",
                        "link",
                        "image",
                        "|",
                        "undo",
                        "redo",
                        "fullscreen",
                      ],

                      // ✏️ Styling tambahan
                      style: {
                        fontSize: "15px",
                        lineHeight: "1.6",
                      },
                    }}
                    onBlur={(newContent) =>
                      setFormData({ ...formData, desc: newContent })
                    }
                  />

                  <label>Upload Gambar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {imgPreview && (
                    <img
                      src={imgPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxWidth: "250px",
                        borderRadius: "8px",
                        marginTop: "10px",
                      }}
                    />
                  )}

                  <h4>Media Sosial</h4>
                  <label>Facebook</label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="Link Facebook"
                  />

                  <label>WhatsApp</label>
                  <input
                    type="text"
                    value={formData.socialMedia.whatsapp || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          whatsapp: e.target.value,
                        },
                      })
                    }
                    placeholder="Nomor WhatsApp"
                  />

                  <label>Instagram</label>
                  <input
                    type="text"
                    value={formData.socialMedia.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="Link Instagram"
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
                <h3>{formData.name}</h3>
                <p>
                  <strong>Alamat:</strong> {formData.address}
                </p>
                <p>
                  <strong>Telepon:</strong> {formData.phone}
                </p>
                <p>
                  <strong>Deskripsi:</strong> {formData.desc}
                </p>
                {imgPreview && (
                  <img
                    src={imgPreview}
                    alt="KUA"
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      borderRadius: "8px",
                    }}
                  />
                )}
                <p>
                  <strong>Facebook:</strong>{" "}
                  {formData.socialMedia.facebook || "-"}
                </p>
                <p>
                  <strong>WhatsApp:</strong>{" "}
                  {formData.socialMedia.whatsapp || "-"}
                </p>
                <p>
                  <strong>Instagram:</strong>{" "}
                  {formData.socialMedia.instagram || "-"}
                </p>

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

export default KuaCRUD;
