import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PlusCircle, Edit, Trash2, Eye, Search } from 'lucide-react';
import '../styles/ProfilAdminCRUD.css';
import { API_URL } from '../config';

const ProfilAdminCRUD = () => {
  const [adminList, setAdminList] = useState([]);
  const [satkerList, setSatkerList] = useState([]); // ✅ tambah state satker
  const [tokenUser, setTokenUser] = useState(localStorage.getItem('token'));
  const [filteredAdmin, setFilteredAdmin] = useState([]);

  const [modalMode, setModalMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    id: null,
    username: '',
    email: '',
    password: '',
    role: '',
    id_satker: '', // ✅ tambah field id_satker
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    role: '',
    password: '',
    id_satker: '', // ✅ tambah error id_satker
  });

  /* =========================
     Fetch Satker (useEffect baru)
  ========================= */
  useEffect(() => {
    const fetchSatker = async () => {
      try {
        const res = await axios.get(`${API_URL}/satuankerja/satker/all`, {
          headers: {
            Authorization: `Bearer ${tokenUser}`,
          },
        });

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

    if (tokenUser) fetchSatker();
  }, [tokenUser]);

  /* =========================
     Fetch Admins
  ========================= */
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        let url = `${API_URL}/profilAdmin?limit=${itemsPerPage}`;
        if (itemsPerPage === 0) url = `${API_URL}/profilAdmin`;

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

    if (tokenUser) fetchAdmins();
  }, [itemsPerPage, tokenUser]);

  /* =========================
     Search + Filter
  ========================= */
  useEffect(() => {
    let result = [...adminList];

    if (roleFilter) {
      result = result.filter((a) => a.role === roleFilter);
    }

    if (searchTerm.trim() !== '') {
      const kw = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.username.toLowerCase().includes(kw) ||
          a.email.toLowerCase().includes(kw),
      );
    }

    setFilteredAdmin(result);
  }, [searchTerm, roleFilter, adminList]);

  /* =========================
     Validation
  ========================= */
  const validate = () => {
    const v = {
      username: '',
      email: '',
      role: '',
      password: '',
      id_satker: '',
    };

    if (!formData.username?.trim()) v.username = 'Username wajib diisi.';
    if (!formData.email?.trim()) v.email = 'Email wajib diisi.';
    else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    )
      v.email = 'Format email tidak valid.';
    if (!formData.role) v.role = 'Role wajib dipilih.';
    if (!formData.id_satker) v.id_satker = 'Satuan Kerja wajib dipilih.'; // ✅ validasi satker
    if (formData.password && formData.password.length < 6)
      v.password = 'Password minimal 6 karakter.';

    setErrors(v);
    return Object.values(v).every((e) => e === '');
  };

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        id_satker: formData.id_satker, // ✅ sertakan id_satker
        ...(formData.password ? { password: formData.password } : {}),
      };

      if (!formData.id && !formData.password) {
        payload.password = '123456';
      }

      if (formData.id) {
        await axios.put(`${API_URL}/profilAdmin/${formData.id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenUser}`,
          },
        });
      } else {
        await axios.post(`${API_URL}/profilAdmin`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenUser}`,
          },
        });
      }

      // refresh list
      const updated = await axios.get(`${API_URL}/profilAdmin`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenUser}`,
        },
      });

      const list = Array.isArray(updated.data)
        ? updated.data
        : Array.isArray(updated.data.data)
          ? updated.data.data
          : [];

      setAdminList(list);
      setFilteredAdmin(list);

      Swal.fire({
        icon: 'success',
        title: 'Admin Berhasil Disimpan',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      closeModal();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan admin.',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    }
  };

  /* =========================
     Edit / Preview / Delete
  ========================= */
  const handleEdit = (admin) => {
    setFormData({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      password: '',
      role: admin.role,
      id_satker: admin.id_satker || '', // ✅ isi id_satker dari data
    });
    setErrors({});
    setModalMode('edit');
  };

  const handlePreview = (admin) => {
    setFormData(admin);
    setModalMode('preview');
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Admin?',
      text: 'Data admin yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .delete(`${API_URL}/profilAdmin/${id}`, {
          headers: { Authorization: `Bearer ${tokenUser}` },
        })
        .then(() => {
          setAdminList((p) => p.filter((a) => a.id !== id));
          setFilteredAdmin((p) => p.filter((a) => a.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Admin berhasil dihapus',
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Admin gagal dihapus',
          });
        });
    });
  };

  const openCreateModal = () => {
    setFormData({
      id: null,
      username: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });
    setErrors({});
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData({
      id: null,
      username: '',
      email: '',
      password: '',
      role: '',
      id_satker: '',
    });
    setErrors({});
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="profiladmin-container">
      <div className="crud-header">
        <h2>Manajemen Admin</h2>
        <button
          className="btn-add"
          onClick={openCreateModal}>
          <PlusCircle size={18} /> Tambah Admin
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari username atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-inline">
          <div className="filter-item">
            <label>Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Semua</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
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
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="news-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Satuan Kerja</th> {/* ✅ kolom baru */}
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmin.length ? (
              filteredAdmin.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>{a.username}</td>
                  <td>{a.email}</td>
                  <td>{a.role}</td>
                  <td>{a.nama_satker || a.id_satker || '-'}</td>{' '}
                  {/* ✅ tampilkan nama_satker */}
                  <td>
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(a)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(a.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="empty-text">
                  Tidak ada admin ditemukan.
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
            {modalMode === 'edit' ? (
              <>
                <h3>{formData.id ? 'Edit Admin' : 'Tambah Admin'}</h3>
                <form
                  onSubmit={handleSubmit}
                  noValidate>
                  <div className="form-grid">
                    {/* Username */}
                    <div>
                      <label>
                        Username <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            username: e.target.value,
                          });
                          if (errors.username)
                            setErrors({ ...errors, username: '' });
                        }}
                        className={errors.username ? 'is-invalid' : ''}
                      />
                      {errors.username && (
                        <div className="error-text">{errors.username}</div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={errors.email ? 'is-invalid' : ''}
                      />
                      {errors.email && (
                        <div className="error-text">{errors.email}</div>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder={
                          formData.id
                            ? 'Isi untuk ubah password (opsional)'
                            : 'Kosongkan untuk default: 123456'
                        }
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className={errors.password ? 'is-invalid' : ''}
                      />
                      {errors.password && (
                        <div className="error-text">{errors.password}</div>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label>
                        Role <span className="required">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({ ...formData, role: e.target.value });
                          if (errors.role) setErrors({ ...errors, role: '' });
                        }}
                        className={errors.role ? 'is-invalid' : ''}>
                        <option value="">-- Pilih Role --</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                      {errors.role && (
                        <div className="error-text">{errors.role}</div>
                      )}
                    </div>

                    {/* ✅ Satuan Kerja */}
                    <div>
                      <label>
                        Satuan Kerja <span className="required">*</span>
                      </label>
                      <select
                        value={formData.id_satker}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            id_satker: e.target.value,
                          });
                          if (errors.id_satker)
                            setErrors({ ...errors, id_satker: '' });
                        }}
                        className={errors.id_satker ? 'is-invalid' : ''}>
                        <option value="">-- Pilih Satuan Kerja --</option>
                        {satkerList.map((s) => (
                          <option
                            key={s.id_satker}
                            value={s.id_satker}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {errors.id_satker && (
                        <div className="error-text">{errors.id_satker}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-save">
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
                <h3>Detail Admin</h3>
                <p>
                  <strong>Username:</strong> {formData.username}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Role:</strong> {formData.role}
                </p>
                <p>
                  <strong>Satuan Kerja:</strong>{' '}
                  {formData.nama_satker || formData.id_satker || '-'}
                </p>{' '}
                {/* ✅ */}
                <p>
                  <strong>Jenis Satker:</strong> {formData.jenis_satker || '-'}
                </p>{' '}
                {/* ✅ */}
                <p>
                  <strong>Dibuat:</strong>{' '}
                  {formData.created_at
                    ? new Date(formData.created_at).toLocaleDateString('id-ID')
                    : '-'}
                </p>
                <div
                  className="form-actions"
                  style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="btn-cancel"
                    onClick={closeModal}>
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
