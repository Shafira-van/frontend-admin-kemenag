import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import JoditEditor from "jodit-react";
import Swal from "sweetalert2";
import "../styles/NewsCRUD.css";
import { API_URL, API_UPLOADS } from "../config";

const NewsCRUD = () => {
  const [newsList, setNewsList] = useState([]);
  const [tokenUser] = useState(localStorage.getItem("token"));
  const [filteredNews, setFilteredNews] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [satkerList, setSatkerList] = useState([]);

  // Data user login
  const [currentUser, setCurrentUser] = useState(null);
  const userRole = String(
    currentUser?.role || currentUser?.level || currentUser?.user_role || "",
  )
    .trim()
    .toLowerCase();

  const isEditor = userRole === "editor";
  const isSuperadmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";

  const canValidate = ["admin", "superadmin"].includes(userRole);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [satkerFilter, setSatkerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    date: "",
    id_satker: "",
    editor: "",
    content: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [errors, setErrors] = useState({
    title: "",
    date: "",
    id_satker: "",
    editor: "",
    content: "",
    image: "",
  });

  /* ============================================================
     👤 Fetch profil user dari localStorage id + token
  ============================================================ */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      if (!userId || !token) return;

      try {
        const res = await fetch(`${API_URL}/profilAdmin/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Gagal fetch profil user");
        const responseData = await res.json();
        const data = responseData?.data || responseData;

        console.log("=== DATA USER LOGIN ===");
        console.log("Response profil:", responseData);
        console.log("User:", data);
        console.log("Role:", data?.role);

        setCurrentUser(data);

        // Jika role editor, kunci satker
        if (
          String(data?.role || "")
            .trim()
            .toLowerCase() === "editor"
        ) {
          setSatkerFilter(data.id_satker);
          setFormData((prev) => ({
            ...prev,
            id_satker: data.id_satker,
          }));
        }
      } catch (err) {
        console.error("Error fetching profil user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  /* ============================================================
     📡 Fetch daftar satuan kerja
  ============================================================ */
  useEffect(() => {
    const fetchSatker = async () => {
      try {
        const res = await fetch(`${API_URL}/satuankerja/satker/all`, {
          headers: { Authorization: `Bearer ${tokenUser}` },
          credentials: "include",
        });
        const data = await res.json();
        setSatkerList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching satker:", err);
      }
    };
    fetchSatker();
  }, []);

  /* ============================================================
     📡 Fetch berita dengan pagination dari API
  ============================================================ */
  const fetchNews = async (
    page = 1,
    limit = itemsPerPage,
    id_satker = satkerFilter,
  ) => {
    try {
      let url = `${API_URL}/berita/admin/list?page=${page}&limit=${limit}`;
      // EDITOR → hanya berita satkernya sendiri
      if (isEditor && currentUser?.id_satker) {
        url += `&id_satker=${currentUser.id_satker}`;
      }

      // ADMIN & SUPERADMIN → semua satker
      else if ((isAdmin || isSuperadmin) && id_satker) {
        url += `&id_satker=${id_satker}`;
      }

      // Filter status
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokenUser}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal mengambil data berita");
      }

      const data = await res.json();

      console.log("=================================");
      console.log("DATA BERITA DARI API");
      console.log("URL:", url);
      console.log("RESPONSE:", data);
      console.log("DATA BERITA:", data.data);
      console.log("DATA BERITA PERTAMA:", data.data?.[0]);
      console.log("=================================");

      const allNews = Array.isArray(data.data) ? data.data : [];

      setNewsList(allNews);
      setFilteredNews(allNews);
      setTotalData(data.total || 0);
      setCurrentPage(data.page || page);
    } catch (err) {
      console.error("Error fetching berita:", err);
    }
  };

  useEffect(() => {
    if (currentUser === null && localStorage.getItem("id")) return;

    fetchNews(1, itemsPerPage, satkerFilter);
    setCurrentPage(1);
  }, [itemsPerPage, satkerFilter, statusFilter, currentUser]);

  /* ============================================================
     🔍 Filter lokal: search teks & tanggal
  ============================================================ */
  useEffect(() => {
    let result = [...newsList];

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const category = item.category?.toLowerCase() || "";
        const editor = item.editor?.toLowerCase() || "";
      
        return (
          title.includes(keyword) ||
          category.includes(keyword) ||
          editor.includes(keyword)
        );
      });
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      result = result.filter((item) => {
        const date = new Date(item.date);
        return date >= from && date <= to;
      });
    }

    setFilteredNews(result);
  }, [searchTerm, dateRange, newsList]);

  /* ============================================================
     📄 Total halaman & navigasi
  ============================================================ */
  const totalPages =
    itemsPerPage === 0 ? 1 : Math.ceil(totalData / itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchNews(page, itemsPerPage, satkerFilter);
  };

  const getPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(
        (page) =>
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 2 && page <= currentPage + 2),
      )
      .reduce((acc, page, idx, arr) => {
        if (idx > 0 && page - arr[idx - 1] > 1) acc.push("...");
        acc.push(page);
        return acc;
      }, []);
  };

  /* ============================================================
   ✅ VALIDASI FORM
============================================================ */
  const validate = () => {
    const newErrors = {
      title: "",
      date: "",
      id_satker: "",
      editor: "",
      content: "",
      image: "",
    };

    // =========================
    // JUDUL
    // =========================
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Judul wajib diisi.";
    }

    // =========================
    // TANGGAL
    // =========================
    if (!formData.date) {
      newErrors.date = "Tanggal wajib diisi.";
    }

    // =========================
    // SATUAN KERJA
    // =========================
    if (!formData.id_satker) {
      newErrors.id_satker = "Satuan kerja wajib dipilih.";
    }

    // =========================
    // EDITOR
    // =========================
    if (!formData.editor || !formData.editor.trim()) {
      newErrors.editor = "Editor wajib diisi.";
    }

    // =========================
    // ISI BERITA
    // =========================
    const textContent = (formData.content || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim();

    if (!textContent) {
      newErrors.content = "Isi berita wajib diisi.";
    }

    // =========================
    // VALIDASI GAMBAR
    // =========================
    const isCreate = !formData.id;
    const hasExistingImage = !!imagePreview;
    const hasNewFile = formData.image instanceof File;

    // Saat tambah → gambar wajib
    if (isCreate && !hasNewFile) {
      newErrors.image =
        "Gambar wajib diunggah (JPG/JPEG/PNG/WebP, maksimal 1 MB).";
    }

    // Saat edit → gambar baru tidak wajib
    // selama gambar lama masih tersedia
    if (!isCreate && !hasExistingImage && !hasNewFile) {
      newErrors.image =
        "Gambar wajib tersedia. Upload gambar baru jika gambar lama tidak ada.";
    }

    // =========================
    // VALIDASI FILE BARU
    // =========================
    if (hasNewFile) {
      const file = formData.image;

      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

      const allowedExtensions = /\.(jpe?g|png|webp)$/i;

      const isValidMime = allowedMimeTypes.includes(file.type);
      const isValidExtension = allowedExtensions.test(file.name);

      const maxSize = 1 * 1024 * 1024;
      const isValidSize = file.size <= maxSize;

      if (!isValidMime || !isValidExtension) {
        newErrors.image = "Format gambar harus JPG/JPEG, PNG, atau WebP.";
      } else if (!isValidSize) {
        newErrors.image = "Ukuran gambar maksimal 1 MB.";
      }
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((message) => message === "");
  };

  /* ============================================================
     📝 Submit tambah / edit
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id
        ? `${API_URL}/berita/${formData.id}`
        : `${API_URL}/berita`;

      const body = new FormData();
      body.append("title", formData.title || "");
      body.append("date", formData.date || "");
      // Editor hanya bisa pakai id_satker miliknya sendiri
      body.append(
        "id_satker",
        isEditor ? currentUser.id_satker : formData.id_satker,
      );
      body.append("editor", formData.editor || "");
      body.append("content", formData.content || "");

      if (formData.image instanceof File) body.append("image", formData.image);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${tokenUser}` },
        body,
        credentials: "include",
      });

      if (!res.ok) {
        let errorMessage = "Gagal menyimpan berita.";

        try {
          const errorData = await res.json();

          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      await fetchNews(currentPage, itemsPerPage, satkerFilter);
      closeModal();
      Swal.fire({
        icon: "success",
        title: "Berita Berhasil Disimpan",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("❌ Error saat submit berita:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan Berita",
        text: err.message || "Terjadi kesalahan pada server.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     ✏️ Edit berita
  ============================================================ */
  const handleEdit = (news) => {
    const dateValue = news.date
      ? new Date(news.date).toISOString().split("T")[0]
      : "";

    setFormData({
      id: news.id ?? null,
      title: news.title ?? "",
      date: dateValue,
      // Editor: paksa id_satker miliknya, selain itu pakai data berita
      id_satker: isEditor ? currentUser.id_satker : (news.id_satker ?? ""),
      editor: news.editor ?? "",
      content: news.content ?? "",
      image: "",
    });

    setImagePreview(
      news.image ? `${API_UPLOADS}/uploads/berita/${news.image}` : null,
    );
    setErrors({
      title: "",
      date: "",
      id_satker: "",
      editor: "",
      content: "",
      image: "",
    });
    setModalMode("edit");
  };

  /* ============================================================
     👁️ Preview berita
  ============================================================ */
  const handlePreview = (news) => {
    setFormData(news);
    setImagePreview(
      news.image ? `${API_UPLOADS}/uploads/berita/${news.image}` : null,
    );
    setModalMode("preview");
  };

  const handleValidate = async (news) => {
      if (String(news?.status || "").toLowerCase() !== "pending") {
        Swal.fire({
          icon: "info",
          title: "Tidak dapat divalidasi",
          text: "Hanya berita dengan status pending yang dapat diubah statusnya.",
          confirmButtonText: "OK",
        });
        return;
      }
    const currentStatus = String(news.status || "").toLowerCase();

    const result = await Swal.fire({
      title: "Ubah Status Berita",
      html: `
      <div style="text-align:left">
        <p><strong>${news.title}</strong></p>
        <p>Status saat ini:
          <strong>${currentStatus || "-"}</strong>
        </p>
        <p>Pilih tindakan untuk berita ini.</p>
      </div>
    `,
      icon: "question",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "✓ Setujui",
      denyButtonText: "✕ Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#198754",
      denyButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      await updateNewsStatus(news.id, "approved");
      return;
    }

    if (result.isDenied) {
      const rejectResult = await Swal.fire({
        title: "Tolak Berita",
        input: "textarea",
        inputLabel: "Alasan penolakan",
        inputPlaceholder: "Masukkan alasan penolakan...",
        inputAttributes: {
          "aria-label": "Alasan penolakan",
        },
        showCancelButton: true,
        confirmButtonText: "Tolak Berita",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc3545",
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return "Alasan penolakan wajib diisi.";
          }

          if (value.trim().length < 5) {
            return "Alasan penolakan minimal 5 karakter.";
          }

          return null;
        },
      });

      if (rejectResult.isConfirmed) {
        await updateNewsStatus(news.id, "rejected", rejectResult.value.trim());
      }
    }
  };

  const updateNewsStatus = async (id, status, rejectionReason = "") => {
    try {
      setLoading(true);

      const isApprove = status === "approved";

      const endpoint = isApprove
        ? `${API_URL}/berita/validation/${id}/approve`
        : `${API_URL}/berita/validation/${id}/reject`;

      const options = {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokenUser}`,
        },
        credentials: "include",
      };

      if (!isApprove) {
        options.headers["Content-Type"] = "application/json";

        options.body = JSON.stringify({
          rejection_reason: rejectionReason.trim(),
        });
      }

      const res = await fetch(endpoint, options);

      const text = await res.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message: text,
        };
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Gagal memperbarui status berita. HTTP ${res.status}`,
        );
      }

      await fetchNews(currentPage, itemsPerPage, satkerFilter);

      await Swal.fire({
        icon: "success",
        title: isApprove ? "Berita Disetujui" : "Berita Ditolak",
        text: isApprove
          ? "Berita berhasil disetujui."
          : "Berita berhasil ditolak.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("❌ Error update status:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal memperbarui status berita.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     🗑️ Hapus berita
  ============================================================ */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin?",
      text: "Berita ini akan dihapus permanen!",
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
          const res = await fetch(`${API_URL}/berita/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenUser}` },
            credentials: "include",
          });
          if (!res.ok) throw new Error("Gagal menghapus data");
          return true;
        } catch (error) {
          Swal.showValidationMessage(error.message);
        }
      },
    });

    if (result.isConfirmed) {
      const newTotal = totalData - 1;
      const maxPage =
        itemsPerPage === 0 ? 1 : Math.ceil(newTotal / itemsPerPage);
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      await fetchNews(targetPage, itemsPerPage, satkerFilter);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Berita berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  /* ============================================================
   🖼️ VALIDASI & PREVIEW GAMBAR
============================================================ */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    const allowedExtensions = /\.(jpe?g|png|webp)$/i;

    const isValidMime = allowedMimeTypes.includes(file.type);
    const isValidExtension = allowedExtensions.test(file.name);

    const maxSize = 1 * 1024 * 1024;
    const isValidSize = file.size <= maxSize;

    // =========================
    // FORMAT SALAH
    // =========================
    if (!isValidMime || !isValidExtension) {
      setErrors((prev) => ({
        ...prev,
        image: "Format gambar harus JPG/JPEG, PNG, atau WebP.",
      }));

      setFormData((prev) => ({
        ...prev,
        image: "",
      }));

      e.target.value = "";
      return;
    }

    // =========================
    // UKURAN TERLALU BESAR
    // =========================
    if (!isValidSize) {
      setErrors((prev) => ({
        ...prev,
        image: "Ukuran gambar maksimal 1 MB.",
      }));

      setFormData((prev) => ({
        ...prev,
        image: "",
      }));

      e.target.value = "";
      return;
    }

    // =========================
    // FILE VALID
    // =========================
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* ============================================================
     ❌ Tutup modal
  ============================================================ */
  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      title: "",
      date: "",
      // Editor: reset ke id_satker miliknya
      id_satker: isEditor ? currentUser?.id_satker || "" : "",
      editor: "",
      content: "",
      image: "",
    });
    setImagePreview(null);
    setErrors({
      title: "",
      date: "",
      id_satker: "",
      editor: "",
      content: "",
      image: "",
    });
  };

  /* ============================================================
     🔍 Nama satker untuk ditampilkan di field terkunci (editor)
  ============================================================ */
  const getSatkerName = (id_satker) => {
    const found = satkerList.find((s) => s.id_satker === id_satker);
    return found ? found.name : currentUser?.nama_satker || id_satker;
  };

  /* ============================================================
     🧩 Render UI
  ============================================================ */
  return (
    <div className="news-crud-container">
      <div className="crud-header">
        <h2>Manajemen Berita</h2>
        <button className="btn-add" onClick={() => setModalMode("edit")}>
          <PlusCircle size={18} /> Tambah Berita
        </button>
      </div>

      {/* === FILTER BAR === */}
      <div className="filter-bar">
        <div className="filter-group">
          {/* SEARCH */}
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari judul, kategori, atau deskripsi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-inline">
            {/* SATUAN KERJA */}
            <div className="filter-item">
              <label>Satuan Kerja</label>

              {isEditor ? (
                <input
                  type="text"
                  value={getSatkerName(currentUser?.id_satker)}
                  disabled
                  className="input-locked"
                />
              ) : (
                <select
                  value={satkerFilter}
                  onChange={(e) => {
                    setSatkerFilter(e.target.value);
                    setCurrentPage(1);
                  }}>
                  <option value="">Semua</option>

                  {satkerList.map((s) => (
                    <option key={s.id_satker} value={s.id_satker}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* TAMPILKAN */}
            <div className="filter-item">
              <label>Tampilkan</label>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>Semua</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="filter-item">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}>
                <option value="">Semua Status</option>
                <option value="pending">Validasi</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            {/* PERIODE */}
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

      {/* === TABEL BERITA === */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Satuan Kerja</th>
              <th>Tanggal</th>
              <th>Editor</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.length > 0 ? (
              filteredNews.map((news, index) => (
                <tr key={news.id}>
                  <td>
                    {itemsPerPage === 0
                      ? index + 1
                      : (currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td>{news.title}</td>
                  <td>{news.category}</td>
                  <td>
                    {news.date
                      ? new Date(news.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td>{news.editor}</td>
                  <td className="status-cell">
                    <div className="status-wrapper">
                      {/* PENDING */}
                      {String(news.status).toLowerCase() === "pending" ? (
                        canValidate ? (
                          <button
                            type="button"
                            className="status-badge status-pending status-clickable"
                            onClick={() => handleValidate(news)}
                            title="Validasi berita"
                            disabled={loading}>
                            <CheckCircle size={15} />
                            <span>Validasi</span>
                          </button>
                        ) : (
                          <span className="status-badge status-pending">
                            <Clock3 size={15} />
                            <span>Menunggu</span>
                          </span>
                        )
                      ) : null}

                      {/* APPROVED */}
                      {/* APPROVED */}
                      {String(news.status).toLowerCase() === "approved" && (
                        <span className="status-badge status-approved">
                          <CheckCircle size={15} />
                          <span>Disetujui</span>
                        </span>
                      )}

                      {/* REJECTED */}
                      {String(news.status).toLowerCase() === "rejected" && (
                        <button
                          type="button"
                          className="status-badge status-rejected status-rejected-clickable"
                          onClick={() =>
                            Swal.fire({
                              icon: "error",
                              title: "Alasan Penolakan",
                              text:
                                news?.rejection_reason ||
                                "Tidak ada alasan penolakan.",
                              confirmButtonText: "Tutup",
                              confirmButtonColor: "#6c757d",
                            })
                          }
                          title="Klik untuk melihat alasan penolakan">
                          <XCircle size={15} />
                          <span>Ditolak</span>
                        </button>
                      )}

                      {/* STATUS KOSONG */}
                      {!news.status && (
                        <span className="status-badge status-empty">-</span>
                      )}
                    </div>
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      {/* Preview */}
                      <button
                        className="btn-view"
                        onClick={() => handlePreview(news)}
                        title="Lihat berita">
                        <Eye size={16} />
                      </button>

                      {/* Edit */}
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(news)}
                        title="Edit berita">
                        <Edit size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(news.id)}
                        title="Hapus berita">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-text">
                  Tidak ada berita ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === PAGINATION NAVIGASI === */}
      {itemsPerPage !== 0 && totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalData)} dari {totalData}{" "}
            berita
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
                  className={`btn-page ${currentPage === item ? "active" : ""}`}
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

      {/* === MODAL TAMBAH / EDIT / PREVIEW === */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Berita" : "Tambah Berita"}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div>
                    <label>
                      Judul Berita<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: "" });
                      }}
                      required
                      aria-invalid={!!errors.title}
                      className={errors.title ? "is-invalid" : ""}
                    />
                    {errors.title && (
                      <div className="error-text">{errors.title}</div>
                    )}
                  </div>

                  <div className="form-grid">
                    <div>
                      <label>
                        Tanggal<span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: "" });
                        }}
                        required
                        aria-invalid={!!errors.date}
                        className={errors.date ? "is-invalid" : ""}
                      />
                      {errors.date && (
                        <div className="error-text">{errors.date}</div>
                      )}
                    </div>

                    <div>
                      <label>
                        Satuan Kerja<span className="required">*</span>
                      </label>
                      {/* Editor: tampilkan input terkunci dengan nama satkernya */}
                      {isEditor ? (
                        <>
                          <input
                            type="text"
                            value={getSatkerName(currentUser?.id_satker)}
                            disabled
                            className="input-locked"
                          />
                          {/* Hidden input tetap kirim id_satker yang benar */}
                          <input
                            type="hidden"
                            value={currentUser?.id_satker || ""}
                          />
                        </>
                      ) : (
                        <select
                          value={formData.id_satker}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              id_satker: e.target.value,
                            });
                            if (errors.id_satker)
                              setErrors({ ...errors, id_satker: "" });
                          }}
                          required
                          aria-invalid={!!errors.id_satker}
                          className={errors.id_satker ? "is-invalid" : ""}>
                          <option value="">-- Pilih Satuan Kerja --</option>
                          {satkerList.map((s) => (
                            <option key={s.id_satker} value={s.id_satker}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.id_satker && (
                        <div className="error-text">{errors.id_satker}</div>
                      )}
                    </div>

                    <div>
                      <label>
                        Editor<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.editor}
                        onChange={(e) => {
                          setFormData({ ...formData, editor: e.target.value });
                          if (errors.editor)
                            setErrors({ ...errors, editor: "" });
                        }}
                        required
                        aria-invalid={!!errors.editor}
                        className={errors.editor ? "is-invalid" : ""}
                      />
                      {errors.editor && (
                        <div className="error-text">{errors.editor}</div>
                      )}
                    </div>

                    <div>
                      <label>
                        Gambar<span className="required">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        aria-invalid={!!errors.image}
                        className={errors.image ? "is-invalid" : ""}
                      />
                      {imagePreview && (
                        <div className="preview-wrap">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="preview-img"
                          />
                          <div className="image-hint">
                            Format JPG/JPEG/PNG/WebP, maksimal 1 MB
                          </div>
                        </div>
                      )}
                      {!imagePreview && (
                        <div className="image-hint-inline">
                          Format JPG/JPEG/PNG/WebP, maksimal 1 MB
                        </div>
                      )}
                      {errors.image && (
                        <div className="error-text">{errors.image}</div>
                      )}
                    </div>
                  </div>

                  <label>
                    Isi Berita<span className="required">*</span>
                  </label>
                  <JoditEditor
                    value={formData.content}
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
                      setFormData({ ...formData, content: newContent });
                      if (errors.content) setErrors({ ...errors, content: "" });
                    }}
                  />
                  {errors.content && (
                    <div className="error-text">{errors.content}</div>
                  )}

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={loading}>
                      {loading ? "Menyimpan..." : "Simpan"}
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
                  <strong>Kategori:</strong> {formData.category}
                </p>
                <p>
                  <strong>Editor:</strong> {formData.editor}
                </p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={formData.title}
                    className="preview-img"
                  />
                )}
                <div
                  className="news-content"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
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

export default NewsCRUD;
