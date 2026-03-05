import { Layout } from "@/components/layout/Layout";
import AccountDetailPage from "@/pages/AccountDetailPage";
import AccountsPage from "@/pages/AccountsPage";
import AdminAccounts from "@/pages/admin/AdminAccounts";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOrders from "@/pages/admin/AdminOrders";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import GoogleCallbackPage from "@/pages/auth/GoogleCallbackPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import AuthPage from "@/pages/AuthPage";
import DepositPage from "@/pages/DepositPage";
import GuidePage from "@/pages/GuidePage";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import OrdersPage from "@/pages/OrdersPage";
import ProfilePage from "@/pages/ProfilePage";
import WarrantyPage from "@/pages/WarrantyPage";
import { createBrowserRouter } from "react-router";

export const AppRoutes = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "accounts", element: <AccountsPage /> },
			{ path: "accounts/:id", element: <AccountDetailPage /> },
			{ path: "guide", element: <GuidePage /> },
			{ path: "warranty", element: <WarrantyPage /> },
			{ path: "orders", element: <OrdersPage /> },
			{ path: "profile", element: <ProfilePage /> },
			{ path: "deposit", element: <DepositPage /> },
		],
	},
	{
		path: "/auth",
		children: [
			{ index: true, element: <AuthPage /> },
			{ path: "google-success", element: <GoogleCallbackPage /> },
			{ path: "forgot-password", element: <ForgotPasswordPage /> },
			{ path: "verify-email", element: <VerifyEmailPage /> },
		],
	},
	{
		path: "/admin",
		element: <AdminLayout />,
		children: [
			{ index: true, element: <AdminDashboard /> },
			{ path: "accounts", element: <AdminAccounts /> },
			{ path: "orders", element: <AdminOrders /> },
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);
