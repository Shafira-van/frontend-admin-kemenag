import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // install dulu: npm install axios
import "../styles/Login.css";
import { ClockFading } from "lucide-react";
import { API_URL } from "../config";

function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/profilAdmin/login`,
        { username: user, password: pass },
        { withCredentials: true }
      );


      console.log("Login berhasil untuk:", user);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", user);
        navigate("/login/dashboard");
      } else {
        alert("Login gagal: token tidak diterima");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Username atau Password salah!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="src/assets/logoKemenag.png" alt="Logo Kemenag" />
          <h2>Kemenag Pematangsiantar</h2>
          <p>Login Admin Panel</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
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
          <button type="submit">Masuk</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
