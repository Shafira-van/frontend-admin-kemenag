import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // install dulu: npm install axios
import "../styles/Login.css";
import { ClockFading } from "lucide-react";

function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/profilAdmin/login",
        {
          username: user,
          password: pass,
        }
      );

      console.log(user)

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", user); 
        navigate("/login/dashboard");
      } else {
        alert("Login gagal: token tidak diterima");
      }
    } catch (err) {
      console.error(err);
      alert("Username atau Password salah!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Logo_Kementerian_Agama_2021.svg/120px-Logo_Kementerian_Agama_2021.svg.png"
            alt="Logo Kemenag"
          />
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
