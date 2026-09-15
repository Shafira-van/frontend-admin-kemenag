import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";

import "../styles/InformasiCRUD.css";
import { API_URL } from "../config";

const InformasiCRUD = () => {
  // ============================================================
  // DATA
  // ============================================================
  const [informasiList, setInformasiList] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);

  // ============================================================
  // MODAL
  // ============================================================
  const [modalMode, setModalMode] = useState(null);

  // ============================================================
  // USER / ROLE
  // ============================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [satkerList, setSatkerList] = useState([]);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const isAdmin = userRole === "admin";
  const isSuperadmin = userRole === "superadmin";
  const isEditor = userRole === "editor";

  const canValidate = ["admin", "superadmin"].includes(userRole);

  // ============================================================
  // FILTER
  // ============================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [infoTypeFilter, setInfoTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
const [satkerFilter, setSatkerFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  // ============================================================
  // PAGINATION
  // ============================================================
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // FORM
  // ============================================================
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    date: "",
    info_types: "",
    id_satker: "",
    file: "",
  });

  const [filePreview, setFilePreview] = useState(null);

  // ============================================================
  // ERRORS
  // ============================================================
  const [errors, setErrors] = useState({
    title: "",
    date: "",
    info_types: "",
    id_satker: "",
    file: "",
  });

  // ============================================================
  // HELPER TOKEN JWT
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
      console.error("❌ Gagal membaca JWT:", error);
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

        console.log("===== JWT USER =====");
        console.log("JWT Payload:", payload);

        let user = payload || {};

        /*
         * Coba ambil profil terbaru dari backend.
         * Ini penting agar id_satker editor berasal dari database,
         * bukan hanya bergantung pada isi JWT.
         */
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

              console.log("📥 Response Profil Admin:", profileData);

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
            console.warn(
              "⚠️ Profil admin tidak berhasil diambil:",
              profileError,
            );
          }
        }

        const role = String(
          user?.role || user?.level || user?.user_role || payload?.role || "",
        )
          .trim()
          .toLowerCase();

        setCurrentUser(user);
        setUserRole(role);

        console.log("👤 Current User:", user);
        console.log("🔐 Role:", role);
        console.log("🏢 ID Satker:", user?.id_satker);
      } catch (error) {
        console.error("❌ Gagal membaca user:", error);

        setCurrentUser(null);
        setUserRole("");
      }
    };

    loadUser();
  }, [token, userId]);

  // ============================================================
  // FETCH SATKER
  // ============================================================
  useEffect(() => {
    if (!token) return;

    const fetchSatker = async () => {
      try {
        console.log(
          "🏢 Mengambil data Satker dari:",
          `${API_URL}/satuankerja/satker/all`,
        );

        const response = await fetch(`${API_URL}/satuankerja/satker/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          credentials: "include",
        });

        const responseText = await response.text();

        console.log("📥 Response Satker:", responseText);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${responseText}`);
        }

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("Response Satker bukan JSON yang valid.");
        }

        /*
         * Mendukung beberapa bentuk response:
         *
         * [
         *   {...}
         * ]
         *
         * {
         *   data: [...]
         * }
         *
         * {
         *   satker: [...]
         * }
         */
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.satker)
              ? data.satker
              : Array.isArray(data?.rows)
                ? data.rows
                : [];

        console.log("🏢 Daftar Satker:", list);
        console.log("🏢 Jumlah Satker:", list.length);

        setSatkerList(list);

        if (list.length === 0) {
          console.warn("⚠️ Data Satker kosong.");
        }
      } catch (error) {
        console.error("❌ Gagal mengambil data Satker:", error);

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
  // CARI NAMA SATKER
  // ============================================================
  const getSatkerName = (idSatker) => {
    if (!idSatker) return "-";

    const satker = satkerList.find(
      (item) =>
        String(item?.id_satker ?? item?.id ?? item?.kode) === String(idSatker),
    );

    if (!satker) {
      return idSatker;
    }

    return (
      satker.nama ||
      satker.name ||
      satker.nama_satker ||
      satker.nama_satuan_kerja ||
      satker.satuan_kerja ||
      satker.nama_unit ||
      satker.id_satker ||
      "-"
    );
  };

  // ============================================================
  // FETCH INFORMASI
  // ============================================================
  const fetchInformasi = async () => {
    try {
      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Editor: ambil hanya Berkala dari satker sendiri
      let url = `${API_URL}/informasi?limit=0`;

      if (isEditor && currentUser?.id_satker) {
        url += `&info_types=Berkala&id_satker=${currentUser.id_satker}`;
      }

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

      console.log("📥 Response API Informasi:", data);

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      console.log("📋 Total data dari API:", list.length);

      let visibleList = list;

      // ========================================================
      // EDITOR
      // HANYA BERKALA + SATKER SENDIRI
      // ========================================================
      if (isEditor) {
        visibleList = list.filter(
          (item) =>
            String(item.info_types || "").toLowerCase() === "berkala" &&
            String(item.id_satker) === String(currentUser?.id_satker),
        );

        console.log("🔐 Editor ID Satker:", currentUser?.id_satker);
        console.log("📋 Data Editor:", visibleList.length);
      }

      setInformasiList(visibleList);
    } catch (err) {
      console.error("❌ Error fetching informasi:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Informasi",
        text: "Data informasi tidak dapat dimuat.",
      });
    }
  };
  // ============================================================
  // LOAD INFORMASI SETELAH USER TERSEDIA
  // ============================================================
  useEffect(() => {
    if (!token) return;

    if (!userRole || !currentUser) return;

    fetchInformasi();
  }, [token, userRole, currentUser?.id_satker]);

  // ============================================================
  // FILTER INFORMASI
  // ============================================================
  useEffect(() => {
    let result = [...informasiList];

    // ========================================================
    // SEARCH
    // ========================================================

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.trim().toLowerCase();

      result = result.filter((item) => {
        const title = String(item.title || "").toLowerCase();
        const type = String(item.info_types || "").toLowerCase();
        const satker = String(
          item.nama_satker || item.satker_nama || item.id_satker || "",
        ).toLowerCase();

        return (
          title.includes(keyword) ||
          type.includes(keyword) ||
          satker.includes(keyword)
        );
      });
    }

    // ========================================================
    // FILTER JENIS INFORMASI
    // ========================================================

    if (infoTypeFilter) {
      result = result.filter(
        (item) =>
          String(item.info_types || "").toLowerCase() ===
          String(infoTypeFilter).toLowerCase(),
      );
    }

    // ========================================================
    // FILTER STATUS
    // ========================================================

    if (statusFilter) {
      result = result.filter(
        (item) =>
          String(item.status || "pending").toLowerCase() ===
          String(statusFilter).toLowerCase(),
      );
    }

    // ========================================================
// FILTER SATUAN KERJA
// KHUSUS ADMIN & SUPERADMIN
// ========================================================
if (!isEditor && satkerFilter) {
  result = result.filter(
    (item) =>
      String(item.id_satker || "") === String(satkerFilter)
  );
}
    // ========================================================
    // FILTER TANGGAL
    // ========================================================

    if (dateRange.from) {
      const from = new Date(`${dateRange.from}T00:00:00`);

      result = result.filter((item) => {
        if (!item.date) return false;

        const itemDate = new Date(item.date);

        return itemDate >= from;
      });
    }

    if (dateRange.to) {
      const to = new Date(`${dateRange.to}T23:59:59`);

      result = result.filter((item) => {
        if (!item.date) return false;

        const itemDate = new Date(item.date);

        return itemDate <= to;
      });
    }

    // ========================================================
    // URUTAN STATUS
    // ========================================================

    result.sort((a, b) => {
      const statusA = String(a.status || "pending").toLowerCase();
      const statusB = String(b.status || "pending").toLowerCase();

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

      // Prioritaskan status
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Jika status sama, tanggal terbaru di atas
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

    console.log("🔎 Hasil filter:", result.length);

    setFilteredInfo(result);

    // Set kembali ke halaman 1 setiap filter berubah
    setCurrentPage(1);
  },  [
  searchTerm,
  infoTypeFilter,
  statusFilter,
  satkerFilter,
  dateRange,
  informasiList,
  isEditor,
]);
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // ============================================================
  // VALIDATE FORM
  // ============================================================
  const validate = () => {
    const newErrors = {
      title: "",
      date: "",
      info_types: "",
      id_satker: "",
      file: "",
    };

    // ========================================================
    // TITLE
    // ========================================================
    if (!formData.title?.trim()) {
      newErrors.title = "Judul wajib diisi.";
    }

    // ========================================================
    // DATE
    // ========================================================
    if (!formData.date) {
      newErrors.date = "Tanggal wajib diisi.";
    }

    // ========================================================
    // TYPE
    // ========================================================
    if (!formData.info_types) {
      newErrors.info_types = "Jenis informasi wajib dipilih.";
    }

    // ========================================================
    // EDITOR -> HANYA BERKALA
    // ========================================================
    if (isEditor) {
      if (formData.info_types !== "Berkala") {
        newErrors.info_types =
          "Editor hanya dapat membuat informasi jenis Berkala.";
      }
    }

    // ========================================================
    // SATKER
    // ========================================================
    if (!formData.id_satker) {
      newErrors.id_satker = "Satker wajib dipilih.";
    }

    // ========================================================
    // EDITOR -> SATKER SENDIRI
    // ========================================================
    if (isEditor) {
      if (!currentUser?.id_satker) {
        newErrors.id_satker = "Satker akun editor tidak ditemukan.";
      } else if (String(formData.id_satker) !== String(currentUser.id_satker)) {
        newErrors.id_satker = "Editor hanya dapat menggunakan Satker sendiri.";
      }
    }

    // ========================================================
    // FILE
    // ========================================================
    const isCreate = !formData.id;

    const hasExistingFile = !!filePreview;

    const hasNewFile = formData.file instanceof File;

    if (
      (isCreate && !hasNewFile) ||
      (!isCreate && !hasExistingFile && !hasNewFile)
    ) {
      newErrors.file = "File wajib diunggah (PDF maksimal 5MB).";
    }

    // ========================================================
    // VALIDASI FILE BARU
    // ========================================================
    if (hasNewFile) {
      const file = formData.file;

      const isPdf =
        file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  

      const isMax5Mb = file.size <= 5 * 1024 * 1024;

      if (!isPdf) {
        newErrors.file = "Format file harus PDF.";
      } else if (!isMax5Mb) {
        newErrors.file = "Ukuran file maksimal 5MB.";
      }
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((message) => message === "");
  };

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    // ========================================================
    // PASTIKAN EDITOR MEMPUNYAI SATKER
    // ========================================================
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
        ? `${API_URL}/informasi/${formData.id}`
        : `${API_URL}/informasi`;

      const body = new FormData();

      body.append("title", formData.title || "");

      body.append("date", formData.date || "");

      // ======================================================
      // EDITOR SELALU BERKALA
      // ======================================================
      const submitInfoType = isEditor ? "Berkala" : formData.info_types || "";

      body.append("info_types", submitInfoType);

      // ======================================================
      // EDITOR SELALU SATKER SENDIRI
      // ======================================================
      const submitSatker = isEditor
        ? currentUser?.id_satker
        : formData.id_satker;

      body.append("id_satker", submitSatker || "");

      // ======================================================
      // STATUS
      // ADMIN & SUPERADMIN = LANGSUNG DISETUJUI
      // EDITOR = MENUNGGU VALIDASI
      // ======================================================
      const submitStatus = canValidate ? "approved" : "pending";

      body.append("status", submitStatus);

      // ======================================================
      // FILE
      // ======================================================
      if (formData.file instanceof File) {
        body.append("file", formData.file);
      }

      console.log("📤 SUBMIT INFORMASI:", {
        method,
        url,
        title: formData.title,
        date: formData.date,
        info_types: submitInfoType,
        id_satker: submitSatker,
        file: formData.file instanceof File ? formData.file.name : "file lama",
        role: userRole,
      });

      const response = await fetch(url, {
        method,
        body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const responseText = await response.text();

      console.log("📥 Response Submit:", responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} – ${responseText}`);
      }

      await fetchInformasi();

      closeModal();

     Swal.fire({
       icon: "success",
       title: isEdit
         ? "Informasi Berhasil Diperbarui"
         : "Informasi Berhasil Disimpan",
       text: canValidate
         ? "Informasi langsung berstatus disetujui."
         : isEdit
           ? "Informasi kembali berstatus menunggu dan harus divalidasi."
           : "Informasi berhasil disimpan dan menunggu validasi.",
       showConfirmButton: false,
       timer: 1800,
       timerProgressBar: true,
     });
    } catch (error) {
      console.error("❌ Error submit informasi:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan Informasi",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
        confirmButtonText: "OK",
      });
    }
  };

  // ============================================================
  // TAMBAH INFORMASI
  // ============================================================
  const handleAdd = () => {
    // ========================================================
    // EDITOR HARUS MEMPUNYAI SATKER
    // ========================================================
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
      date: "",
      info_types: isEditor ? "Berkala" : "",
      id_satker: isEditor ? currentUser?.id_satker || "" : "",
      file: "",
    });

    setFilePreview(null);

    setErrors({
      title: "",
      date: "",
      info_types: "",
      id_satker: "",
      file: "",
    });

    setModalMode("edit");
  };

  // ============================================================
  // EDIT
  // ============================================================
  const handleEdit = (info) => {
    // ========================================================
    // EDITOR HANYA BOLEH BERKALA
    // ========================================================
    if (
      isEditor &&
      String(info?.info_types || "").toLowerCase() !== "berkala"
    ) {
      Swal.fire({
        icon: "info",
        title: "Tidak Dapat Diedit",
        text: "Editor hanya dapat mengedit informasi jenis Berkala.",
        confirmButtonText: "OK",
      });

      return;
    }

    // ========================================================
    // EDITOR HANYA BOLEH SATKER SENDIRI
    // ========================================================
    if (
      isEditor &&
      String(info?.id_satker) !== String(currentUser?.id_satker)
    ) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda hanya dapat mengedit informasi dari Satker sendiri.",
        confirmButtonText: "OK",
      });

      return;
    }

    const dateValue = info?.date
      ? new Date(info.date).toISOString().split("T")[0]
      : "";

    setFormData({
      id: info?.id ?? null,

      title: info?.title ?? "",

      date: dateValue,

      info_types: isEditor ? "Berkala" : (info?.info_types ?? ""),

      id_satker: isEditor
        ? (currentUser?.id_satker ?? "")
        : (info?.id_satker ?? ""),

      file: "",
    });

    setFilePreview(
      info?.file_url ||
        (info?.file_path ? `${API_URL}/${info.file_path}` : null),
    );

    setErrors({
      title: "",
      date: "",
      info_types: "",
      id_satker: "",
      file: "",
    });

    setModalMode("edit");
  };

  // ============================================================
  // DELETE
  // ============================================================
  const handleDelete = async (info) => {
    // ========================================================
    // EDITOR -> CEK SATKER
    // ========================================================
    if (
      isEditor &&
      String(info?.id_satker) !== String(currentUser?.id_satker)
    ) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda hanya dapat menghapus informasi dari Satker sendiri.",
        confirmButtonText: "OK",
      });

      return;
    }

    const result = await Swal.fire({
      title: "Yakin?",
      text: "Informasi ini akan dihapus permanen!",
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
          const response = await fetch(`${API_URL}/informasi/${info.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const responseText = await response.text();

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} – ${responseText}`);
          }

          return true;
        } catch (error) {
          console.error("❌ Error hapus informasi:", error);

          Swal.showValidationMessage(
            error.message || "Gagal menghapus informasi",
          );

          return false;
        }
      },
    });

    if (result.isConfirmed) {
      setInformasiList((prev) => prev.filter((item) => item.id !== info.id));

      setFilteredInfo((prev) => prev.filter((item) => item.id !== info.id));

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Informasi berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  // ============================================================
  // STATUS
  // ============================================================
  const getStatus = (info) => {
    return String(info?.status || "pending").toLowerCase();
  };

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
  // VALIDATE INFORMATION
  // ============================================================
  // ============================================================
  // VALIDATE INFORMATION
  // ============================================================
  const handleValidate = async (info) => {
    if (!canValidate) {
      return;
    }

    const status = getStatus(info);

    // ========================================================
    // HANYA PENDING
    // ========================================================
    if (status !== "pending") {
      Swal.fire({
        icon: "info",
        title: "Tidak Dapat Divalidasi",
        text: "Hanya informasi dengan status pending yang dapat diubah statusnya.",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Ubah Status Informasi",
      html: `
      <div style="text-align:left">
        <p><strong>${info?.title || "-"}</strong></p>

        <p>
          Status saat ini:
          <strong>${status || "-"}</strong>
        </p>

        <p>
          Pilih tindakan untuk informasi ini.
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

    // ========================================================
    // SETUJUI
    // ========================================================
    if (result.isConfirmed) {
      await updateInfoStatus(info.id, "approve");
      return;
    }

    // ========================================================
    // TOLAK
    // ========================================================
    if (result.isDenied) {
      const rejectResult = await Swal.fire({
        title: "Tolak Informasi",
        input: "textarea",
        inputLabel: "Alasan penolakan",
        inputPlaceholder: "Masukkan alasan penolakan...",
        inputAttributes: {
          "aria-label": "Alasan penolakan",
        },
        showCancelButton: true,
        confirmButtonText: "Tolak Informasi",
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
        await updateInfoStatus(info.id, "rejected", rejectResult.value.trim());
      }
    }
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================
  const updateInfoStatus = async (id, status, rejectionReason = "") => {
    try {
      const authToken = localStorage.getItem("token");

      const isApprove = status === "approve";

      const normalizedStatus = isApprove ? "approved" : "rejected";

      const endpoint = isApprove
        ? `${API_URL}/informasi/validation/${id}/approve`
        : `${API_URL}/informasi/validation/${id}/reject`;

      const options = {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      };

      // Jika ditolak
      if (!isApprove) {
        options.headers["Content-Type"] = "application/json";

        options.body = JSON.stringify({
          rejection_reason: rejectionReason.trim(),
        });
      }

      console.log("📤 Update Status Informasi:", {
        id,
        status,
        normalizedStatus,
        rejectionReason,
        endpoint,
      });

      const response = await fetch(endpoint, options);

      const responseData = await response.json().catch(() => ({}));

      console.log("📥 Response:", {
        status: response.status,
        data: responseData,
      });

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            `HTTP ${response.status}`,
        );
      }

      await fetchInformasi();

      await Swal.fire({
        icon: "success",
        title: isApprove ? "Informasi Disetujui" : "Informasi Ditolak",
        text: isApprove
          ? "Informasi berhasil disetujui."
          : "Informasi berhasil ditolak.",
        timer: 1800,
        showConfirmButton: false,
      });

      return true;
    } catch (error) {
      console.error("❌ Error update status informasi:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengubah status informasi.",
        confirmButtonText: "OK",
      });

      return false;
    }
  };

  // ============================================================
  // FILE CHANGE
  // ============================================================
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    const isMax5Mb = file.size <= 5 * 1024 * 1024;

    if (!isPdf) {
      setErrors((prev) => ({
        ...prev,
        file: "Format file harus PDF.",
      }));

      setFormData((prev) => ({
        ...prev,
        file: "",
      }));

      setFilePreview(null);

      return;
    }

    if (!isMax5Mb) {
      setErrors((prev) => ({
        ...prev,
        file: "Ukuran file maksimal 5MB.",
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

    setErrors((prev) => ({
      ...prev,
      file: "",
    }));
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const closeModal = () => {
    setModalMode(null);

    setFormData({
      id: null,
      title: "",
      date: "",
      info_types: "",
      id_satker: "",
      file: "",
    });

    setFilePreview(null);

    setErrors({
      title: "",
      date: "",
      info_types: "",
      id_satker: "",
      file: "",
    });
  };

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalData = filteredInfo.length;

  const totalPages =
    itemsPerPage === 0
      ? 1
      : Math.max(1, Math.ceil(filteredInfo.length / itemsPerPage));

  const startIndex = itemsPerPage === 0 ? 0 : (currentPage - 1) * itemsPerPage;

  const currentData =
    itemsPerPage === 0
      ? filteredInfo
      : filteredInfo.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="informasi-crud-container">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="crud-header">
        <h2>Manajemen Informasi</h2>

        <button className="btn-add" onClick={handleAdd}>
          <PlusCircle size={18} />
          Tambah Informasi
        </button>
      </div>

      {/* ======================================================
          FILTER
      ====================================================== */}
      <div className="filter-bar">
        <div className="filter-group">
          {/* SEARCH */}
          <div className="search-box">
            <Search size={16} />

            <input
              type="text"
              placeholder="Cari judul / jenis informasi..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-inline">
            {/* JENIS INFORMASI */}
            {/* <div className="filter-item">
              <label>Jenis Informasi</label>

              <select
                value={infoTypeFilter}
                onChange={(event) => setInfoTypeFilter(event.target.value)}>
                <option value="">Semua</option>

                <option value="Berkala">Berkala</option>

                <option value="Setiap Saat">Setiap Saat</option>

                <option value="Serta Merta">Serta Merta</option>
              </select>
            </div> */}

            {!isEditor && (
              <div className="filter-item">
                <label>Jenis Informasi</label>
                <select
                  value={infoTypeFilter}
                  onChange={(e) => {
                    setInfoTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}>
                  <option value="">Semua Jenis</option>
                  <option value="Berkala">Berkala</option>
                  <option value="Setiap Saat">Setiap Saat</option>
                  <option value="Serta Merta">Serta Merta</option>
                </select>
              </div>
            )}

            {/* SATUAN KERJA */}
            {!isEditor && (
              <div className="filter-item">
                <label>Satuan Kerja</label>

                <select
                  value={satkerFilter}
                  onChange={(event) => setSatkerFilter(event.target.value)}>
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

                {canValidate ? (
                  <option value="pending">Validasi</option>
                ) : (
                  <option value="pending">Menunggu</option>
                )}

                <option value="rejected">Ditolak</option>
                <option value="approved">Disetujui</option>
              </select>
            </div>

            {/* ITEMS */}
            <div className="filter-item">
              <label>Tampilkan</label>

              <select
                value={itemsPerPage}
                onChange={(event) =>
                  setItemsPerPage(Number(event.target.value))
                }>
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
                  onChange={(event) =>
                    setDateRange({
                      ...dateRange,
                      from: event.target.value,
                    })
                  }
                />

                <span>–</span>

                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(event) =>
                    setDateRange({
                      ...dateRange,
                      to: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}
      <div className="table-wrapper">
        <table className="informasi-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Tanggal</th>
              {!isEditor && <th>Jenis Informasi</th>}
              <th>Satuan Kerja</th>
              <th>File</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((info, index) => {
              const status = getStatus(info);

              const isPending = status === "pending";

              return (
                <tr key={info.id}>
                  <td>{startIndex + index + 1}</td>

                  <td>{info.title || "-"}</td>

                  <td>
                    {info.date
                      ? new Date(info.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </td>

                  {!isEditor && <td>{info.info_types}</td>}


                  {/* SATKER */}
                  <td>
                    {info.nama_satker ||
                      info.satker_nama ||
                      getSatkerName(info.id_satker)}
                  </td>

                  {/* FILE */}
                  <td>
                    {info.file_path ? (
                      <a
                        href={info.file_url || `${API_URL}/${info.file_path}`}
                        target="_blank"
                        rel="noreferrer">
                        Lihat
                      </a>
                    ) : (
                      "Tidak ada"
                    )}
                  </td>

                  {/* STATUS */}
                  <td>
                    {canValidate && isPending ? (
                      <button
                        type="button"
                        className="status-badge status-pending status-clickable"
                        onClick={() => handleValidate(info)}
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
                              info?.rejection_reason ||
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
                        className="btn-edit"
                        onClick={() => handleEdit(info)}
                        title="Edit">
                        <Edit size={16} />
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(info)}
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

      {/* ======================================================
          MODAL
      ====================================================== */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>{formData.id ? "Edit Informasi" : "Tambah Informasi"}</h3>

            <form onSubmit={handleSubmit} noValidate>
              {/* ==================================================
                  TITLE
              ================================================== */}
              <div>
                <label>
                  Judul Informasi
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      title: event.target.value,
                    })
                  }
                />

                {errors.title && (
                  <small className="error-text">{errors.title}</small>
                )}
              </div>

              {/* ==================================================
                  GRID
              ================================================== */}
              <div className="form-grid">
                {/* DATE */}
                <div>
                  <label>Tanggal</label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        date: event.target.value,
                      })
                    }
                  />

                  {errors.date && (
                    <small className="error-text">{errors.date}</small>
                  )}
                </div>

                {/* TYPE */}
                {!isEditor && (
                  <div>
                    <label>Jenis Informasi</label>

                    <select
                      value={formData.info_types}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          info_types: event.target.value,
                        })
                      }>
                      <option value="">Pilih</option>
                      <option value="Berkala">Berkala</option>
                      <option value="Setiap Saat">Setiap Saat</option>
                      <option value="Serta Merta">Serta Merta</option>
                    </select>

                    {errors.info_types && (
                      <small className="error-text">{errors.info_types}</small>
                    )}
                  </div>
                )}

                {/* FILE */}
                <div>
                  <label>File</label>

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                  />

                  {errors.file && (
                    <small className="error-text">{errors.file}</small>
                  )}

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

              {/* ==================================================
                  SATKER
              ================================================== */}
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
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        id_satker: event.target.value,
                      })
                    }>
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
                  <small className="error-text">{errors.id_satker}</small>
                )}
              </div>

              {/* ==================================================
                  ACTION
              ================================================== */}
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
};;;

export default InformasiCRUD;
