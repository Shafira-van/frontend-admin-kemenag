import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // install dulu: npm install axios
import '../styles/Login.css';
import { ClockFading } from 'lucide-react';
import { API_URL } from '../config';
import logoKemenag from '../assets/logoKemenag.png';

function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/profilAdmin/login`,
        { username: user, password: pass },
        { withCredentials: true },
      );

      if (res?.data?.token) {
        localStorage.setItem('token', res?.data?.token);
        localStorage.setItem('username', user);
        localStorage.setItem('id', res?.data?.user?.id);

        await Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });

        navigate('/login/dashboard');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login gagal: token tidak diterima',
          showConfirmButton: true,
          showCloseButton: true,
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Login',
        text: err.response?.data?.message || 'Terjadi kesalahan saat login',
        confirmButtonText: 'Silahkan Coba Lagi',
        showCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src={logoKemenag}
            alt="Logo Kemenag"
          />
          <h2>Kemenag Pematangsiantar</h2>
          <p>Login Admin Panel</p>
        </div>
        <form
          onSubmit={handleLogin}
          className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}>
            {loading ? 'Loading' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
