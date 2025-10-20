import React, { useState, useEffect } from "react";
import "../styles/PengaduanCRUD.css";
import { Eye, Trash2 } from "lucide-react";

const API_URL = "http://localhost:3000/api/pengaduan";

const PengaduanCRUD = () => {
  const [pengaduanList, setPengaduanList] = useState([]);
  const [modalData, setModalData] = useState(null);

  // Ambil data pengaduan dari API
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setPengaduanList(data))
      .catch((err) => console.error("Error fetching pengaduan:", err));
  }, []);

  // Hapus pengaduan
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengaduan ini?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setPengaduanList(pengaduanList.filter((n) => n.id !== id));
    }
  };

  // Lihat detail
  const handleView = (data) => {
    setModalData(data);
  };

  const closeModal = () => setModalData(null);

  // 🔄 Ganti status dari dropdown
  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // Update frontend
      setPengaduanList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Gagal memperbarui status:", err);
    }
  };

  return (
    <div className="pengaduan-crud-container">
      <div className="crud-header">
        <h2>Manajemen Pengaduan</h2>
      </div>

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
            {pengaduanList.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.nama}</td>
                <td>{p.email}</td>
                <td>
                  {new Date(p.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`status-select ${p.status.toLowerCase()}`}>
                    <option value="MENUNGGU">Menunggu</option>
                    <option value="PROSES">Proses</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                </td>
                <td className="action-buttons">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
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
              {new Date(modalData.tanggal).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status-badge ${modalData.status.toLowerCase()}`}>
                {modalData.status}
              </span>
            </p>
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button className="btn-cancel" onClick={closeModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengaduanCRUD;
