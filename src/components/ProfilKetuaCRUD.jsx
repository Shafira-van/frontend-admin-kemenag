import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, Search } from "lucide-react";
import "../styles/ProfilKetuaCRUD.css";
import { API_URL } from "../config";

const ProfilKetuaCRUD = () => {
  const [profilList, setProfilList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalMode, setModalMode] = useState(null); // "edit" | "preview"

  // filter / ui states
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ from: "", to: "" }); // optional if API provides date

  // form + errors
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    year: "",
    date: "", // optional — kept for parity with NewsCRUD (can be unused)
  });
  const [errors, setErrors] = useState({
    name: "",
    year: "",
  });

  /* =========================
     Fetch data (with optional limit)
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${API_URL}/profilketua`;
        if (itemsPerPage && Number(itemsPerPage) > 0) {
          url = `${API_URL}/profilketua?limit=${itemsPerPage}`;
        }
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        // some APIs wrap in .data, handle both
        const list = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : data;
        setProfilList(list);
        setFilteredList(list);
      } catch (err) {
        console.error("Error fetching profil ketua:", err);
      }
    };

    fetchData();
  }, [itemsPerPage]);

  /* =========================
     Filter (search + dateRange)
  ========================= */
  useEffect(() => {
    let result = [...profilList];

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const name = p.name?.toLowerCase() || "";
        const year = p.year?.toLowerCase?.() || String(p.year || "");
        return name.includes(q) || year.includes(q);
      });
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      result = result.filter((p) => {
        const d = p.date ? new Date(p.date) : null;
        return d && d >= from && d <= to;
      });
    }

    setFilteredList(result);
  }, [searchTerm, dateRange, profilList]);

  /* =========================
     Validasi form
  ========================= */
  const validate = () => {
    const newErr = { name: "", year: "" };
    if (!formData.name || !formData.name.trim())
      newErr.name = "Nama wajib diisi.";
    if (!formData.year || !formData.year.trim())
      newErr.year = "Tahun jabatan wajib diisi.";
    setErrors(newErr);
    return Object.values(newErr).every((v) => v === "");
  };

  /* =========================
     Submit (create / update)
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/profilketua/${formData.id}`
        : `${API_URL}/profilketua`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          year: formData.year,
          date: formData.date || undefined,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} — ${txt}`);
      }

      // refresh list
      const updatedRes = await fetch(
        itemsPerPage && Number(itemsPerPage) > 0
          ? `${API_URL}/profilketua?limit=${itemsPerPage}`
          : `${API_URL}/profilketua`,
        { credentials: "include" }
      );
      const updatedData = await updatedRes.json();
      const list = Array.isArray(updatedData.data)
        ? updatedData.data
        : Array.isArray(updatedData)
        ? updatedData
        : updatedData;
      setProfilList(list);
      setFilteredList(list);
      closeModal();
      alert("✅ Data profil ketua berhasil disimpan!");
    } catch (err) {
      console.error("Error submit profil ketua:", err);
      alert("Gagal menyimpan. Cek console untuk detail.");
    }
  };

  /* =========================
     Edit / Preview / Delete
  ========================= */
  const handleEdit = (profil) => {
    const dateValue = profil.date
      ? new Date(profil.date).toISOString().split("T")[0]
      : "";
    setFormData({
      id: profil.id ?? null,
      name: profil.name ?? "",
      year: profil.year ?? "",
      date: dateValue,
    });
    setErrors({ name: "", year: "" });
    setModalMode("edit");
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data ketua ini?")) return;
    try {
      await fetch(`${API_URL}/profilketua/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setProfilList((prev) => prev.filter((p) => p.id !== id));
      setFilteredList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus data. Cek console.");
    }
  };

  /* =========================
     Close modal / reset
  ========================= */
  const closeModal = () => {
    setModalMode(null);
    setFormData({ id: null, name: "", year: "", date: "" });
    setErrors({ name: "", year: "" });
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="profilketua-container">
      <div className="crud-header">
        <h2>Manajemen Profil Ketua</h2>
        <button
          className="btn-add"
          onClick={() => {
            setFormData({ id: null, name: "", year: "", date: "" });
            setModalMode("edit");
          }}>
          <PlusCircle size={18} /> Tambah Ketua
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama atau tahun..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-inline">
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

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Ketua</th>
              <th>Tahun Jabatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((profil, idx) => (
              <tr key={profil.id}>
                <td>{idx + 1}</td>
                <td>{profil.name}</td>
                <td>{profil.year}</td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(profil)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(profil.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredList.length === 0 && (
          <p className="empty-text">Tidak ada data profil ketua ditemukan.</p>
        )}
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Ketua" : "Tambah Ketua"}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div>
                    <label>
                      Nama Ketua<span className="required">*</span>
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
                  </div>

                  <div className="form-grid">
                    <div>
                      <label>
                        Tahun Jabatan<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 2023 - 2025"
                        value={formData.year}
                        onChange={(e) => {
                          setFormData({ ...formData, year: e.target.value });
                          if (errors.year) setErrors({ ...errors, year: "" });
                        }}
                        required
                        aria-invalid={!!errors.year}
                        className={errors.year ? "is-invalid" : ""}
                      />
                      {errors.year && (
                        <div className="error-text">{errors.year}</div>
                      )}
                    </div>
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
                <h3>Detail Profil Ketua</h3>
                <p>
                  <strong>Nama Ketua:</strong> {formData.name}
                </p>
                <p>
                  <strong>Tahun Jabatan:</strong> {formData.year}
                </p>
                {formData.date && (
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {new Date(formData.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                <div style={{ textAlign: "right", marginTop: 12 }}>
                  <button className="btn-cancel" onClick={closeModal}>
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilKetuaCRUD;
