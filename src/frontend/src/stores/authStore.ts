import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "@/types";
import { authService } from "@/services/authService";

interface AuthStore {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	csrfToken: string | null;
	login: (
		email: string,
		password: string,
		captchaToken: string
	) => Promise<boolean>;
	register: (
		email: string,
		password: string,
		name: string,
		captchaToken: string
	) => Promise<boolean>;
	logout: () => void;
	checkAuth: () => Promise<void>;
	setCSRFToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			csrfToken: null,

			setCSRFToken: (token: string | null) => {
				set({ csrfToken: token });
				if (token) {
					localStorage.setItem("csrf_token", token);
				} else {
					localStorage.removeItem("csrf_token");
				}
			},

			login: async (
				email: string,
				password: string,
				captchaToken: string
			) => {
				set({ isLoading: true });
				try {
					const res = await authService.login(
						email,
						password,
						captchaToken
					);

					if (res && typeof res === "object" && "data" in res) {
						const data = res.data as any;
						if (data?.csrf_token) {
							set({ csrfToken: data.csrf_token });
							localStorage.setItem("csrf_token", data.csrf_token);
						}
					}

					localStorage.setItem("lastActivity", Date.now().toString());

					const user = await authService.getMe();

					set({ user: user, isAuthenticated: true });
					return true;
				} catch (error) {
					return false;
				} finally {
					set({ isLoading: false });
				}
			},

			register: async (
				email: string,
				password: string,
				name: string,
				captchaToken: string
			) => {
				set({ isLoading: true });
				try {
					const res = await authService.register(
						email,
						password,
						name,
						captchaToken
					);

					if (res && typeof res === "object" && "data" in res) {
						const data = res.data as any;
						if (data?.csrf_token) {
							set({ csrfToken: data.csrf_token });
							localStorage.setItem("csrf_token", data.csrf_token);
						}
					}

					return true;
				} catch (error) {
					return false;
				} finally {
					set({ isLoading: false });
				}
			},

			logout: async () => {
				try {
					await authService.logout();
				} catch (error) {
					// console.error("Logout error:", error);
				} finally {
					localStorage.removeItem("lastActivity");
					localStorage.removeItem("csrf_token");

					set({
						user: null,
						isAuthenticated: false,
						csrfToken: null,
					});
				}
			},

			checkAuth: async () => {
				try {
					const user = await authService.getMe();

					if (!localStorage.getItem("lastActivity")) {
						localStorage.setItem(
							"lastActivity",
							Date.now().toString()
						);
					}

					set({ user, isAuthenticated: true });
				} catch (error) {
					localStorage.removeItem("lastActivity");
					localStorage.removeItem("csrf_token");
					set({
						user: null,
						isAuthenticated: false,
						csrfToken: null,
					});
				}
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
