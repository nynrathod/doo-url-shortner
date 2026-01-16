import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

// API Error interface (RFC 7807)
export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
}

// Storage keys
const TOKEN_KEY = "auth_token";

// Create axios instance
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: "/api",
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Request interceptor - add auth token
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(TOKEN_KEY);
            console.log(
                "[HTTP] Request:",
                config.url,
                "Token:",
                token ? "present" : "missing",
            );
            if (token) {
                // Axios 1.x uses AxiosHeaders, but check existence
                if (!config.headers) {
                    config.headers = new axios.AxiosHeaders();
                }

                // Handle both AxiosHeaders object and plain object
                if (config.headers && typeof config.headers.set === "function") {
                    config.headers.set("Authorization", `Bearer ${token}`);
                } else {
                    // @ts-ignore - Handle plain object case
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError<ApiError>) => {
            console.log("[HTTP] Error:", error.response?.status, error.config?.url);

            // Handle 401 - unauthorized
            // Don't redirect for auth endpoints (login/signup) - let the error bubble up
            const isAuthEndpoint = error.config?.url?.includes("/auth/");
            if (error.response?.status === 401 && !isAuthEndpoint) {
                console.log("[HTTP] 401 detected, clearing auth state");
                // Clear all auth state on 401
                localStorage.removeItem("auth_data");
                localStorage.removeItem(TOKEN_KEY);

                // Redirect to login if not already there
                if (
                    window.location.pathname !== "/login" &&
                    window.location.pathname !== "/signup"
                ) {
                    console.log("imhere");
                    window.location.href = "/login";
                }
            }

            // Extract error message
            const message =
                error.response?.data?.detail ||
                error.response?.data?.title ||
                error.message ||
                "An error occurred";

            return Promise.reject(new Error(message));
        },
    );

    return client;
};

// Singleton instance
const apiClient = createApiClient();

// Generic request methods
export const http = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.get<T>(url, config).then((res) => res.data),

    post: <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T> => apiClient.post<T>(url, data, config).then((res) => res.data),

    put: <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T> => apiClient.put<T>(url, data, config).then((res) => res.data),

    patch: <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<T> =>
        apiClient.patch<T>(url, data, config).then((res) => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.delete<T>(url, config).then((res) => res.data),
};

// Auth token management
export const authToken = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    remove: () => localStorage.removeItem(TOKEN_KEY),
};

export default apiClient;
