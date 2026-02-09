import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/authStore";
import { WELCOME_POPUP_KEY } from "@/components/layout/WelcomePopup";

const IDLE_TIMEOUT = 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const RETRY_METHODS = ["GET"];

const isUserIdle = (): boolean => {
	const lastActivity = localStorage.getItem("lastActivity");
	if (!lastActivity) return true;

	const idleTime = Date.now() - parseInt(lastActivity);
	return idleTime > IDLE_TIMEOUT;
};

const API_URL = import.meta.env.VITE_API_URL;
// if (import.meta.env.PROD && !API_URL.startsWith("https://")) {
// 	throw new Error("API_URL must use HTTPS in production");
// }

export const api: AxiosInstance = axios.create({
	baseURL: API_URL,
	withCredentials: true,
});

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const csrfToken = useAuthStore.getState().csrfToken;
		if (csrfToken && config.headers) {
			config.headers["X-CSRF-Token"] = csrfToken;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});
	failedQueue = [];
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateFibonacciDelay = (retryCount: number): number => {
	let a = 0,
		b = 1;
	for (let i = 0; i < retryCount; i++) {
		const temp = a + b;
		a = b;
		b = temp;
	}
	return a * RETRY_DELAY;
};

api.interceptors.response.use(
	(response) => {
		if (response.data?.data?.csrf_token) {
            useAuthStore.getState().setCSRFToken(response.data.data.csrf_token);
        }
        return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
			_retryCount?: number;
		};

		if (
			(error.response?.status === 401 ||
				error.response?.status === 403) &&
			!originalRequest._retry
		) {
			if (isUserIdle()) {
				localStorage.removeItem(WELCOME_POPUP_KEY);
				useAuthStore.getState().logout();

				if (!window.location.pathname.startsWith("/auth")) {
					window.location.href = "/auth";
				}

				return Promise.reject(
					new Error("Session expired due to inactivity"),
				);
			}

			if (isRefreshing) {
				return new Promise(function (resolve, reject) {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers["X-CSRF-Token"] = token;
						}
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const response = await axios.post(
					`${API_URL}/auth/refresh-token`,
					{},
					{
						withCredentials: true,
						headers: {
							...(localStorage.getItem("csrf_token") && {
								"X-CSRF-Token":
									localStorage.getItem("csrf_token"),
							}),
						},
					},
				);

				const newToken = response.data?.data?.csrf_token;

				if (newToken) {
					localStorage.setItem("csrf_token", newToken);

					if (originalRequest.headers) {
						originalRequest.headers["X-CSRF-Token"] = newToken;
					}
				}

				localStorage.setItem("lastActivity", Date.now().toString());

				processQueue(null, newToken);

				return api(originalRequest);
			} catch (refreshError) {
				// console.log(refreshError);
				processQueue(refreshError, null);

				localStorage.removeItem("csrf_token");
				useAuthStore.getState().logout();

				if (!window.location.pathname.startsWith("/auth")) {
					window.location.href = "/auth";
				}

				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		const isNetworkError = !error.response;
		const isServerError =
			error.response &&
			error.response.status >= 500 &&
			error.response.status < 600;
		const isIdempotentMethod =
			originalRequest.method &&
			RETRY_METHODS.includes(originalRequest.method.toUpperCase());

		if ((isNetworkError || isServerError) && isIdempotentMethod) {
			originalRequest._retryCount = originalRequest._retryCount || 0;

			if (originalRequest._retryCount < MAX_RETRIES) {
				originalRequest._retryCount++;

				const delay = calculateFibonacciDelay(
					originalRequest._retryCount,
				);

				await wait(delay);
				return api(originalRequest);
			}
		}

		return Promise.reject(error);
	},
);

export async function apiRequest<T>(
	endpoint: string,
	options: AxiosRequestConfig = {},
	captchaToken?: string,
): Promise<T> {
	try {
		const config: AxiosRequestConfig = {
			url: endpoint,
			...options,
			headers: {
				...options.headers,
				...(captchaToken ? { "X-Captcha-Token": captchaToken } : {}),
			},
		};

		if (!config.method) config.method = "GET";

		if (config.data instanceof FormData && config.headers) {
			delete config.headers["Content-Type"];
		}

		const response = await api.request<T>(config);
		return response.data;
	} catch (error: any) {
		const message =
			error.response?.data?.message || error.message || "Có lỗi xảy ra";
		throw new Error(message);
	}
}
