import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/KuaCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

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

  // error per field
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phone: "",
    desc: "",
    img: "",
  });

  /* ============================
     📡 Fetch data KUA
  ============================ */
  useEffect(() => {
    const fetchKua = async () => {
      try {
        const res = await fetch(`${API_URL}/kua`, { credentials: "include" });
        const raw = await res.json();
        const data = (Array.isArray(raw.data) ? raw.data : raw).map((item) => ({
          ...item,
          socialMedia: item.socialMedia
            ? typeof item.socialMedia === "string"
              ? (() => {
                  try {
                    return JSON.parse(item.socialMedia);
                  } catch {
                    return { facebook: "", whatsapp: "", instagram: "" };
                  }
                })()
              : item.socialMedia
            : { facebook: "", whatsapp: "", instagram: "" },
        }));
        setKuaList(data);
      } catch (e) {
        console.error("Error fetching KUA:", e);
      }
    };
    fetchKua();
  }, []);

  /* ============================
     ✅ Validasi
  ============================ */
  const validate = () => {
    const newErr = { name: "", address: "", phone: "", desc: "", img: "" };

    if (!formData.name.trim()) newErr.name = "Nama wajib diisi.";
    if (!formData.address.trim()) newErr.address = "Alamat wajib diisi.";
    if (!formData.phone.trim()) newErr.phone = "Telepon wajib diisi.";

    // cek konten editor kosong (bersihkan HTML)
    const textContent = (formData.desc || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!textContent) newErr.desc = "Deskripsi wajib diisi.";

    // jika create, wajib unggah gambar; jika edit & belum ada preview dan tidak unggah baru -> wajib
    const isCreate = !formData.id;
    const hasExistingImg = !!imgPreview;
    const hasNewFile = formData.img instanceof File;

    if (
      (isCreate && !hasNewFile) ||
      (!isCreate && !hasExistingImg && !hasNewFile)
    ) {
      newErr.img = "Gambar wajib diunggah (JPG/PNG/WebP minimal 2MB).";
    }

    if (hasNewFile) {
      const f = formData.img;
      const isAllowed =
        f.type === "image/jpeg" ||
        f.type === "image/png" ||
        f.type === "image/webp" ||
        /\.(jpe?g|png|webp)$/i.test(f.name);
      const isMin2Mb = f.size >= 2 * 1024 * 1024;

      if (!isAllowed || !isMin2Mb) {
        newErr.img = "Format harus JPG/PNG/WebP dan ukuran minimal 2MB.";
      }
    }

    setErrors(newErr);
    return Object.values(newErr).every((m) => m === "");
  };

  /* ============================
     📝 Submit (create / update)
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
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
      if (formData.img instanceof File) body.append("img", formData.img);

      const res = await fetch(url, { method, body, credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${await res.text()}`);

      const updated = await fetch(`${API_URL}/kua`, {
        credentials: "include",
      }).then((r) => r.json());
      const list = Array.isArray(updated.data) ? updated.data : updated;
      setKuaList(list);
      closeModal();
      alert("✅ Data KUA berhasil disimpan!");
    } catch (err) {
      console.error("❌ Error submit KUA:", err);
      alert("Gagal menyimpan data. Cek console/log backend.");
    }
  };

  /* ============================
     ✏️ Edit / 👁️ Preview / 🗑️ Hapus
  ============================ */
  const handleEdit = (kua) => {
    setFormData({
      id: kua.id ?? null,
      name: kua.name ?? "",
      address: kua.address ?? "",
      phone: kua.phone ?? "",
      desc: kua.desc ?? "",
      img: "",
      socialMedia: kua.socialMedia || {
        facebook: "",
        whatsapp: "",
        instagram: "",
      },
    });
    setImgPreview(kua.img ? `${API_UPLOADS}/${kua.img}` : null);
    setErrors({ name: "", address: "", phone: "", desc: "", img: "" });
    setModalMode("edit");
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    await fetch(`${API_URL}/kua/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setKuaList((prev) => prev.filter((n) => n.id !== id));
  };

  /* ============================
     🖼️ OnChange Gambar
  ============================ */
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAllowed =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      /\.(jpe?g|png|webp)$/i.test(file.name);
    const isMin2Mb = file.size >= 2 * 1024 * 1024;

    if (!isAllowed || !isMin2Mb) {
      setErrors((prev) => ({
        ...prev,
        img: "Format harus JPG/PNG/WebP dan ukuran minimal 2MB.",
      }));
      setFormData((prev) => ({ ...prev, img: "" }));
      setImgPreview(null);
      return;
    }

    setFormData((prev) => ({ ...prev, img: file }));
    setImgPreview(URL.createObjectURL(file));
    if (errors.img) setErrors((prev) => ({ ...prev, img: "" }));
  };

  /* ============================
     ❌ Tutup modal
  ============================ */
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
    setErrors({ name: "", address: "", phone: "", desc: "", img: "" });
  };

  return (
    <div className="kua-crud-container">
      <div className="crud-header">
        <h2>Manajemen KUA</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah KUA
        </button>
      </div>

      {/* TABEL */}
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
                      __html:
                        (kua.desc || "").slice(0, 80) +
                        (kua.desc?.length > 80 ? "…" : ""),
                    }}
                  />
                </td>
                <td>
                  {kua.img ? (
                    <img
                      src={`${API_UPLOADS}/${kua.img}`}
                      alt="KUA"
                      style={{ width: "64px", borderRadius: "6px" }}
                    />
                  ) : (
                    "Tidak ada"
                  )}
                </td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handlePreview(kua)}>
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(kua)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(kua.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit KUA" : "Tambah KUA"}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <label>
                    Nama KUA<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    required
                    aria-invalid={!!errors.name}
                    className={errors.name ? "is-invalid" : ""}
                  />
                  {errors.name && (
                    <div className="error-text">{errors.name}</div>
                  )}

                  <label>
                    Alamat<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                    required
                    aria-invalid={!!errors.address}
                    className={errors.address ? "is-invalid" : ""}
                  />
                  {errors.address && (
                    <div className="error-text">{errors.address}</div>
                  )}

                  <label>
                    Telepon<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    required
                    aria-invalid={!!errors.phone}
                    className={errors.phone ? "is-invalid" : ""}
                  />
                  {errors.phone && (
                    <div className="error-text">{errors.phone}</div>
                  )}

                  <label>
                    Deskripsi<span className="required">*</span>
                  </label>
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
                    onBlur={(newContent) => {
                      setFormData({ ...formData, desc: newContent });
                      if (errors.desc) setErrors({ ...errors, desc: "" });
                    }}
                  />
                  {errors.desc && (
                    <div className="error-text">{errors.desc}</div>
                  )}

                  <label>
                    Upload Gambar<span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    aria-invalid={!!errors.img}
                    className={errors.img ? "is-invalid" : ""}
                  />
                  {/* Preview + hint */}
                  {imgPreview ? (
                    <div className="preview-wrap">
                      <img
                        src={imgPreview}
                        alt="Preview"
                        className="preview-img"
                      />
                      <div className="image-hint">
                        Format JPG/PNG/WebP, minimal 2MB
                      </div>
                    </div>
                  ) : (
                    <div className="image-hint-inline">
                      Format JPG/PNG/WebP, minimal 2MB
                    </div>
                  )}
                  {errors.img && <div className="error-text">{errors.img}</div>}

                  <h4 style={{ marginTop: 16 }}>Media Sosial</h4>
                  <label>Facebook</label>
                  <input
                    type="text"
                    placeholder="Link Facebook"
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
                  />
                  <label>WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Link Nomor WhatsApp"
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
                  />
                  <label>Instagram</label>
                  <input
                    type="text"
                    placeholder="Link Instagram"
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

                {imgPreview && (
                  <img src={imgPreview} alt="KUA" className="preview-img" />
                )}

                <div className="about-section">
                  <h4>Deskripsi:</h4>
                  <div dangerouslySetInnerHTML={{ __html: formData.desc }} />
                </div>

                <div className="about-section">
                  <h4>Media Sosial:</h4>
                  <div>
                    <div>
                      <strong>Facebook:</strong>{" "}
                      {formData.socialMedia.facebook || "-"}
                    </div>
                    <div>
                      <strong>WhatsApp:</strong>{" "}
                      {formData.socialMedia.whatsapp || "-"}
                    </div>
                    <div>
                      <strong>Instagram:</strong>{" "}
                      {formData.socialMedia.instagram || "-"}
                    </div>
                  </div>
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

export default KuaCRUD;
