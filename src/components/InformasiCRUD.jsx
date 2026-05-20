import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../styles/InformasiCRUD.css";
import { API_URL } from "../config";

const InformasiCRUD = () => {
  const [informasiList, setInformasiList] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);

  const [modalMode, setModalMode] = useState(null);

  // FILTER
  const [searchTerm, setSearchTerm] = useState("");
  const [infoTypeFilter, setInfoTypeFilter] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // FORM
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    date: "",
    info_types: "",
    file: "",
  });

  const [filePreview, setFilePreview] = useState(null);

  // ERRORS
  const [errors, setErrors] = useState({
    title: "",
    date: "",
    info_types: "",
    file: "",
  });

  /* ============================================================
     FETCH DATA
  ============================================================ */
  useEffect(() => {
    const fetchInformasi = async () => {
      try {
        const res = await fetch(`${API_URL}/informasi`, {
          credentials: "include",
        });

        const data = await res.json();

        const list = Array.isArray(data.data) ? data.data : data;

        setInformasiList(list);
        setFilteredInfo(list);
      } catch (err) {
        console.error("Error fetching informasi:", err);
      }
    };

    fetchInformasi();
  }, []);

  /* ============================================================
     FILTER
  ============================================================ */
  useEffect(() => {
    let result = [...informasiList];

    // SEARCH
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();

      result = result.filter((item) => {
        const title = item.title?.toLowerCase() || "";

        const type = item.info_types?.toLowerCase() || "";

        return title.includes(keyword) || type.includes(keyword);
      });
    }

    // FILTER JENIS INFORMASI
    if (infoTypeFilter) {
      result = result.filter(
        (item) =>
          (item.info_types || "").toLowerCase() ===
          infoTypeFilter.toLowerCase(),
      );
    }

    // DATE RANGE
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);

      const to = new Date(dateRange.to);

      result = result.filter((item) => {
        const d = item.date ? new Date(item.date) : null;

        return d && d >= from && d <= to;
      });
    }

    setFilteredInfo(result);
    setCurrentPage(1);
  }, [searchTerm, infoTypeFilter, dateRange, informasiList]);

  /* ============================================================
     VALIDATE
  ============================================================ */
  const validate = () => {
    const newErr = {
      title: "",
      date: "",
      info_types: "",
      file: "",
    };

    if (!formData.title?.trim()) {
      newErr.title = "Judul wajib diisi.";
    }

    if (!formData.date) {
      newErr.date = "Tanggal wajib diisi.";
    }

    if (!formData.info_types) {
      newErr.info_types = "Jenis informasi wajib dipilih.";
    }

    const isCreate = !formData.id;

    const hasExistingFile = !!filePreview;

    const hasNewFile = formData.file instanceof File;

    if (
      (isCreate && !hasNewFile) ||
      (!isCreate && !hasExistingFile && !hasNewFile)
    ) {
      newErr.file = "File wajib diunggah (PDF maksimal 5MB).";
    }

    if (hasNewFile) {
      const f = formData.file;

      const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);

      const isMax5Mb = f.size <= 5 * 1024 * 1024;

      if (!isPdf || !isMax5Mb) {
        newErr.file = "Format harus PDF dan ukuran maksimal 5MB.";
      }
    }

    setErrors(newErr);

    return Object.values(newErr).every((m) => m === "");
  };

  /* ============================================================
     SUBMIT
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const method = formData.id ? "PUT" : "POST";

      const url = formData.id
        ? `${API_URL}/informasi/${formData.id}`
        : `${API_URL}/informasi`;

      const body = new FormData();

      body.append("title", formData.title || "");

      body.append("date", formData.date || "");

      body.append("info_types", formData.info_types || "");

      if (formData.file instanceof File) {
        body.append("file", formData.file);
      }

      const res = await fetch(url, {
        method,
        body,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // REFRESH
      const updated = await fetch(`${API_URL}/informasi`, {
        credentials: "include",
      }).then((r) => r.json());

      const list = Array.isArray(updated.data) ? updated.data : updated;

      setInformasiList(list);
      setFilteredInfo(list);

      closeModal();

      alert("✅ Informasi berhasil disimpan!");
    } catch (err) {
      console.error("❌ Error submit informasi:", err);

      alert("Gagal menyimpan informasi.");
    }
  };

  /* ============================================================
     EDIT
  ============================================================ */
  const handleEdit = (info) => {
    const dateValue = info.date
      ? new Date(info.date).toISOString().split("T")[0]
      : "";

    setFormData({
      id: info.id ?? null,
      title: info.title ?? "",
      date: dateValue,
      info_types: info.info_types ?? "",
      file: "",
    });

    setFilePreview(info.file_url || `${API_URL}/${info.file_path}`);

    setErrors({
      title: "",
      date: "",
      info_types: "",
      file: "",
    });

    setModalMode("edit");
  };

  /* ============================================================
     DELETE
  ============================================================ */
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data informasi ini?")) return;

    await fetch(`${API_URL}/informasi/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setInformasiList((prev) => prev.filter((n) => n.id !== id));

    setFilteredInfo((prev) => prev.filter((n) => n.id !== id));
  };

  /* ============================================================
     FILE CHANGE
  ============================================================ */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    const isMax5Mb = file.size <= 5 * 1024 * 1024;

    if (!isPdf || !isMax5Mb) {
      setErrors((prev) => ({
        ...prev,
        file: "Format harus PDF dan ukuran maksimal 5MB.",
      }));

      setFormData((prev) => ({
        ...prev,
        file: "",
      }));

      setFilePreview(null);

      return;
    }

    setFormData((prev) => ({
      ...prev,
      file,
    }));

    setFilePreview(URL.createObjectURL(file));

    if (errors.file) {
      setErrors((prev) => ({
        ...prev,
        file: "",
      }));
    }
  };

  /* ============================================================
     CLOSE MODAL
  ============================================================ */
  const closeModal = () => {
    setModalMode(null);

    setFormData({
      id: null,
      title: "",
      date: "",
      info_types: "",
      file: "",
    });

    setFilePreview(null);

    setErrors({
      title: "",
      date: "",
      info_types: "",
      file: "",
    });
  };

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalData = filteredInfo.length;

  const totalPages =
    itemsPerPage === 0 ? 1 : Math.ceil(filteredInfo.length / itemsPerPage);

  const startIndex = itemsPerPage === 0 ? 0 : (currentPage - 1) * itemsPerPage;

  const currentData =
    itemsPerPage === 0
      ? filteredInfo
      : filteredInfo.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="informasi-crud-container">
      {/* HEADER */}
      <div className="crud-header">
        <h2>Manajemen Informasi</h2>

        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} />
          Tambah Informasi
        </button>
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        <div className="filter-group">
          {/* SEARCH */}
          <div className="search-box">
            <Search size={16} />

            <input
              type="text"
              placeholder="Cari judul / jenis informasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-inline">
            {/* JENIS INFORMASI */}
            <div className="filter-item">
              <label>Jenis Informasi</label>

              <select
                value={infoTypeFilter}
                onChange={(e) => setInfoTypeFilter(e.target.value)}>
                <option value="">Semua</option>

                <option value="Berkala">Berkala</option>

                <option value="Setiap Saat">Setiap Saat</option>

                <option value="Serta Merta">Serta Merta</option>
              </select>
            </div>

            {/* ITEMS */}
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

            {/* DATE */}
            <div className="filter-item date-range">
              <label>Periode</label>

              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      from: e.target.value,
                    })
                  }
                />

                <span>–</span>

                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      to: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="informasi-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Tanggal</th>
              <th>Jenis Informasi</th>
              <th>File</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((info, idx) => (
              <tr key={info.id}>
                <td>{startIndex + idx + 1}</td>

                <td>{info.title}</td>

                <td>
                  {info.date
                    ? new Date(info.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </td>

                <td>{info.info_types || "-"}</td>

                <td>
                  {info.file_path ? (
                    <a
                      href={info.file_url || `${API_URL}/${info.file_path}`}
                      target="_blank"
                      rel="noreferrer">
                      Lihat File
                    </a>
                  ) : (
                    "Tidak ada"
                  )}
                </td>

                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(info)}>
                      <Edit size={16} />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(info.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY */}
        {filteredInfo.length === 0 && (
          <p className="empty-text">Tidak ada informasi ditemukan.</p>
        )}

        {/* PAGINATION */}
        {itemsPerPage !== 0 && totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalData)}{" "}
              dari {totalData} informasi
            </span>

            <div className="pagination-controls">
              <button
                className="btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`btn-page ${
                      currentPage === item ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(item)}>
                    {item}
                  </button>
                ),
              )}

              <button
                className="btn-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>{formData.id ? "Edit Informasi" : "Tambah Informasi"}</h3>

            <form onSubmit={handleSubmit} noValidate>
              {/* TITLE */}
              <div>
                <label>
                  Judul Informasi
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* GRID */}
              <div className="form-grid">
                {/* DATE */}
                <div>
                  <label>Tanggal</label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* TYPE */}
                <div>
                  <label>Jenis Informasi</label>

                  <select
                    value={formData.info_types}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        info_types: e.target.value,
                      })
                    }>
                    <option value="">Pilih</option>

                    <option value="Berkala">Berkala</option>

                    <option value="Setiap Saat">Setiap Saat</option>

                    <option value="Serta Merta">Serta Merta</option>
                  </select>
                </div>

                {/* FILE */}
                <div>
                  <label>File</label>

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                  />

                  {filePreview && (
                    <div className="preview-wrap">
                      <iframe
                        src={filePreview}
                        title="Preview File"
                        className="preview-file"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION */}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default InformasiCRUD;
