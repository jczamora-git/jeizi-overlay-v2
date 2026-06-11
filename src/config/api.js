const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:3000";

const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "").replace(/\/api$/, "");
const apiUrl = (path) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${cleanPath}`;
};
const ENABLE_SOCKET =
  import.meta.env.VITE_ENABLE_SOCKET === undefined
    ? /localhost|127\.0\.0\.1/i.test(normalizedBaseUrl)
    : import.meta.env.VITE_ENABLE_SOCKET === "true";

export { API_BASE_URL, normalizedBaseUrl, apiUrl, ENABLE_SOCKET };
