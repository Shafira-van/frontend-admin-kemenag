export const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "https://api.kemenag-pematangsiantar.com/api";

export const API_UPLOAD = "https://api.kemenag-pematangsiantar.com/uploads";
