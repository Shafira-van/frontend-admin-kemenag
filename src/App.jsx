import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Informasi from "./pages/Informasi";
import Layanan from "./pages/Layanan";
import Pengaduan from "./pages/Pengaduan";
import Infografis from "./pages/Infografis";
import SatuanKerja from "./pages/SatuanKerja";
import Kua from "./pages/Kua";
import ProfilKetua from "./pages/ProfilKetua";
import ProfilAdmin from "./pages/ProfilAdmin";
import Profile from "./pages/Profile";



function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected route */}
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
        {/* default route redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
