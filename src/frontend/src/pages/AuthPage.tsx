import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
	Gamepad2,
	Mail,
	Lock,
	Eye,
	EyeOff,
	ArrowLeft,
	Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/stores/languageStore";

export default function AuthPage() {
	const { t } = useTranslation();
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [captchaToken, setCaptchaToken] = useState("");

	const turnstileRef = useRef<TurnstileInstance>(null);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
	});

	const navigate = useNavigate();
	const { login, register } = useAuthStore();
	const { toast } = useToast();

	const handleGoogleLogin = () => {
		const API_URL = import.meta.env.VITE_API_URL;
		window.location.href = `${API_URL}/auth/google/login`;
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		setCaptchaToken("");
		turnstileRef.current?.reset();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!captchaToken) {
			toast({
				title: "Xác thực thất bại",
				description: "Vui lòng hoàn thành xác thực bảo mật (Captcha).",
				variant: "destructive",
			});
			return;
		}

		if (formData.password.length < 8 || formData.password.length > 30) {
			toast({
				title: "Mật khẩu không hợp lệ",
				description: "Mật khẩu phải từ 8 đến 30 ký tự.",
				variant: "destructive",
			});
			return;
		}

		if (!isLogin && formData.password !== formData.confirmPassword) {
			toast({
				title: "Mật khẩu không khớp",
				description: "Vui lòng nhập lại mật khẩu chính xác.",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			if (isLogin) {
				const success = await login(
					formData.email,
					formData.password,
					captchaToken
				);
				if (success) {
					toast({
						title: t("loginSuccess"),
						description: t("welcomeBack"),
					});
					navigate("/");
				} else {
					toast({
						title: t("loginFailed"),
						description: t("wrongCredentials"),
						variant: "destructive",
					});
					setCaptchaToken("");
					turnstileRef.current?.reset();
				}
			} else {
				const success = await register(
					formData.email,
					formData.password,
					formData.firstName,
					formData.lastName,
					captchaToken
				);
				if (success) {
					toast({
						title: t("registerSuccess"),
						description: t("accountCreated"),
					});
					navigate("/verify-email", {
						state: { email: formData.email },
					});
				} else {
					toast({
						title: t("registerFailed"),
						description: t("emailUsed"),
						variant: "destructive",
					});
					setCaptchaToken("");
					turnstileRef.current?.reset();
				}
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
			<div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md relative"
			>
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					{t("backToHome")}
				</Link>

				<div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
					<div className="text-center mb-8">
						<Link
							to="/"
							className="inline-flex items-center gap-2 mb-4"
						>
							<div className="p-3 rounded-xl bg-primary/10">
								<Gamepad2 className="h-8 w-8 text-primary" />
							</div>
						</Link>
						<h1 className="font-gaming text-2xl font-bold">
							{isLogin ? t("loginTitle") : t("registerTitle")}
						</h1>
						<p className="text-muted-foreground mt-2">
							{isLogin ? t("loginDesc") : t("registerDesc")}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{!isLogin && (
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">
										{t("firstName")}
									</Label>
									<div className="relative">
										<Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											id="firstName"
											type="text"
											placeholder="Nguyễn"
											value={formData.firstName}
											onChange={(e) =>
												setFormData({
													...formData,
													firstName: e.target.value,
												})
											}
											className="pl-10 input-gaming"
											required={!isLogin}
											autoFocus
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">
										{t("lastName")}
									</Label>
									<div className="relative">
										<Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											id="lastName"
											type="text"
											placeholder="Văn A"
											value={formData.lastName}
											onChange={(e) =>
												setFormData({
													...formData,
													lastName: e.target.value,
												})
											}
											className="pl-10 input-gaming"
											required={!isLogin}
										/>
									</div>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder="example@email.com"
									value={formData.email}
									onChange={(e) =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									className="pl-10 input-gaming"
									required
									autoFocus={isLogin}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">
								{t("enterPassword")}
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder={t('enterPassword')}
									value={formData.password}
									onChange={(e) =>
										setFormData({
											...formData,
											password: e.target.value,
										})
									}
									className="pl-10 pr-10 input-gaming"
									required
									minLength={8}
									maxLength={30}
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									tabIndex={-1}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{!isLogin && (
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">
									{t("confirmPassword")}
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="confirmPassword"
										type={
											showConfirmPassword
												? "text"
												: "password"
										}
										placeholder={t("confirmPassword")}
										value={formData.confirmPassword}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											})
										}
										className="pl-10 pr-10 input-gaming"
										required={!isLogin}
										minLength={8}
										maxLength={30}
									/>
									<button
										type="button"
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword
											)
										}
										tabIndex={-1}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>
						)}

						<div className="flex justify-center w-full my-4 overflow-hidden">
							<Turnstile
								ref={turnstileRef}
								key={isLogin ? "login" : "register"}
								siteKey={
									import.meta.env.VITE_TURNSTILE_SITE_KEY
								}
								onSuccess={(token) => setCaptchaToken(token)}
								onExpire={() => setCaptchaToken("")}
								options={{
									theme: "auto",
									size: "flexible",
								}}
							/>
						</div>

						<Button
							type="submit"
							className="btn-gaming w-full py-6 text-lg"
							disabled={isLoading}
						>
							{isLoading
								? t("processing")
								: isLogin
								? t("loginTitle")
								: t("registerTitle")}
						</Button>
					</form>

					{/* Demo account hint */}
					{isLogin && (
						<div className="flex justify-end">
							<Link
								to="/forgot-password"
								className="text-sm text-primary hover:underline"
							>
								{t('forgotPassword')}
							</Link>
						</div>
					)}
					<div className="space-y-4">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									{t('orContinueWith')}
								</span>
							</div>
						</div>

						<Button
							variant="outline"
							type="button"
							className="w-full gap-2"
							onClick={handleGoogleLogin}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Google
						</Button>
					</div>

					<div className="mt-6 text-center">
						<p className="text-muted-foreground">
							{isLogin ? t('noAccount') : t('hasAccount')}
							<button
								type="button"
								onClick={toggleMode}
								className="text-primary font-semibold ml-2 hover:underline"
							>
								{isLogin ? t('registerNow') : t('loginTitle')}
							</button>
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
