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
		firstName: string,
        lastName: string,
		captchaToken: string
	) => Promise<boolean>;
	logout: () => void;
	checkAuth: () => Promise<void>;
	setCSRFToken: (token: string | null) => void;
	updateProfile: (data: {
		first_name: string;
		last_name: string;
		phone_number: string;
	}) => Promise<boolean>;
	changePassword: (
		oldPassword: string,
		newPassword: string
	) => Promise<boolean>;
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
			changePassword: async (oldPassword, newPassword) => {
				set({ isLoading: true });
				try {
					await authService.changePassword({
						old_password: oldPassword,
						new_password: newPassword,
					});
					return true;
				} catch (error) {
					throw error;
				} finally {
					set({ isLoading: false });
				}
			},
			updateProfile: async (data) => {
                set({ isLoading: true });
                try {
                    await authService.updateProfile(data);

                    const freshUser = await authService.getMe();

                    set({ user: freshUser });
                    
                    return true;
                } catch (error) {
                    throw error;
                } finally {
                    set({ isLoading: false });
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
				firstName: string,
				lastName: string,
				captchaToken: string
			) => {
				set({ isLoading: true });
				try {
					const res = await authService.register(
						email,
						password,
						firstName,
						lastName,
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
