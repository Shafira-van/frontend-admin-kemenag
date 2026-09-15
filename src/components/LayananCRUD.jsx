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
  Clock3,
  XCircle,
} from "lucide-react";
import JoditEditor from "jodit-react";
import "../styles/LayananCRUD.css";
import { API_URL } from "../config";
import Swal from "sweetalert2";

const LayananCRUD = () => {
  // ============================================================
  // DATA
  // ============================================================
  const [layananList, setLayananList] = useState([]);
  const [filteredLayanan, setFilteredLayanan] = useState([]);
  const [satkerList, setSatkerList] = useState([]);

  // ============================================================
  // USER / ROLE
  // ============================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const isAdmin = userRole === "admin";
  const isSuperadmin = userRole === "superadmin";
  const isEditor = userRole === "editor";
  const canValidate = ["admin", "superadmin"].includes(userRole);

  // ============================================================
  // MODAL
  // ============================================================
  const [modalMode, setModalMode] = useState(null);

  // ============================================================
  // FILTER
  // ============================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [satkerFilter, setSatkerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // PERBAIKAN: state pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // FORM
  // ============================================================
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    id_satker: "",
    desc: "",
    procedure: "",
    requirements: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    id_satker: "",
    desc: "",
    procedure: "",
    requirements: "",
  });

  // ============================================================
  // HELPER JWT
  // ============================================================
  const getJwtPayload = () => {
    if (!token) return null;

    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        throw new Error("Token JWT tidak valid");
      }

      const base64Url = parts[1];

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Gagal membaca JWT:", error);
      return null;
    }
  };

  // ============================================================
  // FETCH USER / ROLE
  // ============================================================
  useEffect(() => {
    if (!token) return;

    const loadUser = async () => {
      try {
        const payload = getJwtPayload();

        let user = payload || {};

        // Ambil profil terbaru dari database
        if (userId) {
          try {
            const profileRes = await fetch(`${API_URL}/profilAdmin/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            });

            if (profileRes.ok) {
              const profileData = await profileRes.json();

              const profile =
                profileData?.data || profileData?.user || profileData;

              if (profile && typeof profile === "object") {
                user = {
                  ...payload,
                  ...profile,
                };
              }
            }
          } catch (profileError) {
            console.warn("Profil admin tidak berhasil diambil:", profileError);
          }
        }

        const role = String(
          user?.role || user?.level || user?.user_role || payload?.role || "",
        )
          .trim()
          .toLowerCase();

        setCurrentUser(user);
        setUserRole(role);

        console.log("Current User:", user);
        console.log("Role:", role);
        console.log("ID Satker:", user?.id_satker);
      } catch (error) {
        console.error("Gagal membaca user:", error);

        setCurrentUser(null);
        setUserRole("");
      }
    };

    loadUser();
  }, [token, userId]);

  // ============================================================
  // FETCH SATUAN KERJA
  // ============================================================
  useEffect(() => {
    if (!token) return;

    const fetchSatker = async () => {
      try {
        const res = await fetch(`${API_URL}/satuankerja`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setSatkerList(list);
      } catch (err) {
        console.error("Error fetching satuan kerja:", err);

        setSatkerList([]);

        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Satker",
          text: "Data satuan kerja tidak dapat diambil dari server.",
          confirmButtonText: "OK",
        });
      }
    };

    fetchSatker();
  }, [token]);

  // ============================================================
  // HELPER NAMA SATKER
  // ============================================================
  const getSatkerName = (idSatker) => {
    if (!idSatker) return "-";

    const satker = satkerList.find(
      (item) =>
        String(item?.id_satker ?? item?.id ?? item?.kode) === String(idSatker),
    );

    if (!satker) return idSatker;

    return (
      satker?.nama ||
      satker?.name ||
      satker?.nama_satker ||
      satker?.nama_satuan_kerja ||
      satker?.satuan_kerja ||
      satker?.nama_unit ||
      satker?.id_satker ||
      "-"
    );
  };

  // ============================================================
  // FETCH LAYANAN
  // ============================================================
  const fetchLayanan = async () => {
    try {
      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_URL}/layanan?limit=0`;

      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();

        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      let visibleList = list;

      // Editor hanya melihat satker sendiri
      if (isEditor) {
        visibleList = list.filter(
          (item) =>
            String(item?.id_satker || "") ===
            String(currentUser?.id_satker || ""),
        );
      }

      setLayananList(visibleList);

      console.log("Response API Layanan:", data);

      console.log("Jumlah data:", visibleList.length);
    } catch (err) {
      console.error("Error fetching layanan:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Layanan",
        text: "Data layanan tidak dapat dimuat.",
        confirmButtonText: "OK",
      });
    }
  };

  // ============================================================
  // LOAD LAYANAN
  // ============================================================
  useEffect(() => {
    if (!token) return;

    if (!userRole || !currentUser) return;

    fetchLayanan();
  }, [token, userRole, currentUser?.id_satker]);

  // ============================================================
  // FILTER SEARCH + SATKER + STATUS
  // ============================================================
  useEffect(() => {
    let result = [...layananList];

    // SEARCH
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.trim().toLowerCase();

      result = result.filter((item) => {
        const title = String(item?.title || "").toLowerCase();

        const namaSatker = String(
          item?.category || item?.nama_satker || item?.satker_nama || "",
        ).toLowerCase();

        const idSatker = String(item?.id_satker || "").toLowerCase();

        return (
          title.includes(keyword) ||
          namaSatker.includes(keyword) ||
          idSatker.includes(keyword)
        );
      });
    }

    // SATKER
    if (!isEditor && satkerFilter) {
      result = result.filter(
        (item) => String(item?.id_satker || "") === String(satkerFilter),
      );
    }

    // STATUS
    if (statusFilter) {
      result = result.filter(
        (item) =>
          String(item?.status || "pending").toLowerCase() ===
          String(statusFilter).toLowerCase(),
      );
    }

    // PRIORITAS STATUS
    result.sort((a, b) => {
      const statusA = String(a?.status || "pending").toLowerCase();

      const statusB = String(b?.status || "pending").toLowerCase();

      const priority = {
        pending: 1,
        menunggu: 1,
        rejected: 2,
        ditolak: 2,
        approved: 3,
        disetujui: 3,
      };

      const priorityA = priority[statusA] || 99;

      const priorityB = priority[statusB] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return Number(b?.id || 0) - Number(a?.id || 0);
    });

    setFilteredLayanan(result);
    setCurrentPage(1);
  }, [searchTerm, satkerFilter, statusFilter, layananList, isEditor]);

  // ============================================================
  // RESET PAGE SAAT JUMLAH DATA BERUBAH
  // ============================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // ============================================================
  // VALIDATE FORM
  // ============================================================
  const validate = () => {
    const newErr = {
      title: "",
      id_satker: "",
      desc: "",
      procedure: "",
      requirements: "",
    };

    if (!formData.title?.trim()) {
      newErr.title = "Judul wajib diisi.";
    }

    if (!formData.id_satker) {
      newErr.id_satker = "Satuan kerja wajib dipilih.";
    }

    // Editor hanya boleh menggunakan
    // satker miliknya sendiri
    if (isEditor) {
      if (!currentUser?.id_satker) {
        newErr.id_satker = "Satker akun editor tidak ditemukan.";
      } else if (String(formData.id_satker) !== String(currentUser.id_satker)) {
        newErr.id_satker = "Editor hanya dapat menggunakan Satker sendiri.";
      }
    }

    const cleanText = (html) =>
      (html || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

    if (!cleanText(formData.desc)) {
      newErr.desc = "Deskripsi wajib diisi.";
    }

    if (!cleanText(formData.procedure)) {
      newErr.procedure = "Prosedur wajib diisi.";
    }

    if (!cleanText(formData.requirements)) {
      newErr.requirements = "Syarat wajib diisi.";
    }

    setErrors(newErr);

    return Object.values(newErr).every((message) => message === "");
  };

  // ============================================================
  // SUBMIT CREATE / UPDATE
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEditor && !currentUser?.id_satker) {
      Swal.fire({
        icon: "error",
        title: "Satker Tidak Ditemukan",
        text: "Akun editor belum memiliki id_satker. Silakan hubungi administrator.",
        confirmButtonText: "OK",
      });

      return;
    }

    const isEdit = !!formData.id;

    try {
      const method = isEdit ? "PUT" : "POST";

      const url = isEdit
        ? `${API_URL}/layanan/${formData.id}`
        : `${API_URL}/layanan`;

      const submitSatker = isEditor
        ? currentUser?.id_satker
        : formData.id_satker;

      const body = {
        title: formData.title || "",
        id_satker: submitSatker || "",
        desc: formData.desc || "",
        procedure: formData.procedure || "",
        requirements: formData.requirements || "",

        // Admin / Superadmin approved
        // Editor pending
        status: canValidate ? "approved" : "pending",
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            `HTTP ${response.status}`,
        );
      }

      await fetchLayanan();

      closeModal();

      Swal.fire({
        icon: "success",
        title: isEdit
          ? "Layanan Berhasil Diperbarui"
          : "Layanan Berhasil Disimpan",
        text: canValidate
          ? "Layanan langsung berstatus disetujui."
          : isEdit
            ? "Layanan kembali berstatus menunggu dan harus divalidasi."
            : "Layanan berhasil disimpan dan menunggu validasi.",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error submit layanan:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan Layanan",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
        confirmButtonText: "OK",
      });
    }
  };

  // ============================================================
  // TAMBAH
  // ============================================================
  const handleAdd = () => {
    if (isEditor && !currentUser?.id_satker) {
      Swal.fire({
        icon: "error",
        title: "Satker Tidak Ditemukan",
        text: "Akun editor belum memiliki Satker. Silakan hubungi administrator.",
        confirmButtonText: "OK",
      });

      return;
    }

    setFormData({
      id: null,
      title: "",
      id_satker: isEditor ? currentUser?.id_satker || "" : "",
      desc: "",
      procedure: "",
      requirements: "",
    });

    setErrors({
      title: "",
      id_satker: "",
      desc: "",
      procedure: "",
      requirements: "",
    });

    setModalMode("edit");
  };

  // ============================================================
  // EDIT
  // ============================================================
  const handleEdit = (item) => {
    if (
      isEditor &&
      String(item?.id_satker || "") !== String(currentUser?.id_satker || "")
    ) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda hanya dapat mengedit layanan dari Satker sendiri.",
        confirmButtonText: "OK",
      });

      return;
    }

    setFormData({
      id: item?.id ?? null,
      title: item?.title ?? "",
      id_satker: isEditor
        ? currentUser?.id_satker || ""
        : (item?.id_satker ?? ""),
      desc: item?.desc ?? "",
      procedure: item?.procedure ?? "",
      requirements: item?.requirements ?? "",
    });

    setErrors({
      title: "",
      id_satker: "",
      desc: "",
      procedure: "",
      requirements: "",
    });

    setModalMode("edit");
  };

  // ============================================================
  // PREVIEW
  // ============================================================
  const handlePreview = (item) => {
    setFormData({
      id: item?.id ?? null,
      title: item?.title ?? "",
      id_satker: item?.id_satker ?? "",
      desc: item?.desc ?? "",
      procedure: item?.procedure ?? "",
      requirements: item?.requirements ?? "",
    });

    setModalMode("preview");
  };

  // ============================================================
  // DELETE
  // ============================================================
  const handleDelete = async (item) => {
    if (
      isEditor &&
      String(item?.id_satker || "") !== String(currentUser?.id_satker || "")
    ) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda hanya dapat menghapus layanan dari Satker sendiri.",
        confirmButtonText: "OK",
      });

      return;
    }

    const result = await Swal.fire({
      title: "Yakin?",
      text: "Layanan ini akan dihapus permanen!",
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
          const res = await fetch(`${API_URL}/layanan/${item.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const responseData = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(
              responseData?.message ||
                responseData?.error ||
                `HTTP ${res.status}`,
            );
          }

          return true;
        } catch (error) {
          console.error("Error hapus layanan:", error);

          Swal.showValidationMessage(
            error.message || "Gagal menghapus layanan",
          );

          return false;
        }
      },
    });

    if (result.isConfirmed) {
      await fetchLayanan();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Layanan berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  // ============================================================
  // STATUS
  // ============================================================
  const getStatus = (item) => String(item?.status || "pending").toLowerCase();

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";

      case "rejected":
        return "Ditolak";

      default:
        return "Menunggu";
    }
  };

  // ============================================================
  // VALIDASI LAYANAN
  // ============================================================
  const handleValidate = async (item) => {
    if (!canValidate) return;

    const status = getStatus(item);

    if (status !== "pending") {
      Swal.fire({
        icon: "info",
        title: "Tidak Dapat Divalidasi",
        text: "Hanya layanan dengan status pending yang dapat diubah statusnya.",
        confirmButtonText: "OK",
      });

      return;
    }

    const result = await Swal.fire({
      title: "Ubah Status Layanan",

      html: `
        <div style="text-align:left">
          <p>
            <strong>
              ${item?.title || "-"}
            </strong>
          </p>

          <p>
            Status saat ini:
            <strong>${status}</strong>
          </p>

          <p>
            Pilih tindakan untuk layanan ini.
          </p>
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
      await updateLayananStatus(item.id, "approve");

      return;
    }

    if (result.isDenied) {
      const rejectResult = await Swal.fire({
        title: "Tolak Layanan",

        input: "textarea",

        inputLabel: "Alasan penolakan",

        inputPlaceholder: "Masukkan alasan penolakan...",

        inputAttributes: {
          "aria-label": "Alasan penolakan",
        },

        showCancelButton: true,

        confirmButtonText: "Tolak Layanan",

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
        await updateLayananStatus(
          item.id,
          "rejected",
          rejectResult.value.trim(),
        );
      }
    }
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================
  const updateLayananStatus = async (id, status, rejectionReason = "") => {
    try {
      const authToken = localStorage.getItem("token");

      const isApprove = status === "approve";

      const endpoint = isApprove
        ? `${API_URL}/layanan/validation/${id}/approve`
        : `${API_URL}/layanan/validation/${id}/reject`;

      const options = {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${authToken}`,
        },

        credentials: "include",
      };

      if (!isApprove) {
        options.headers["Content-Type"] = "application/json";

        options.body = JSON.stringify({
          rejection_reason: rejectionReason.trim(),
        });
      }

      const response = await fetch(endpoint, options);

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            `HTTP ${response.status}`,
        );
      }

      await fetchLayanan();

      await Swal.fire({
        icon: "success",

        title: isApprove ? "Layanan Disetujui" : "Layanan Ditolak",

        text: isApprove
          ? "Layanan berhasil disetujui."
          : "Layanan berhasil ditolak.",

        timer: 1800,

        showConfirmButton: false,
      });

      return true;
    } catch (error) {
      console.error("Error update status layanan:", error);

      Swal.fire({
        icon: "error",

        title: "Gagal",

        text: error.message || "Gagal mengubah status layanan.",

        confirmButtonText: "OK",
      });

      return false;
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const closeModal = () => {
    setModalMode(null);

    setFormData({
      id: null,
      title: "",
      id_satker: "",
      desc: "",
      procedure: "",
      requirements: "",
    });

    setErrors({
      title: "",
      id_satker: "",
      desc: "",
      procedure: "",
      requirements: "",
    });
  };

  // ============================================================
  // TRUNCATE HTML
  // ============================================================
  const truncateHTML = (html, wordLimit = 12) => {
    const text = (html || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    const words = text.split(/\s+/);

    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "…"
      : text;
  };

  // ============================================================
  // JODIT CONFIG
  // ============================================================
  const joditConfig = {
    height: 400,
    toolbarSticky: true,
    readonly: false,

    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,

    disablePlugins: ["pasteStorage"],

    defaultActionOnPaste: "insert_as_html",

    pasteHTMLActionList: ["insert_as_html", "insert_clear_html"],

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
  };

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalData = filteredLayanan.length;

  const totalPages =
    itemsPerPage === 0
      ? 1
      : Math.max(1, Math.ceil(filteredLayanan.length / itemsPerPage));

  const startIndex = itemsPerPage === 0 ? 0 : (currentPage - 1) * itemsPerPage;

  const currentData =
    itemsPerPage === 0
      ? filteredLayanan
      : filteredLayanan.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

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

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="layanan-crud-container">
      {/* HEADER */}
      <div className="crud-header">
        <h2>Manajemen Layanan</h2>

        <button className="btn-add" onClick={handleAdd}>
          <PlusCircle size={18} />
          Tambah Layanan
        </button>
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-box">
            <Search size={16} />

            <input
              type="text"
              placeholder="Cari judul atau satuan kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-inline">
            {/* SATKER */}
            {!isEditor && (
              <div className="filter-item">
                <label>Satuan Kerja</label>

                <select
                  value={satkerFilter}
                  onChange={(e) => setSatkerFilter(e.target.value)}>
                  <option value="">Semua Satker</option>

                  {satkerList.map((satker) => {
                    const id = satker?.id_satker ?? satker?.id ?? satker?.kode;

                    const nama =
                      satker?.nama ||
                      satker?.name ||
                      satker?.nama_satker ||
                      satker?.nama_satuan_kerja ||
                      satker?.satuan_kerja ||
                      id;

                    return (
                      <option key={id} value={id}>
                        {nama}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* STATUS */}
            <div className="filter-item">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Semua Status</option>

                <option value="pending">
                  {canValidate ? "Validasi" : "Menunggu"}
                </option>

                <option value="rejected">Ditolak</option>

                <option value="approved">Disetujui</option>
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
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="layanan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Satuan Kerja</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((layanan, index) => {
              const status = getStatus(layanan);

              const isPending = status === "pending";

              return (
                <tr key={layanan.id}>
                  <td>{startIndex + index + 1}</td>

                  <td>{layanan.title || "-"}</td>

                  <td>
                    {layanan.category ||
                      layanan.nama_satker ||
                      getSatkerName(layanan.id_satker)}
                  </td>

                  <td>{truncateHTML(layanan.desc, 12) || "-"}</td>

                  {/* STATUS */}
                  <td className="status-cell">
                    {canValidate && isPending ? (
                      <button
                        type="button"
                        className="status-badge status-pending status-clickable"
                        onClick={() => handleValidate(layanan)}
                        title="Klik untuk validasi">
                        <Clock3 size={14} />
                        Validasi
                      </button>
                    ) : status === "rejected" ? (
                      <button
                        type="button"
                        className="status-badge status-rejected status-rejected-clickable"
                        onClick={() =>
                          Swal.fire({
                            icon: "error",
                            title: "Alasan Penolakan",
                            text:
                              layanan?.rejection_reason ||
                              "Tidak ada alasan penolakan.",
                            confirmButtonText: "Tutup",
                            confirmButtonColor: "#6c757d",
                          })
                        }
                        title="Klik untuk melihat alasan penolakan">
                        <XCircle size={14} />
                        Ditolak
                      </button>
                    ) : (
                      <span className={`status-badge status-${status}`}>
                        {status === "approved" && <CheckCircle size={14} />}

                        {status === "pending" && <Clock3 size={14} />}

                        {getStatusLabel(status)}
                      </span>
                    )}
                  </td>

                  {/* AKSI */}
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handlePreview(layanan)}
                        title="Lihat">
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(layanan)}
                        title="Edit">
                        <Edit size={16} />
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(layanan)}
                        title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLayanan.length === 0 && (
          <p className="empty-text">Tidak ada layanan ditemukan.</p>
        )}

        {/* PAGINATION */}
        {itemsPerPage !== 0 && totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalData)}{" "}
              dari {totalData} layanan
            </span>

            <div className="pagination-controls">
              <button
                className="btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="page-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`btn-page ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}>
                    {page}
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
            {modalMode === "edit" ? (
              <>
                <h3>{formData.id ? "Edit Layanan" : "Tambah Layanan"}</h3>

                <form onSubmit={handleSubmit} noValidate>
                  {/* TITLE */}
                  <div>
                    <label>
                      Judul Layanan
                      <span className="required">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        });

                        if (errors.title) {
                          setErrors({
                            ...errors,
                            title: "",
                          });
                        }
                      }}
                      required
                      aria-invalid={!!errors.title}
                      className={errors.title ? "is-invalid" : ""}
                    />

                    {errors.title && (
                      <div className="error-text">{errors.title}</div>
                    )}
                  </div>

                  {/* SATKER */}
                  <div>
                    <label>
                      Satuan Kerja
                      <span className="required">*</span>
                    </label>

                    {isEditor ? (
                      <>
                        <select value={formData.id_satker} disabled>
                          {formData.id_satker ? (
                            <option value={formData.id_satker}>
                              {getSatkerName(formData.id_satker)}
                            </option>
                          ) : (
                            <option value="">Satker belum ditemukan</option>
                          )}
                        </select>

                        <small
                          style={{
                            display: "block",
                            marginTop: "5px",
                          }}>
                          Satker otomatis mengikuti satuan kerja akun Editor.
                        </small>

                        {!currentUser?.id_satker && (
                          <small className="error-text">
                            ID Satker akun Editor belum ditemukan.
                          </small>
                        )}
                      </>
                    ) : (
                      <select
                        value={formData.id_satker}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            id_satker: e.target.value,
                          });

                          if (errors.id_satker) {
                            setErrors({
                              ...errors,
                              id_satker: "",
                            });
                          }
                        }}
                        required
                        aria-invalid={!!errors.id_satker}
                        className={errors.id_satker ? "is-invalid" : ""}>
                        <option value="">Pilih Satker</option>

                        {satkerList.map((satker) => {
                          const id =
                            satker?.id_satker ?? satker?.id ?? satker?.kode;

                          const nama =
                            satker?.nama ||
                            satker?.name ||
                            satker?.nama_satker ||
                            satker?.nama_satuan_kerja ||
                            satker?.satuan_kerja ||
                            id;

                          return (
                            <option key={id} value={id}>
                              {nama}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {errors.id_satker && (
                      <div className="error-text">{errors.id_satker}</div>
                    )}
                  </div>

                  {/* DESKRIPSI */}
                  <div>
                    <label>
                      Deskripsi
                      <span className="required">*</span>
                    </label>

                    <textarea
                      rows={3}
                      value={formData.desc}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          desc: e.target.value,
                        });

                        if (errors.desc) {
                          setErrors({
                            ...errors,
                            desc: "",
                          });
                        }
                      }}
                      required
                      aria-invalid={!!errors.desc}
                      className={errors.desc ? "is-invalid" : ""}
                    />

                    {errors.desc && (
                      <div className="error-text">{errors.desc}</div>
                    )}
                  </div>

                  {/* PROSEDUR */}
                  <div>
                    <label>
                      Prosedur
                      <span className="required">*</span>
                    </label>

                    <JoditEditor
                      value={formData.procedure}
                      config={joditConfig}
                      onBlur={(content) => {
                        setFormData({
                          ...formData,
                          procedure: content,
                        });

                        if (errors.procedure) {
                          setErrors({
                            ...errors,
                            procedure: "",
                          });
                        }
                      }}
                    />

                    {errors.procedure && (
                      <div className="error-text">{errors.procedure}</div>
                    )}
                  </div>

                  {/* SYARAT */}
                  <div>
                    <label>
                      Syarat
                      <span className="required">*</span>
                    </label>

                    <JoditEditor
                      value={formData.requirements}
                      config={joditConfig}
                      onBlur={(content) => {
                        setFormData({
                          ...formData,
                          requirements: content,
                        });

                        if (errors.requirements) {
                          setErrors({
                            ...errors,
                            requirements: "",
                          });
                        }
                      }}
                    />

                    {errors.requirements && (
                      <div className="error-text">{errors.requirements}</div>
                    )}
                  </div>

                  {/* INFO STATUS */}
                  <div
                    style={{
                      marginTop: "10px",
                      marginBottom: "5px",
                    }}>
                    <small>
                      {canValidate
                        ? "Data yang disimpan oleh Admin/Superadmin langsung berstatus Disetujui."
                        : "Data yang disimpan oleh Editor berstatus Menunggu dan harus divalidasi Admin/Superadmin."}
                    </small>
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
              </>
            ) : (
              /* =================================================
                 PREVIEW
              ================================================= */
              <>
                <h3>{formData.title}</h3>

                <p>
                  <strong>Satuan Kerja:</strong>{" "}
                  {getSatkerName(formData.id_satker)}
                </p>

                <p>
                  <strong>Deskripsi:</strong> {formData.desc || "-"}
                </p>

                <h4>Prosedur</h4>

                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.procedure || "-",
                  }}
                />

                <h4>Syarat</h4>

                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.requirements || "-",
                  }}
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

export default LayananCRUD;
