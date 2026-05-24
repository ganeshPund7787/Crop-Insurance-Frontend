import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { store } from "../store";
import { updateAccessToken, logout } from "../store/slices/authSlice";
import { TOKEN_KEYS, API_BASE_URL } from "../config/constants";
import toast from "react-hot-toast";

// ── Create instance ────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Refresh token state ────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

// ── Request interceptor ────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Show error toast for non-401 server errors
    if (error.response?.status && error.response.status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    // Handle ASP.NET validation errors (400)
    if (error.response?.status === 400) {
      const responseData = error.response.data as any;
      const message =
        responseData?.message ??
        responseData?.errors?.[0] ??
        "Validation failed";
      toast.error(message);
    }
    // Only handle 401 and don't retry refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      // Show error toast for non-401 errors
      if (error.response?.status && error.response.status >= 500) {
        toast.error("Server error. Please try again later.");
      }
      return Promise.reject(error);
    }

    // Mark as retried
    originalRequest._retry = true;

    // If already refreshing — queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken =
        store.getState().auth.refreshToken ??
        localStorage.getItem(TOKEN_KEYS.REFRESH);

      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      const newAccessToken: string = data.accessToken;

      // Update store + localStorage
      store.dispatch(updateAccessToken(newAccessToken));

      // Retry queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — force logout
      processQueue(refreshError, null);
      store.dispatch(logout());
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
