import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { Newspaper, ClipboardList, MessageSquare, UserCog } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { API_URL } from "../config";

const Dashboard = () => {
  const [dataSummary, setDataSummary] = useState({
    berita: 0,
    layanan: 0,
    pengaduan: 0,
    admin: 0,
  });

  const [chartData, setChartData] = useState([]);

  // 🔹 Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [berita, layanan, pengaduan, admin] = await Promise.all([
          fetch(`${API_URL}/berita`, { credentials: "include" }).then((res) =>
            res.json()
          ),
          fetch(`${API_URL}/layanan`, { credentials: "include" }).then((res) =>
            res.json()
          ),
          fetch(`${API_URL}/pengaduan`, { credentials: "include" }).then(
            (res) => res.json()
          ),
          fetch(`${API_URL}/profilAdmin`, { credentials: "include" }).then(
            (res) => res.json()
          ),
        ]);

        // Set summary
        setDataSummary({
          berita: berita.length,
          layanan: layanan.length,
          pengaduan: pengaduan.length,
          admin: admin.length,
        });

        // 🔸 Hitung jumlah pengaduan per bulan
        const bulanMap = new Map();
        pengaduan.forEach((item) => {
          if (!item.tanggal) return; // hindari null
          const date = new Date(item.tanggal);
          if (isNaN(date)) return; // hindari format aneh
          const bulan = date.toLocaleString("id-ID", { month: "short" });
          bulanMap.set(bulan, (bulanMap.get(bulan) || 0) + 1);
        });

        const urutanBulan = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];

        const hasilChart = urutanBulan.map((b) => ({
          name: b,
          pengaduan: bulanMap.get(b) || 0,
        }));

        setChartData(hasilChart);
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Selamat Datang di Dashboard Admin</h2>

      {/* === STAT CARDS === */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <Newspaper size={28} />
          <div>
            <h3>{dataSummary.berita}</h3>
            <p>Berita</p>
          </div>
        </div>

        <div className="stat-card green">
          <ClipboardList size={28} />
          <div>
            <h3>{dataSummary.layanan}</h3>
            <p>Layanan</p>
          </div>
        </div>

        <div className="stat-card orange">
          <MessageSquare size={28} />
          <div>
            <h3>{dataSummary.pengaduan}</h3>
            <p>Pengaduan</p>
          </div>
        </div>

        <div className="stat-card purple">
          <UserCog size={28} />
          <div>
            <h3>{dataSummary.admin}</h3>
            <p>Admin</p>
          </div>
        </div>
      </div>

      {/* === GRAFIK AKTIVITAS === */}
      <div className="chart-section">
        <h3>Aktivitas Pengaduan Bulanan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="pengaduan" fill="#4caf50" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
