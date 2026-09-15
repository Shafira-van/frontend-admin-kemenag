import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/SekolahCRUD.css";
import { API_URL, API_UPLOADS } from "../config";
import Swal from "sweetalert2";

export default function SekolahCRUD() {
  const [sekolahList, setSekolahList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"

  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    alamat: "",
    map: "",
    telepon: "",
    deskripsi: "",
    gambar: "",
    sosMed: {
      facebook: "",
      whatsapp: "",
      instagram: "",
    },
  });

  const [imgPreview, setImgPreview] = useState(null);

  const [errors, setErrors] = useState({
    nama: "",
    alamat: "",
    map: "",
    telepon: "",
    deskripsi: "",
    gambar: "",
  });

  /* ============================
     📡 Fetch data Sekolah
  ============================ */
  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        const res = await fetch(`${API_URL}/sekolah`, {
          credentials: "include",
        });

        const raw = await res.json();

        const data = (Array.isArray(raw.data) ? raw.data : raw).map(
          (item) => ({
            ...item,

            sosMed: item.sosMed
              ? typeof item.sosMed === "string"
                ? (() => {
                    try {
                      return JSON.parse(item.sosMed);
                    } catch {
                      return {
                        facebook: "",
                        whatsapp: "",
                        instagram: "",
                      };
                    }
                  })()
                : item.sosMed
              : {
                  facebook: "",
                  whatsapp: "",
                  instagram: "",
                },
          })
        );

        setSekolahList(data);
      } catch (e) {
        console.error("Error fetching Sekolah:", e);
      }
    };

    fetchSekolah();
  }, []);

  /* ============================
     ✅ Validasi
  ============================ */
  const validate = () => {
    const newErr = {
      nama: "",
      alamat: "",
      map: "",
      telepon: "",
      deskripsi: "",
      gambar: "",
    };

    if (!formData.nama.trim()) {
      newErr.nama = "Nama wajib diisi.";
    }

    if (!formData.alamat.trim()) {
      newErr.alamat = "Alamat wajib diisi.";
    }

    if (!formData.telepon.trim()) {
      newErr.telepon = "Telepon wajib diisi.";
    }

    // Cek isi Jodit Editor
    const textContent = (formData.deskripsi || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!textContent) {
      newErr.deskripsi = "Deskripsi wajib diisi.";
    }

    // Validasi gambar
    const isCreate = !formData.id;
    const hasExistingImg = !!imgPreview;
    const hasNewFile = formData.gambar instanceof File;

    if (
      (isCreate && !hasNewFile) ||
      (!isCreate && !hasExistingImg && !hasNewFile)
    ) {
      newErr.gambar =
        "Gambar wajib diunggah (JPG/PNG/WebP maksimal 1MB).";
    }

    if (hasNewFile) {
      const file = formData.gambar;

      const isAllowed =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp" ||
        /\.(jpe?g|png|webp)$/i.test(file.name);

      const isMax1Mb = file.size <= 1 * 1024 * 1024;

      if (!isAllowed || !isMax1Mb) {
        newErr.gambar =
          "Format harus JPG/PNG/WebP dan ukuran maksimal 1MB.";
      }
    }

    setErrors(newErr);

    return Object.values(newErr).every((m) => m === "");
  };

  /* ============================
     📝 Submit Create / Update
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";

      const url = formData.id
        ? `${API_URL}/sekolah/${formData.id}`
        : `${API_URL}/sekolah`;

      const body = new FormData();

      body.append("nama", formData.nama);
      body.append("alamat", formData.alamat);
      body.append("map", formData.map);
      body.append("telepon", formData.telepon);
      body.append("deskripsi", formData.deskripsi);
      body.append("sosMed", JSON.stringify(formData.sosMed));

      if (formData.gambar instanceof File) {
        body.append("gambar", formData.gambar);
      }

      const res = await fetch(url, {
        method,
        body,
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} – ${errorText}`);
      }

      // Ambil data terbaru
      const updated = await fetch(`${API_URL}/sekolah`, {
        credentials: "include",
      }).then((r) => r.json());

      const list = Array.isArray(updated.data)
        ? updated.data
        : updated;

      const normalizedList = list.map((item) => ({
        ...item,

        sosMed: item.sosMed
          ? typeof item.sosMed === "string"
            ? (() => {
                try {
                  return JSON.parse(item.sosMed);
                } catch {
                  return {
                    facebook: "",
                    whatsapp: "",
                    instagram: "",
                  };
                }
              })()
            : item.sosMed
          : {
              facebook: "",
              whatsapp: "",
              instagram: "",
            },
      }));

      setSekolahList(normalizedList);

      closeModal();

      Swal.fire({
        icon: "success",
        title: formData.id
          ? "Madrasah Berhasil Diperbarui"
          : "Madrasah Berhasil Disimpan",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("❌ Error submit Madrasah:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan Data",
        text: "Terjadi kesalahan saat menyimpan data Madrasah.",
        confirmButtonText: "OK",
      });
    }
  };

  /* ============================
     ✏️ Edit
  ============================ */
  const handleEdit = (sekolah) => {
    setFormData({
      id: sekolah.id ?? null,
      nama: sekolah.nama ?? "",
      alamat: sekolah.alamat ?? "",
      map: sekolah.map ?? "",
      telepon: sekolah.telepon ?? "",
      deskripsi: sekolah.deskripsi ?? "",
      gambar: "",

      sosMed: sekolah.sosMed || {
        facebook: "",
        whatsapp: "",
        instagram: "",
      },
    });

    setImgPreview(
      sekolah.gambar
        ? `${API_UPLOADS}/${sekolah.gambar}`
        : null
    );

    setErrors({
      nama: "",
      alamat: "",
      map: "",
      telepon: "",
      deskripsi: "",
      gambar: "",
    });

    setModalMode("edit");
  };

  /* ============================
     👁️ Preview
  ============================ */
  const handlePreview = (sekolah) => {
    setFormData({
      ...sekolah,

      sosMed: sekolah.sosMed || {
        facebook: "",
        whatsapp: "",
        instagram: "",
      },
    });

    setImgPreview(
      sekolah.gambar
        ? `${API_UPLOADS}/${sekolah.gambar}`
        : null
    );

    setModalMode("preview");
  };

  /* ============================
     🗑️ Hapus Sekolah
  ============================ */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin?",
      text: "Data Madrasah ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/sekolah/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              `HTTP ${res.status} – ${errorText}`
            );
          }

          return true;
        } catch (error) {
          console.error("❌ Error hapus Madrasah:", error);

          Swal.showValidationMessage(
            error.message || "Gagal menghapus data Madrasah"
          );

          return false;
        }
      },
    });

    if (result.isConfirmed) {
      setSekolahList((prev) =>
        prev.filter((item) => item.id !== id)
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data Madrasah berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  /* ============================
     🖼️ Upload Gambar
  ============================ */
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const isAllowed =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    const isMax1Mb = file.size <= 1 * 1024 * 1024;

    if (!isAllowed || !isMax1Mb) {
      setErrors((prev) => ({
        ...prev,
        gambar:
          "Format harus JPG/PNG/WebP dan ukuran maksimal 1MB.",
      }));

      setFormData((prev) => ({
        ...prev,
        gambar: "",
      }));

      setImgPreview(null);

      return;
    }

    setFormData((prev) => ({
      ...prev,
      gambar: file,
    }));

    setImgPreview(URL.createObjectURL(file));

    if (errors.gambar) {
      setErrors((prev) => ({
        ...prev,
        gambar: "",
      }));
    }
  };

  /* ============================
     ❌ Tutup Modal
  ============================ */
  const closeModal = () => {
    setModalMode(null);

    setFormData({
      id: null,
      nama: "",
      alamat: "",
      map: "",
      telepon: "",
      deskripsi: "",
      gambar: "",
      sosMed: {
        facebook: "",
        whatsapp: "",
        instagram: "",
      },
    });

    setImgPreview(null);

    setErrors({
      nama: "",
      alamat: "",
      map: "",
      telepon: "",
      deskripsi: "",
      gambar: "",
    });
  };

  return (
    <div className="sekolah-crud-container">
      {/* HEADER */}
      <div className="crud-header">
        <h2>Manajemen Madrasah</h2>

        <button
          className="btn-add"
          onClick={() => {
            setFormData({
              id: null,
              nama: "",
              alamat: "",
              map: "",
              telepon: "",
              deskripsi: "",
              gambar: "",
              sosMed: {
                facebook: "",
                whatsapp: "",
                instagram: "",
              },
            });

            setImgPreview(null);

            setErrors({
              nama: "",
              alamat: "",
              map: "",
              telepon: "",
              deskripsi: "",
              gambar: "",
            });

            setModalMode("edit");
          }}
        >
          <PlusCircle size={18} />
          Tambah Madrasah
        </button>
      </div>

      {/* TABEL */}
      <div className="table-wrapper">
        <table className="sekolah-table">
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
            {sekolahList.map((sekolah, index) => (
              <tr key={sekolah.id}>
                <td>{index + 1}</td>

                <td>{sekolah.nama}</td>

                <td>{sekolah.alamat}</td>

                <td>{sekolah.telepon}</td>

                <td>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        (sekolah.deskripsi || "").slice(0, 80) +
                        (sekolah.deskripsi?.length > 80
                          ? "…"
                          : ""),
                    }}
                  />
                </td>

                <td>
                  {sekolah.gambar ? (
                    <img
                      src={`${API_UPLOADS}/${sekolah.gambar}`}
                      alt="Madrasah"
                      style={{
                        width: "64px",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    "Tidak ada"
                  )}
                </td>

                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() =>
                        handlePreview(sekolah)
                      }
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() =>
                        handleEdit(sekolah)
                      }
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(sekolah.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {sekolahList.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  Belum ada data Madrasah
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>
                  {formData.id
                    ? "Edit Madrasah"
                    : "Tambah Madrasah"}
                </h3>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* NAMA */}
                  <label>
                    Nama Sekolah
                    <span className="required">*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        nama: e.target.value,
                      });

                      if (errors.nama) {
                        setErrors({
                          ...errors,
                          nama: "",
                        });
                      }
                    }}
                    required
                    aria-invalid={!!errors.nama}
                    className={
                      errors.nama ? "is-invalid" : ""
                    }
                  />

                  {errors.nama && (
                    <div className="error-text">
                      {errors.nama}
                    </div>
                  )}

                  {/* ALAMAT */}
                  <label>
                    Alamat
                    <span className="required">*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        alamat: e.target.value,
                      });

                      if (errors.alamat) {
                        setErrors({
                          ...errors,
                          alamat: "",
                        });
                      }
                    }}
                    required
                    aria-invalid={!!errors.alamat}
                    className={
                      errors.alamat
                        ? "is-invalid"
                        : ""
                    }
                  />

                  {errors.alamat && (
                    <div className="error-text">
                      {errors.alamat}
                    </div>
                  )}

                  {/* TELEPON */}
                  <label>
                    Telepon
                    <span className="required">*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        telepon: e.target.value,
                      });

                      if (errors.telepon) {
                        setErrors({
                          ...errors,
                          telepon: "",
                        });
                      }
                    }}
                    required
                    aria-invalid={!!errors.telepon}
                    className={
                      errors.telepon
                        ? "is-invalid"
                        : ""
                    }
                  />

                  {errors.telepon && (
                    <div className="error-text">
                      {errors.telepon}
                    </div>
                  )}

                  {/* PEMBATAS GRID */}
                  <div></div>

                  {/* GOOGLE MAP */}
                  <label>
                    Google Map
                    <span className="required">*</span>
                  </label>

                  <input
                    placeholder="Link Google Map"
                    type="text"
                    value={formData.map}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        map: e.target.value,
                      });

                      if (errors.map) {
                        setErrors({
                          ...errors,
                          map: "",
                        });
                      }
                    }}
                    required
                    aria-invalid={!!errors.map}
                    className={
                      errors.map
                        ? "is-invalid"
                        : ""
                    }
                  />

                  {/* DESKRIPSI */}
                  <label>
                    Deskripsi
                    <span className="required">*</span>
                  </label>

                  <JoditEditor
                    value={formData.deskripsi}
                    config={{
                      height: 400,
                      toolbarSticky: true,
                      readonly: false,
                      askBeforePasteHTML: false,
                      askBeforePasteFromWord: false,
                      disablePlugins: ["pasteStorage"],
                      defaultActionOnPaste:
                        "insert_as_html",
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
                      setFormData({
                        ...formData,
                        deskripsi: newContent,
                      });

                      if (errors.deskripsi) {
                        setErrors({
                          ...errors,
                          deskripsi: "",
                        });
                      }
                    }}
                  />

                  {errors.deskripsi && (
                    <div className="error-text">
                      {errors.deskripsi}
                    </div>
                  )}

                  {/* UPLOAD GAMBAR */}
                  <label>
                    Upload Gambar
                    <span className="required">*</span>
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    aria-invalid={!!errors.gambar}
                    className={
                      errors.gambar
                        ? "is-invalid"
                        : ""
                    }
                  />

                  {/* PREVIEW GAMBAR */}
                  {imgPreview ? (
                    <div className="preview-wrap">
                      <img
                        src={imgPreview}
                        alt="Preview"
                        className="preview-img"
                      />

                      <div className="image-hint">
                        Format JPG/PNG/WebP,
                        maksimal 1MB
                      </div>
                    </div>
                  ) : (
                    <div className="image-hint-inline">
                      Format JPG/PNG/WebP,
                      maksimal 1MB
                    </div>
                  )}

                  {errors.gambar && (
                    <div className="error-text">
                      {errors.gambar}
                    </div>
                  )}

                  {/* MEDIA SOSIAL */}
                  <h4 style={{ marginTop: 16 }}>
                    Media Sosial
                  </h4>

                  <label>Facebook</label>

                  <input
                    type="text"
                    placeholder="Link Facebook"
                    value={
                      formData.sosMed.facebook || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sosMed: {
                          ...formData.sosMed,
                          facebook:
                            e.target.value,
                        },
                      })
                    }
                  />

                  <label>WhatsApp</label>

                  <input
                    type="text"
                    placeholder="Link Nomor WhatsApp"
                    value={
                      formData.sosMed.whatsapp || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sosMed: {
                          ...formData.sosMed,
                          whatsapp:
                            e.target.value,
                        },
                      })
                    }
                  />

                  <label>Instagram</label>

                  <input
                    type="text"
                    placeholder="Link Instagram"
                    value={
                      formData.sosMed.instagram || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sosMed: {
                          ...formData.sosMed,
                          instagram:
                            e.target.value,
                        },
                      })
                    }
                  />

                  {/* ACTION */}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-save"
                    >
                      Simpan
                    </button>

                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* DETAIL / PREVIEW */}
                <div className="sekolah-detail-container">
                  {/* HEADER DETAIL */}
                  <div className="sekolah-header">
                    <div className="sekolah-image">
                      {imgPreview && (
                        <img
                          src={imgPreview}
                          alt={formData.nama}
                        />
                      )}
                    </div>

                    <div className="sekolah-header-info">
                      <h2>{formData.nama}</h2>

                      <div className="info-grid">
                        <div className="info-box">
                          <div>
                            <h5>Alamat</h5>
                            <p>
                              {formData.alamat}
                            </p>
                          </div>
                        </div>

                        <div className="info-box">
                          <div>
                            <h5>Telepon</h5>
                            <p>
                              {formData.telepon ||
                                "Belum tersedia"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MAP */}
                  {formData.map && (
                    <div className="sekolah-card">
                      <h4>Lokasi Sekolah</h4>

                      <iframe
                        className="sekolah-map"
                        src={formData.map}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Lokasi Sekolah"
                      />
                    </div>
                  )}

                  {/* DESKRIPSI */}
                  <div className="sekolah-card">
                    <h4>Deskripsi</h4>

                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          formData.deskripsi || "",
                      }}
                    />
                  </div>

                  {/* MEDIA SOSIAL */}
                  <div className="sekolah-card">
                    <h4>Media Sosial</h4>

                    <div className="social-buttons">
                      {formData.sosMed.facebook && (
                        <a
                          href={
                            formData.sosMed.facebook
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="facebook"
                        >
                          📘 Facebook
                        </a>
                      )}

                      {formData.sosMed.whatsapp && (
                        <a
                          href={`https://wa.me/${formData.sosMed.whatsapp.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="whatsapp"
                        >
                          WhatsApp
                        </a>
                      )}

                      {formData.sosMed.instagram && (
                        <a
                          href={
                            formData.sosMed.instagram
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="instagram"
                        >
                          Instagram
                        </a>
                      )}

                      {!formData.sosMed.facebook &&
                        !formData.sosMed.whatsapp &&
                        !formData.sosMed.instagram && (
                          <p>
                            Media sosial belum
                            tersedia.
                          </p>
                        )}
                    </div>
                  </div>

                  {/* TUTUP */}
                  <div className="form-actions">
                    <button
                      className="btn-cancel"
                      onClick={closeModal}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

