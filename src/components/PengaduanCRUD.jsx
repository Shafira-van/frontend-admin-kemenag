import React, { useState, useEffect } from "react";
import "../styles/PengaduanCRUD.css";
import { Eye, Trash2, Search } from "lucide-react";
import { API_URL } from "../config";

const PengaduanCRUD = () => {
  const [pengaduanList, setPengaduanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalData, setModalData] = useState(null);

  // Filter bar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Fetch data
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

  // Kombinasi filter
  useEffect(() => {
    let result = [...pengaduanList];

    // search by nama/email/pesan
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter((i) => {
        const nama = i.nama?.toLowerCase() || "";
        const email = i.email?.toLowerCase() || "";
        const pesan = i.pesan?.toLowerCase() || "";
        return nama.includes(q) || email.includes(q) || pesan.includes(q);
      });
    }

    // status filter
    if (statusFilter) {
      result = result.filter(
        (i) => (i.status || "MENUNGGU").toUpperCase() === statusFilter
      );
    }

    // date range filter
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      result = result.filter((i) => {
        const d = i.tanggal ? new Date(i.tanggal) : null;
        return d && d >= from && d <= to;
      });
    }

    // limit (client-side)
    const limited =
      itemsPerPage && Number(itemsPerPage) > 0
        ? result.slice(0, Number(itemsPerPage))
        : result;

    setFilteredList(limited);
  }, [searchTerm, statusFilter, dateRange, itemsPerPage, pengaduanList]);

  // Hapus pengaduan
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengaduan ini?"))
      return;
    await fetch(`${API_URL}/pengaduan/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setPengaduanList((prev) => prev.filter((n) => n.id !== id));
  };

  // Lihat detail
  const handleView = (data) => setModalData(data);
  const closeModal = () => setModalData(null);

  // Ganti status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/pengaduan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPengaduanList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Gagal memperbarui status:", err);
      alert("Gagal memperbarui status.");
    }
  };

  return (
    <div className="pengaduan-crud-container">
      <div className="crud-header">
        <h2>Manajemen Pengaduan</h2>
      </div>

      {/* === FILTER BAR === */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama, email, atau isi pengaduan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-inline">
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

            <div className="filter-item date-range">
              <label>Periode</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                />
                <span>–</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === TABLE === */}
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
            {filteredList.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
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

        {filteredList.length === 0 && (
          <p className="empty-text">Tidak ada pengaduan ditemukan.</p>
        )}
      </div>

      {/* === MODAL DETAIL === */}
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
