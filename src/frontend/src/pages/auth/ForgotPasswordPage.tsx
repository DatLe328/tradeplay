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

export default function ForgotPasswordPage() {
	const navigate = useNavigate();
	const { toast } = useToast();

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

		if (!captchaToken) {
			toast({
				title: "Chưa xác thực",
				description: "Vui lòng xác thực bạn không phải robot.",
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
				title: "Đã gửi mã xác thực",
				description: "Vui lòng kiểm tra email của bạn",
			});
			setStep(2);
		} catch (error: any) {
			toast({
				title: "Lỗi",
				description: error.message || "Không tìm thấy email này",
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
				title: "Mật khẩu không hợp lệ",
				description: "Mật khẩu phải từ 8 đến 30 ký tự.",
				variant: "destructive",
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			toast({
				title: "Mật khẩu không khớp",
				description: "Vui lòng nhập lại mật khẩu chính xác.",
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
				title: "Thành công",
				description: "Mật khẩu đã được đổi. Vui lòng đăng nhập lại.",
			});
			navigate("/auth");
		} catch (error: any) {
			toast({
				title: "Thất bại",
				description: error.message || "Mã xác thực không đúng",
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
					Quay lại đăng nhập
				</Link>

				<div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
					<div className="text-center mb-6">
						<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
							<KeyRound className="h-6 w-6 text-primary" />
						</div>
						<h1 className="font-gaming text-2xl font-bold">
							Quên Mật Khẩu
						</h1>
						<p className="text-muted-foreground mt-2 text-sm">
							{step === 1
								? "Nhập email để nhận mã khôi phục"
								: `Nhập mã OTP đã gửi tới ${email}`}
						</p>
					</div>

					{step === 1 ? (
						<form onSubmit={handleRequestOtp} className="space-y-4">
							<div className="space-y-2">
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										type="email"
										placeholder="Email của bạn"
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
								{isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
							</Button>
						</form>
					) : (
						<form
							onSubmit={handleResetPassword}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label className="text-sm font-medium">
									Mã xác thực
								</Label>
								<Input
									type="text"
									placeholder="Mã OTP 6 số"
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
										placeholder="Mật khẩu mới (8-30 ký tự)"
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
										placeholder="Nhập lại mật khẩu mới"
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
								{isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
							</Button>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setStep(1)}
									className="text-xs text-muted-foreground hover:underline"
									tabIndex={-1}
								>
									Gửi lại mã / Đổi email
								</button>
							</div>
						</form>
					)}
				</div>
			</motion.div>
		</div>
	);
}
