import React, { useState, useEffect } from "react";
import "../styles/PengaduanCRUD.css";
import { Eye, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "../config";

const PengaduanCRUD = () => {
  const [pengaduanList, setPengaduanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalData, setModalData] = useState(null);

  // FILTER
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // FETCH DATA
  useEffect(() => {
    const fetchPengaduan = async () => {
      try {
        const res = await fetch(`${API_URL}/pengaduan`, {
          credentials: "include",
        });

        const data = await res.json();

        const list = Array.isArray(data.data) ? data.data : data;

        setPengaduanList(list);
        setFilteredList(list);
      } catch (err) {
        console.error("Error fetching pengaduan:", err);
      }
    };

    fetchPengaduan();
  }, []);

  // FILTERING
  useEffect(() => {
    let result = [...pengaduanList];

    // SEARCH
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();

      result = result.filter((i) => {
        const nama = i.nama?.toLowerCase() || "";
        const email = i.email?.toLowerCase() || "";
        const pesan = i.pesan?.toLowerCase() || "";

        return nama.includes(q) || email.includes(q) || pesan.includes(q);
      });
    }

    // STATUS FILTER
    if (statusFilter) {
      result = result.filter(
        (i) => (i.status || "MENUNGGU").toUpperCase() === statusFilter,
      );
    }

    // DATE RANGE
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);

      result = result.filter((i) => {
        const d = i.tanggal ? new Date(i.tanggal) : null;

        return d && d >= from && d <= to;
      });
    }

    // IMPORTANT
    setFilteredList(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange, pengaduanList]);

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengaduan ini?"))
      return;

    try {
      await fetch(`${API_URL}/pengaduan/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setPengaduanList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // VIEW DETAIL
  const handleView = (data) => setModalData(data);

  const closeModal = () => setModalData(null);

  // CHANGE STATUS
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/pengaduan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setPengaduanList((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Gagal memperbarui status:", err);

      alert("Gagal memperbarui status.");
    }
  };

  // ================= PAGINATION =================

  const totalData = filteredList.length;

  const totalPages =
    itemsPerPage === 0 ? 1 : Math.ceil(filteredList.length / itemsPerPage);

  const startIndex = itemsPerPage === 0 ? 0 : (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const currentData =
    itemsPerPage === 0
      ? filteredList
      : filteredList.slice(startIndex, endIndex);

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

  return (
    <div className="pengaduan-crud-container">
      {/* HEADER */}
      <div className="crud-header">
        <h2>Manajemen Pengaduan</h2>
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        <div className="filter-group">
          {/* SEARCH */}
          <div className="search-box">
            <Search size={16} />

            <input
              type="text"
              placeholder="Cari nama, email, atau isi pengaduan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* INLINE FILTER */}
          <div className="filter-inline">
            {/* STATUS */}
            <div className="filter-item">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Semua</option>

                <option value="MENUNGGU">Menunggu</option>

                <option value="PROSES">Proses</option>

                <option value="SELESAI">Selesai</option>
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
        <table className="pengaduan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((p, index) => (
              <tr key={p.id}>
                <td>{startIndex + index + 1}</td>

                <td>{p.nama}</td>

                <td>{p.email}</td>

                <td>
                  {p.tanggal
                    ? new Date(p.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </td>

                <td>
                  <select
                    value={(p.status || "MENUNGGU").toUpperCase()}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`status-select ${(
                      p.status || "MENUNGGU"
                    ).toLowerCase()}`}>
                    <option value="MENUNGGU">Menunggu</option>

                    <option value="PROSES">Proses</option>

                    <option value="SELESAI">Selesai</option>
                  </select>
                </td>

                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleView(p)}
                      title="Lihat detail">
                      <Eye size={16} />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(p.id)}
                      title="Hapus pengaduan">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY */}
        {filteredList.length === 0 && (
          <p className="empty-text">Tidak ada pengaduan ditemukan.</p>
        )}

        {/* PAGINATION */}
        {itemsPerPage !== 0 && totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalData)}{" "}
              dari {totalData} pengaduan
            </span>

            <div className="pagination-controls">
              {/* PREV */}
              <button
                className="btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </button>

              {/* PAGE NUMBER */}
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

              {/* NEXT */}
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
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detail Pengaduan</h3>

            <p>
              <strong>Nama:</strong> {modalData.nama}
            </p>

            <p>
              <strong>Email:</strong> {modalData.email}
            </p>

            <p>
              <strong>Pesan:</strong> {modalData.pesan}
            </p>

            <p>
              <strong>Tanggal:</strong>{" "}
              {modalData.tanggal
                ? new Date(modalData.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status-badge ${(
                  modalData.status || "MENUNGGU"
                ).toLowerCase()}`}>
                {modalData.status || "MENUNGGU"}
              </span>
            </p>

            <button className="btn-cancel" onClick={closeModal}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengaduanCRUD;
