import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PlusCircle, Edit, Trash2, Eye, Search } from 'lucide-react';
import '../styles/ProfilAdminCRUD.css';
import { API_URL } from '../config';

const ProfilAdminCRUD = () => {
  const [adminList, setAdminList] = useState([]);
  const [satkerList, setSatkerList] = useState([]);
  const [tokenUser, setTokenUser] = useState(localStorage.getItem('token'));
  const [filteredAdmin, setFilteredAdmin] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ============================================================
  // FORM DATA
  // ============================================================
  const [formData, setFormData] = useState({
    id: null,
    username: '',
    nip: '',
    email: '',
    password: '',
    role: '',
    id_satker: '',
  });

  // ============================================================
  // ERROR FORM
  // ============================================================
  const [errors, setErrors] = useState({
    username: '',
    nip: '',
    email: '',
    role: '',
    password: '',
    id_satker: '',
  });

  // ============================================================
  // FETCH SATKER
  // ============================================================
  useEffect(() => {
    const fetchSatker = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/satuankerja/satker/all`,
          {
            headers: {
              Authorization: `Bearer ${tokenUser}`,
            },
          },
        );

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];

        setSatkerList(data);
      } catch (err) {
        console.error('Error fetching satker:', err);
      }
    };

    if (tokenUser) {
      fetchSatker();
    }
  }, [tokenUser]);

  // ============================================================
  // FETCH ADMINS
  // ============================================================
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        let url = `${API_URL}/profilAdmin?limit=${itemsPerPage}`;

        if (itemsPerPage === 0) {
          url = `${API_URL}/profilAdmin`;
        }

        const res = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenUser}`,
          },
        });

        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];

        setAdminList(list);
        setFilteredAdmin(list);
      } catch (err) {
        console.error('Error fetching admins:', err);
      }
    };

    if (tokenUser) {
      fetchAdmins();
    }
  }, [itemsPerPage, tokenUser]);

  // ============================================================
  // SEARCH + FILTER
  // ============================================================
  useEffect(() => {
    let result = [...adminList];

    // Filter berdasarkan role
    if (roleFilter) {
      result = result.filter(
        (a) => a.role === roleFilter,
      );
    }

    // Search username, NIP, email
    if (searchTerm.trim() !== '') {
      const kw = searchTerm.toLowerCase();

      result = result.filter(
        (a) =>
          a.username?.toLowerCase().includes(kw) ||
          a.nip?.toLowerCase().includes(kw) ||
          a.email?.toLowerCase().includes(kw),
      );
    }

    setFilteredAdmin(result);
  }, [searchTerm, roleFilter, adminList]);

  // ============================================================
  // VALIDATION
  // ============================================================
  const validate = () => {
    const v = {
      username: '',
      nip: '',
      email: '',
      role: '',
      password: '',
      id_satker: '',
    };

    // Username
    if (!formData.username?.trim()) {
      v.username = 'Username wajib diisi.';
    }

    // NIP WAJIB
    if (!formData.nip?.trim()) {
      v.nip = 'NIP wajib diisi.';
    } else if (formData.nip.trim().length > 30) {
      v.nip = 'NIP maksimal 30 karakter.';
    }

    // Email
    if (!formData.email?.trim()) {
      v.email = 'Email wajib diisi.';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email.trim(),
      )
    ) {
      v.email = 'Format email tidak valid.';
    }

    // Role
    if (!formData.role) {
      v.role = 'Role wajib dipilih.';
    }

    // Satuan Kerja
    if (!formData.id_satker) {
      v.id_satker = 'Satuan Kerja wajib dipilih.';
    }

    // Password
    if (
      formData.password &&
      formData.password.length < 6
    ) {
      v.password = 'Password minimal 6 karakter.';
    }

    setErrors(v);

    return Object.values(v).every(
      (e) => e === '',
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Jalankan validasi
    if (!validate()) {
      return;
    }

    const isEdit = !!formData.id;

    try {
      // ========================================================
      // PAYLOAD
      // ========================================================
      const payload = {
        username: formData.username.trim(),
        nip: formData.nip.trim(),
        email: formData.email.trim(),
        role: formData.role,
        id_satker: formData.id_satker,

        ...(formData.password
          ? {
              password: formData.password,
            }
          : {}),
      };

      // ========================================================
      // TAMBAH ADMIN
      // Password default 123456 jika dikosongkan
      // ========================================================
      if (!isEdit && !formData.password) {
        payload.password = '123456';
      }

      // ========================================================
      // UPDATE
      // ========================================================
      if (isEdit) {
        await axios.put(
          `${API_URL}/profilAdmin/${formData.id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenUser}`,
            },
          },
        );
      }

      // ========================================================
      // TAMBAH
      // ========================================================
      else {
        await axios.post(
          `${API_URL}/profilAdmin`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenUser}`,
            },
          },
        );
      }

      // ========================================================
      // REFRESH LIST
      // ========================================================
      const updated = await axios.get(
        `${API_URL}/profilAdmin`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenUser}`,
          },
        },
      );

      const list = Array.isArray(updated.data)
        ? updated.data
        : Array.isArray(updated.data.data)
          ? updated.data.data
          : [];

      setAdminList(list);
      setFilteredAdmin(list);

      // ========================================================
      // TUTUP MODAL
      // ========================================================
      closeModal();

      // ========================================================
      // SUCCESS
      // ========================================================
      Swal.fire({
        icon: 'success',
        title: isEdit
          ? 'Admin Berhasil Diperbarui'
          : 'Admin Berhasil Disimpan',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error(
        '❌ Error submit admin:',
        err,
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Terjadi kesalahan saat menyimpan data.';

      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Admin',
        text: message,
        confirmButtonText: 'OK',
      });
    }
  };

  // ============================================================
  // EDIT ADMIN
  // ============================================================
  const handleEdit = (admin) => {
    setFormData({
      id: admin.id || null,
      username: admin.username || '',
      nip: admin.nip || '',
      email: admin.email || '',
      password: '',
      role: admin.role || '',
      id_satker: admin.id_satker || '',
    });

    setErrors({
      username: '',
      nip: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });

    setModalMode('edit');
  };

  // ============================================================
  // PREVIEW ADMIN
  // ============================================================
  const handlePreview = (admin) => {
    setFormData({
      id: admin.id || null,
      username: admin.username || '',
      nip: admin.nip || '',
      email: admin.email || '',
      password: '',
      role: admin.role || '',
      id_satker: admin.id_satker || '',
      nama_satker: admin.nama_satker || '',
      jenis_satker: admin.jenis_satker || '',
      created_at: admin.created_at || '',
    });

    setModalMode('preview');
  };

  // ============================================================
  // DELETE ADMIN
  // ============================================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin?',
      text: 'Data admin ini akan dihapus permanen!',
      icon: 'warning',

      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',

      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',

      showLoaderOnConfirm: true,

      allowOutsideClick: () =>
        !Swal.isLoading(),

      preConfirm: async () => {
        try {
          await axios.delete(
            `${API_URL}/profilAdmin/${id}`,
            {
              headers: {
                Authorization: `Bearer ${tokenUser}`,
              },
            },
          );

          return true;
        } catch (error) {
          console.error(
            '❌ Error hapus admin:',
            error,
          );

          const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Gagal menghapus admin';

          Swal.showValidationMessage(message);

          return false;
        }
      },
    });

    // ==========================================================
    // DELETE BERHASIL
    // ==========================================================
    if (result.isConfirmed) {
      setAdminList((prev) =>
        prev.filter(
          (admin) => admin.id !== id,
        ),
      );

      setFilteredAdmin((prev) =>
        prev.filter(
          (admin) => admin.id !== id,
        ),
      );

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Admin berhasil dihapus',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================
  const openCreateModal = () => {
    setFormData({
      id: null,
      username: '',
      nip: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });

    setErrors({
      username: '',
      nip: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });

    setModalMode('edit');
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const closeModal = () => {
    setModalMode(null);

    setFormData({
      id: null,
      username: '',
      nip: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });

    setErrors({
      username: '',
      nip: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="profiladmin-container">

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="crud-header">
        <h2>Manajemen Admin</h2>

        <button
          className="btn-add"
          onClick={openCreateModal}
        >
          <PlusCircle size={18} />
          Tambah Admin
        </button>
      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}
      <div className="filter-bar">

        {/* SEARCH */}
        <div className="search-box">
          <Search size={16} />

          <input
            type="text"
            placeholder="Cari username, NIP atau email..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        {/* FILTER */}
        <div className="filter-inline">

          {/* ROLE */}
          <div className="filter-item">
            <label>Role</label>

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >
              <option value="">
                Semua
              </option>

              <option value="superadmin">
                Super Admin
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="editor">
                Editor
              </option>
            </select>
          </div>

          {/* JUMLAH DATA */}
          <div className="filter-item">
            <label>Tampilkan</label>

            <select
              value={itemsPerPage}
              onChange={(e) =>
                setItemsPerPage(
                  Number(e.target.value),
                )
              }
            >
              <option value={10}>
                10
              </option>

              <option value={20}>
                20
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>

              <option value={0}>
                Semua
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}
      <div className="table-wrapper">
        <table className="news-table">

          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>NIP</th>
              <th>Email</th>
              <th>Role</th>
              <th>Satuan Kerja</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredAdmin.length ? (

              filteredAdmin.map((a, i) => (
                <tr key={a.id}>

                  {/* NO */}
                  <td>
                    {i + 1}
                  </td>

                  {/* USERNAME */}
                  <td>
                    {a.username || '-'}
                  </td>

                  {/* NIP */}
                  <td>
                    {a.nip || '-'}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {a.email || '-'}
                  </td>

                  {/* ROLE */}
                  <td>
                    {a.role || '-'}
                  </td>

                  {/* SATKER */}
                  <td>
                    {a.nama_satker ||
                      a.id_satker ||
                      '-'}
                  </td>

                  {/* CREATED */}
                  <td>
                    {a.created_at
                      ? new Date(
                          a.created_at,
                        ).toLocaleDateString(
                          'id-ID',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          },
                        )
                      : '-'}
                  </td>

                  {/* AKSI */}
                  <td className="action-cell">
                    <td className="action-buttons">

                    {/* PREVIEW */}
                    <button
                      className="btn-preview"
                      onClick={() =>
                        handlePreview(a)
                      }
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>

                    {/* EDIT */}
                    <button
                      className="btn-edit"
                      onClick={() =>
                        handleEdit(a)
                      }
                      title="Edit Admin"
                    >
                      <Edit size={16} />
                    </button>

                    {/* DELETE */}
                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(a.id)
                      }
                      title="Hapus Admin"
                    >
                      <Trash2 size={16} />
                    </button>

                  </td></td>
                  

                </tr>
              ))

            ) : (

              <tr>
                <td
                  colSpan="8"
                  className="empty-text"
                >
                  Tidak ada admin ditemukan.
                </td>
              </tr>

            )}
          </tbody>

        </table>
      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}
      {modalMode && (

        <div className="modal-overlay">

          <div className="modal-content modal-large">

            {/* =================================================
                FORM TAMBAH / EDIT
            ================================================= */}
            {modalMode === 'edit' ? (

              <>
                <h3>
                  {formData.id
                    ? 'Edit Admin'
                    : 'Tambah Admin'}
                </h3>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                >

                  <div className="form-grid">

                    {/* ==========================================
                        USERNAME
                    ========================================== */}
                    <div>
                      <label>
                        Username{' '}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            username:
                              e.target.value,
                          });

                          if (errors.username) {
                            setErrors({
                              ...errors,
                              username: '',
                            });
                          }
                        }}
                        className={
                          errors.username
                            ? 'is-invalid'
                            : ''
                        }
                      />

                      {errors.username && (
                        <div className="error-text">
                          {errors.username}
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        NIP
                    ========================================== */}
                    <div>
                      <label>
                        NIP{' '}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        maxLength={30}
                        inputMode="numeric"
                        placeholder="Masukkan NIP"
                        value={formData.nip}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            nip: e.target.value,
                          });

                          if (errors.nip) {
                            setErrors({
                              ...errors,
                              nip: '',
                            });
                          }
                        }}
                        className={
                          errors.nip
                            ? 'is-invalid'
                            : ''
                        }
                      />

                      {errors.nip && (
                        <div className="error-text">
                          {errors.nip}
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        EMAIL
                    ========================================== */}
                    <div>
                      <label>
                        Email{' '}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        type="email"
                        placeholder="Masukkan email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            email:
                              e.target.value,
                          });

                          if (errors.email) {
                            setErrors({
                              ...errors,
                              email: '',
                            });
                          }
                        }}
                        className={
                          errors.email
                            ? 'is-invalid'
                            : ''
                        }
                      />

                      {errors.email && (
                        <div className="error-text">
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        PASSWORD
                    ========================================== */}
                    <div>
                      <label>
                        Password
                      </label>

                      <input
                        type="password"
                        placeholder={
                          formData.id
                            ? 'Isi untuk ubah password (opsional)'
                            : 'Kosongkan untuk default: 123456'
                        }
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            password:
                              e.target.value,
                          });

                          if (errors.password) {
                            setErrors({
                              ...errors,
                              password: '',
                            });
                          }
                        }}
                        className={
                          errors.password
                            ? 'is-invalid'
                            : ''
                        }
                      />

                      {errors.password && (
                        <div className="error-text">
                          {errors.password}
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        ROLE
                    ========================================== */}
                    <div>
                      <label>
                        Role{' '}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <select
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            role:
                              e.target.value,
                          });

                          if (errors.role) {
                            setErrors({
                              ...errors,
                              role: '',
                            });
                          }
                        }}
                        className={
                          errors.role
                            ? 'is-invalid'
                            : ''
                        }
                      >
                        <option value="">
                          -- Pilih Role --
                        </option>

                        <option value="superadmin">
                          Super Admin
                        </option>

                        <option value="admin">
                          Admin
                        </option>

                        <option value="editor">
                          Editor
                        </option>
                      </select>

                      {errors.role && (
                        <div className="error-text">
                          {errors.role}
                        </div>
                      )}
                    </div>

                    {/* ==========================================
                        SATUAN KERJA
                    ========================================== */}
                    <div>
                      <label>
                        Satuan Kerja{' '}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <select
                        value={formData.id_satker}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            id_satker:
                              e.target.value,
                          });

                          if (errors.id_satker) {
                            setErrors({
                              ...errors,
                              id_satker: '',
                            });
                          }
                        }}
                        className={
                          errors.id_satker
                            ? 'is-invalid'
                            : ''
                        }
                      >
                        <option value="">
                          -- Pilih Satuan Kerja --
                        </option>

                        {satkerList.map((s) => (
                          <option
                            key={s.id_satker}
                            value={s.id_satker}
                          >
                            {s.name ||
                              s.nama ||
                              s.nama_satker}
                          </option>
                        ))}
                      </select>

                      {errors.id_satker && (
                        <div className="error-text">
                          {errors.id_satker}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ============================================
                      FORM ACTIONS
                  ============================================ */}
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

              /* =================================================
                 DETAIL ADMIN
              ================================================= */
              <>
                <h3>
                  Detail Admin
                </h3>

                <p>
                  <strong>
                    Username:
                  </strong>{' '}
                  {formData.username ||
                    '-'}
                </p>

                <p>
                  <strong>
                    NIP:
                  </strong>{' '}
                  {formData.nip || '-'}
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{' '}
                  {formData.email || '-'}
                </p>

                <p>
                  <strong>
                    Role:
                  </strong>{' '}
                  {formData.role || '-'}
                </p>

                <p>
                  <strong>
                    Satuan Kerja:
                  </strong>{' '}
                  {formData.nama_satker ||
                    formData.id_satker ||
                    '-'}
                </p>
                <p>
                  <strong>
                    Dibuat:
                  </strong>{' '}
                  {formData.created_at
                    ? new Date(
                        formData.created_at,
                      ).toLocaleDateString(
                        'id-ID',
                      )
                    : '-'}
                </p>

                <div
                  className="form-actions"
                  style={{
                    justifyContent:
                      'flex-end',
                  }}
                >
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeModal}
                  >
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

export default ProfilAdminCRUD;