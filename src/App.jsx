import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Informasi from './pages/Informasi';
import Layanan from './pages/Layanan';
import Pengaduan from './pages/Pengaduan';
import Infografis from './pages/Infografis';
import SatuanKerja from './pages/SatuanKerja';
import Kua from './pages/Kua';
import ProfilKetua from './pages/ProfilKetua';
import ProfilAdmin from './pages/ProfilAdmin';
import Profile from './pages/Profile';
import { API_URL } from './config';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      // Skip verifikasi jika di halaman login
      if (location.pathname === '/login') return;

      // Jika tidak ada token dan bukan di login, redirect ke login
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/profilAdmin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Verify response:', response.data);

        // Jika token tidak valid (seharusnya tidak sampai sini kalau invalid karena akan catch error)
        if (!response.data.valid) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // Redirect ke login untuk SEMUA error
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login', { replace: true });
      }
    };

    verifyToken();
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/login/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/berita"
        element={
          <PrivateRoute>
            <News />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/informasi"
        element={
          <PrivateRoute>
            <Informasi />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/layanan"
        element={
          <PrivateRoute>
            <Layanan />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/pengaduan"
        element={
          <PrivateRoute>
            <Pengaduan />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/infografis"
        element={
          <PrivateRoute>
            <Infografis />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/satuan-kerja"
        element={
          <PrivateRoute>
            <SatuanKerja />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/kua"
        element={
          <PrivateRoute>
            <Kua />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/profil-ketua"
        element={
          <PrivateRoute>
            <ProfilKetua />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/admin"
        element={
          <PrivateRoute>
            <ProfilAdmin />
          </PrivateRoute>
        }
      />
      <Route
        path="/login/profil"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to="/login" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
