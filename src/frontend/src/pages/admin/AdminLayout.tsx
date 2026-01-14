import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import {
	LayoutDashboard,
	Gamepad2,
	ShoppingCart,
	ChevronLeft,
	Moon,
	Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";

const adminNavItems = [
	{ to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
	{ to: "/admin/accounts", icon: Gamepad2, label: "Quản lý Acc" },
	{ to: "/admin/orders", icon: ShoppingCart, label: "Quản lý Order" },
];

export default function AdminLayout() {
	const location = useLocation();
	const { user, isAuthenticated } = useAuthStore();
	const { theme, toggleTheme } = useThemeStore();

	// Check if user is admin
	if (!isAuthenticated || user?.system_role !== "admin") {
		return <Navigate to="/auth" replace />;
	}

	return (
		<div className="min-h-screen flex bg-background">
			{/* Sidebar */}
			<aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
				{/* Logo */}
				<div className="p-4 border-b border-border">
					<Link to="/" className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-primary/10">
							<Gamepad2 className="h-6 w-6 text-primary" />
						</div>
						<span className="font-gaming text-lg font-bold text-gradient">
							ADMIN
						</span>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4 space-y-1">
					{adminNavItems.map((item) => {
						const isActive = item.exact
							? location.pathname === item.to
							: location.pathname.startsWith(item.to);

						return (
							<Link
								key={item.to}
								to={item.to}
								className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
									isActive
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-secondary"
								}`}
							>
								<item.icon className="h-5 w-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				{/* Bottom */}
				<div className="p-4 border-t border-border space-y-2">
					<Button
						variant="ghost"
						className="w-full justify-start gap-3"
						onClick={toggleTheme}
					>
						{theme === "dark" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
						{theme === "dark" ? "Light Mode" : "Dark Mode"}
					</Button>
					<Link to="/">
						<Button
							variant="ghost"
							className="w-full justify-start gap-3"
						>
							<ChevronLeft className="h-5 w-5" />
							Về trang chủ
						</Button>
					</Link>
				</div>
			</aside>

			{/* Mobile Header */}
			<div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-card border-b border-border">
				<div className="flex items-center justify-between p-4">
					<div className="flex items-center gap-2">
						<Link to="/">
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground"
							>
								<ChevronLeft className="h-5 w-5" />
							</Button>
						</Link>
						<Link to="/admin" className="flex items-center gap-2">
							<Gamepad2 className="h-6 w-6 text-primary" />
							<span className="font-gaming font-bold">ADMIN</span>
						</Link>
					</div>
					<Button variant="ghost" size="icon" onClick={toggleTheme}>
						{theme === "dark" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>
				</div>
				<nav className="flex overflow-x-auto pb-2 px-4 gap-2">
					{adminNavItems.map((item) => {
						const isActive = item.exact
							? location.pathname === item.to
							: location.pathname.startsWith(item.to);

						return (
							<Link
								key={item.to}
								to={item.to}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
									isActive
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-secondary"
								}`}
							>
								<item.icon className="h-4 w-4" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Main Content */}
			<main className="flex-1 overflow-auto">
				<div className="pt-24 md:pt-0">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
