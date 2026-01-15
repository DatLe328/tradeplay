import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

import HomePage from "./pages/HomePage";
import AccountsPage from "./pages/AccountsPage";
import AccountDetailPage from "./pages/AccountDetailPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminOrders from "./pages/admin/AdminOrders";
import NotFound from "./pages/NotFound";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import GuidePage from "./pages/GuidePage";
import WarrantyPage from "./pages/WarrantyPage";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

function ThemeInitializer() {
	const { theme } = useThemeStore();

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return null;
}

const App = () => {
	useIdleTimeout();

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<ThemeInitializer />
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<ScrollToTop />
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/accounts" element={<AccountsPage />} />
						<Route
							path="/accounts/:id"
							element={<AccountDetailPage />}
						/>
						<Route
							path="/payment/:orderId"
							element={<PaymentPage />}
						/>
						<Route path="/orders" element={<OrdersPage />} />
						<Route path="/guide" element={<GuidePage />} />
						<Route path="/warranty" element={<WarrantyPage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/auth" element={<AuthPage />} />
						<Route
							path="/auth/google-success"
							element={<GoogleCallbackPage />}
						/>
						<Route
							path="/verify-email"
							element={<VerifyEmailPage />}
						/>
						<Route
							path="/forgot-password"
							element={<ForgotPasswordPage />}
						/>

						{/* Admin Routes */}
						<Route path="/admin" element={<AdminLayout />}>
							<Route index element={<AdminDashboard />} />
							<Route
								path="accounts"
								element={<AdminAccounts />}
							/>
							<Route path="orders" element={<AdminOrders />} />
						</Route>

						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	);
};

export default App;
