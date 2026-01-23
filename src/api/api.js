// src/api/api.js
import axios from "axios";
import { ensureApiBaseUrl, normalizeEndpointPath } from "./apiBase";

// Get API URL from environment variable
// VITE_API_URL should be set in .env file (e.g., VITE_API_URL=https://backend-soukboudouaou.vercel.app)
// For Vercel deployment: VITE_API_URL=https://backend-soukboudouaou.vercel.app
// If not set in dev mode, use Vite proxy (empty string = relative URLs)
// If not set in production, falls back to same-origin requests
const rawBase = import.meta.env.VITE_API_URL;

if (!rawBase && !import.meta.env.DEV) {
  console.warn(
    "VITE_API_URL is not set. Falling back to same-origin requests. " +
      "Set VITE_API_URL in your environment if your API is hosted on a different domain.",
  );
}

const baseURL = ensureApiBaseUrl(rawBase || "");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: api.defaults.baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // FORCE MOCK MODE - Block all API calls
  // Return a rejected promise to prevent network requests
  return Promise.reject(new Error("MOCK_MODE: API calls disabled - using mock data only"));
}, (error) => {
  return Promise.reject(error);
});

let isRefreshing = false;
let pendingRequests = [];

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await refreshClient.post(
    "/auth/refresh",
    refreshToken ? { refreshToken } : undefined,
  );
  const token = res.data?.token;
  if (token) localStorage.setItem("token", token);
  if (res.data?.refreshToken) {
    localStorage.setItem("refreshToken", res.data.refreshToken);
  }
  return token;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // FORCE MOCK MODE - Suppress all API errors silently
    // Never log CORS or network errors - app is fully mock-only
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_RESET" ||
      error.code === "ERR_FAILED";
    const isCorsError =
      error.message?.includes("CORS") ||
      error.message?.includes("Access-Control") ||
      error.message?.includes("MOCK_MODE");

    // Suppress ALL errors - app is mock-only
    if (isNetworkError || isCorsError || import.meta.env.DEV) {
      // Silently ignore - mock mode handles everything
      return Promise.reject(new Error("MOCK_MODE: API calls disabled"));
    }
    
    return Promise.reject(error);
  },
);

export default api;
