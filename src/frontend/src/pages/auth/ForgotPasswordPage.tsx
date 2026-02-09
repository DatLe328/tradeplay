import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/stores/languageStore";

export default function ForgotPasswordPage() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { t } = useTranslation();

	const [step, setStep] = useState<1 | 2>(1);

	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [captchaToken, setCaptchaToken] = useState("");

	const turnstileRef = useRef<TurnstileInstance>(null);

	const handleRequestOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		const isDev = import.meta.env.DEV;

		if (!isDev && !captchaToken) {
			toast({
				title: t("notVerified"),
				description: t("captchaError"),
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			await apiRequest(
				"/auth/forgot-password",
				{
					method: "POST",
					data: JSON.stringify({ email }),
				},
				captchaToken
			);

			toast({
				title: t("otpSent"),
				description: t("otpSentDesc"),
			});
			setStep(2);
		} catch (error: any) {
			toast({
				title: t("error"),
				description: error.message || t("emailNotFound"),
				variant: "destructive",
			});
			setCaptchaToken("");
			turnstileRef.current?.reset();
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword.length < 8 || newPassword.length > 30) {
			toast({
				title: t("error"),
				description: t("passwordLengthError"),
				variant: "destructive",
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			toast({
				title: t("error"),
				description: t("passwordMatchError"),
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			await apiRequest("/auth/reset-password", {
				method: "POST",
				data: JSON.stringify({
					email,
					code: otp,
					new_password: newPassword,
				}),
			});
			toast({
				title: t("success"),
				description: t("resetPasswordSuccess"),
			});
			navigate("/auth");
		} catch (error: any) {
			toast({
				title: t("error"),
				description: error.message || t("otpIncorrect"),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			{/* Background Effect */}
			<div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
			<div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md relative"
			>
				<Link
					to="/auth"
					className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					{t("backToLogin")}
				</Link>

				<div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
					<div className="text-center mb-6">
						<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<KeyRound className="h-6 w-6 text-primary" />
						</div>
						<h1 className="font-gaming text-2xl font-bold">
							{t("forgotPasswordTitle")}
						</h1>
						<p className="text-muted-foreground mt-2 text-sm">
							{step === 1
								? t("forgotPasswordStep1")
								: `${t("forgotPasswordStep2")} ${email}`}
						</p>
					</div>

					{step === 1 ? (
						<form onSubmit={handleRequestOtp} className="space-y-4">
							<div className="space-y-2">
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										type="email"
										placeholder={t("yourEmail")}
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="pl-10 input-gaming"
										required
									/>
								</div>
							</div>

							<div className="flex justify-center w-full my-4 overflow-hidden">
								<Turnstile
									ref={turnstileRef}
									siteKey={
										import.meta.env.VITE_TURNSTILE_SITE_KEY
									}
									onSuccess={(token) =>
										setCaptchaToken(token)
									}
									onExpire={() => setCaptchaToken("")}
									options={{
										theme: "auto",
										size: "flexible",
									}}
								/>
							</div>

							<Button
								className="w-full btn-gaming py-6"
								disabled={isLoading}
							>
								{isLoading ? t("sending") : t("sendOtp")}
							</Button>
						</form>
					) : (
						<form
							onSubmit={handleResetPassword}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label className="text-sm font-medium">
									{t("otpPlaceholder") || "OTP Code"}
								</Label>
								<Input
									type="text"
									placeholder="######"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className="text-center text-lg tracking-widest font-mono"
									maxLength={6}
									required
									autoFocus
								/>
							</div>

							<div className="space-y-2">
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										type={
											showPassword ? "text" : "password"
										}
										placeholder={t("newPassword")}
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
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

							<div className="space-y-2">
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										type={
											showConfirmPassword
												? "text"
												: "password"
										}
										placeholder={t("confirmNewPassword")}
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										className="pl-10 pr-10 input-gaming"
										required
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

							<Button
								className="w-full btn-gaming py-6"
								disabled={isLoading}
								type="submit"
							>
								{isLoading ? t("processing") : t("resetPassword")}
							</Button>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setStep(1)}
									className="text-xs text-muted-foreground hover:underline"
									tabIndex={-1}
								>
									{t("resendOrChangeEmail")}
								</button>
							</div>
						</form>
					)}
				</div>
			</motion.div>
		</div>
	);
}