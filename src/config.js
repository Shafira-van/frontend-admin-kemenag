// config.js

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_URL = isLocal
  ? "http://localhost:3000/api" // 💻 alamat API lokal kamu (ubah sesuai backend kamu)
  : "https://api.kemenag-pematangsiantar.com/api"; // 🌐 server produksi

export const API_UPLOADS = isLocal
  ? "http://localhost:3000" // 💻 base URL lokal untuk file upload
  : "https://api.kemenag-pematangsiantar.com"; // 🌐 base URL server produksi
