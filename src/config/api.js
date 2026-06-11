const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:3000";

const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "").replace(/\/api$/, "");
const apiUrl = `${normalizedBaseUrl}/api`;

export { API_BASE_URL, normalizedBaseUrl, apiUrl };
