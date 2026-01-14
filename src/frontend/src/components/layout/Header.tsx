import { Link, useLocation } from "react-router-dom";
import {
	Moon,
	Sun,
	Menu,
	X,
	User,
	ShoppingBag,
	Sparkles,
	LogOut,
	UserCircle,
	ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/stores/languageStore";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

// Sử dụng key thay vì label cứng
const navLinks = [
	{ to: "/", labelKey: "navHome" },
	{ to: "/accounts", labelKey: "navAccounts" },
	{ to: "/guide", labelKey: "navGuide" },
	{ to: "/warranty", labelKey: "navWarranty" },
];

export function Header() {
	const location = useLocation();
	const { theme, toggleTheme } = useThemeStore();
	const { isAuthenticated, user, logout } = useAuthStore();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
	const { t } = useTranslation();

	return (
		<header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-background/90 backdrop-blur-md">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2 group">
						<div className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))] group-hover:scale-110 transition-all duration-300">
							<Sparkles className="h-6 w-6 text-primary" />
						</div>
						<span className="font-gaming text-xl font-bold text-gradient hidden sm:block">
							TienCoTruong Shop
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
									location.pathname === link.to
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-secondary"
								}`}
							>
								{/* @ts-ignore */}
								{t(link.labelKey)}
							</Link>
						))}
						{user?.system_role === "admin" && (
							<Link
								to="/admin"
								className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
									location.pathname.startsWith("/admin")
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-secondary"
								}`}
							>
								{t("navAdmin")}
							</Link>
						)}
					</nav>

					{/* Right Section */}
					<div className="flex items-center gap-2">
						{/* Language Toggle */}
						<LanguageToggle />
						{/* Theme Toggle */}
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							className="rounded-lg"
						>
							<AnimatePresence mode="wait" initial={false}>
								{theme === "dark" ? (
									<motion.div
										key="sun"
										initial={{ rotate: -90, opacity: 0 }}
										animate={{ rotate: 0, opacity: 1 }}
										exit={{ rotate: 90, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Sun className="h-5 w-5" />
									</motion.div>
								) : (
									<motion.div
										key="moon"
										initial={{ rotate: 90, opacity: 0 }}
										animate={{ rotate: 0, opacity: 1 }}
										exit={{ rotate: -90, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Moon className="h-5 w-5" />
									</motion.div>
								)}
							</AnimatePresence>
						</Button>

						{/* Auth Buttons */}
						{isAuthenticated ? (
							<div className="hidden md:flex items-center gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary"
										>
											<div className="p-1.5 rounded-full bg-primary/10">
												<User className="h-4 w-4 text-primary" />
											</div>
											<span className="text-sm font-medium">
												{user?.first_name}{" "}
												{user?.last_name}
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-48 bg-background border border-border"
									>
										<div className="px-3 py-2">
											<p className="text-sm font-medium">
												{user?.first_name}{" "}
												{user?.last_name}
											</p>
											<p className="text-xs text-muted-foreground">
												{user?.email}
											</p>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												to="/profile"
												className="flex items-center gap-2 cursor-pointer"
											>
												<UserCircle className="h-4 w-4" />
												{t("profile")}
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												to="/orders"
												className="flex items-center gap-2 cursor-pointer"
											>
												<ShoppingBag className="h-4 w-4" />
												{t("myOrders")}
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={logout}
											className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
										>
											<LogOut className="h-4 w-4" />
											{t("logout")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<Link to="/auth" className="hidden md:block">
								<Button className="btn-gaming">
									{t("login")}
								</Button>
							</Link>
						)}

						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden rounded-lg"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 top-16 z-40 bg-black/60 md:hidden"
							onClick={() => setMobileMenuOpen(false)}
						/>

						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="absolute left-0 right-0 top-16 z-50 md:hidden mx-4 mt-2 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-xl"
						>
							<nav className="p-4 space-y-2">
								{navLinks.map((link) => (
									<Link
										key={link.to}
										to={link.to}
										onClick={() => setMobileMenuOpen(false)}
										className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${
											location.pathname === link.to
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
										}`}
									>
										{/* @ts-ignore */}
										{t(link.labelKey)}
									</Link>
								))}
								{user?.system_role === "admin" && (
									<Link
										to="/admin"
										onClick={() => setMobileMenuOpen(false)}
										className="block px-4 py-3 rounded-xl font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
									>
										{t("navAdmin")}
									</Link>
								)}
								{!isAuthenticated && (
									<Link
										to="/auth"
										onClick={() => setMobileMenuOpen(false)}
										className="block px-4 pt-2"
									>
										<Button className="btn-gaming w-full">
											{t("login")}
										</Button>
									</Link>
								)}
								{isAuthenticated && (
									<div className="pt-2 border-t border-border/50">
										<button
											onClick={() =>
												setMobileUserMenuOpen(
													!mobileUserMenuOpen
												)
											}
											className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
										>
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-full bg-primary/10">
													<User className="h-4 w-4 text-primary" />
												</div>
												<div className="text-left">
													<p className="text-sm font-medium">
														{user?.first_name}{" "}
														{user?.last_name}
													</p>
													<p className="text-xs text-muted-foreground">
														{user?.email}
													</p>
												</div>
											</div>
											<ChevronDown
												className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
													mobileUserMenuOpen
														? "rotate-180"
														: ""
												}`}
											/>
										</button>

										<AnimatePresence>
											{mobileUserMenuOpen && (
												<motion.div
													initial={{
														height: 0,
														opacity: 0,
													}}
													animate={{
														height: "auto",
														opacity: 1,
													}}
													exit={{
														height: 0,
														opacity: 0,
													}}
													transition={{
														duration: 0.2,
													}}
													className="overflow-hidden"
												>
													<div className="pl-6 space-y-1 mt-1">
														<Link
															to="/profile"
															onClick={() =>
																setMobileMenuOpen(
																	false
																)
															}
															className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50"
														>
															<UserCircle className="h-4 w-4" />
															{t("profile")}
														</Link>
														<Link
															to="/orders"
															onClick={() =>
																setMobileMenuOpen(
																	false
																)
															}
															className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50"
														>
															<ShoppingBag className="h-4 w-4" />
															{t("orders")}
														</Link>
														<button
															onClick={() => {
																logout();
																setMobileMenuOpen(
																	false
																);
															}}
															className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10"
														>
															<LogOut className="h-4 w-4" />
															{t("logout")}
														</button>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								)}
							</nav>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</header>
	);
}
