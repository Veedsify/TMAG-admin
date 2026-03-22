import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_KEY = import.meta.env.VITE_API_KEY || "your_api_key_here";
const COOKIE_NAME = "admin_access_token";

export function getAuthCookie(): string | undefined {
  return Cookies.get(COOKIE_NAME);
}

export function setAuthCookie(token: string, expMs: number): void {
  Cookies.set(COOKIE_NAME, token, {
    path: "/",
    expires: new Date(expMs),
    sameSite: "Lax",
  });
}

export function removeAuthCookie(): void {
  Cookies.remove(COOKIE_NAME, { path: "/" });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isLoginEndpoint = url.includes("/admin/auth/login");
    if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginEndpoint) {
      removeAuthCookie();
      window.location.href = "/admin";
    }
    return Promise.reject(error);
  },
);

export default api;
