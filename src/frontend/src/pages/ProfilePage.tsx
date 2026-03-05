import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
	User,
	Mail,
	Save,
	ArrowLeft,
	Type,
	Phone,
	Lock,
	KeyRound,
	Eye,
	EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/stores/languageStore";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user, updateProfile, changePassword } = useAuthStore();
	const { t } = useTranslation();
	const { toast } = useToast();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [isProfileLoading, setIsProfileLoading] = useState(false);

	const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	const [showOldPass, setShowOldPass] = useState(false);
	const [showNewPass, setShowNewPass] = useState(false);
	const [showConfirmPass, setShowConfirmPass] = useState(false);

	useEffect(() => {
		if (user) {
			setFirstName(user.first_name || "");
			setLastName(user.last_name || "");
			setPhoneNumber(user.phone_number || "");
			setEmail(user.email || "");
		} else {
			navigate("/auth");
		}
	}, [user, navigate]);

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsProfileLoading(true);
		try {
			await updateProfile({
				first_name: firstName,
				last_name: lastName,
				phone_number: phoneNumber,
			});
			toast({
				title: t("profilePage.updateSuccess"),
				description: t("profilePage.updateSuccessDesc"),
			});
		} catch (error: any) {
			const msg = (error.message || "").toLowerCase();
			let description = t("profilePage.genericError");

			if (msg.includes("phone")) {
				description = t("profilePage.invalidPhone");
			} else if (msg.includes("name")) {
				description = t("profilePage.invalidName");
			}

			toast({
				title: t("profilePage.updateError"),
				description: description,
				variant: "destructive",
			});
		} finally {
			setIsProfileLoading(false);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword.length < 8 || newPassword.length > 30) {
			toast({
				title: t("profilePage.error"),
				description: t("profilePage.passwordLengthError"),
				variant: "destructive",
			});
			return;
		}
		if (newPassword !== confirmPassword) {
			toast({
				title: t("profilePage.error"),
				description: t("profilePage.passwordMatchError"),
				variant: "destructive",
			});
			return;
		}

		setIsPasswordLoading(true);
		try {
			await changePassword(oldPassword, newPassword);

			toast({
				title: t("profilePage.success"),
				description: t("profilePage.changePasswordSuccess"),
			});

			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setIsPasswordDialogOpen(false);
		} catch (error: any) {
			const msg = (error.message || "").toLowerCase();
			let description = t("profilePage.genericError");

			if (
				msg.includes("password") &&
				(msg.includes("match") ||
					msg.includes("incorrect") ||
					msg.includes("invalid"))
			) {
				description = t("profilePage.oldPasswordIncorrect");
			} else if (msg.includes("too short") || msg.includes("min")) {
				description = t("profilePage.newPasswordTooShort");
			} else if (msg.includes("too long") || msg.includes("max")) {
				description = t("profilePage.newPasswordTooLong");
			} else if (msg.includes("same") || msg.includes("identical")) {
				description = t("profilePage.newPasswordSameAsOld");
			}

			toast({
				title: t("profilePage.changePasswordFailed"),
				description: description,
				variant: "destructive",
			});
		} finally {
			setIsPasswordLoading(false);
		}
	};

	if (!user) return null;

	return (
		<>
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="max-w-2xl mx-auto"
				>
					<Button
						variant="ghost"
						onClick={() => navigate(-1)}
						className="mb-6 gap-2"
					>
						<ArrowLeft className="h-4 w-4" />{" "}
						{t("profilePage.back")}
					</Button>

					<Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
						<CardHeader className="text-center pb-6">
							<div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit ring-4 ring-primary/5">
								<User className="h-12 w-12 text-primary" />
							</div>
							<CardTitle className="text-2xl font-gaming text-gradient uppercase tracking-wide">
								{t("profilePage.myProfile")}
							</CardTitle>
							<CardDescription>
								{t("profilePage.manageProfile")}
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form
								onSubmit={handleProfileSubmit}
								className="space-y-6"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="firstName"
											className="flex items-center gap-2"
										>
											<Type className="h-4 w-4" />
											{t("profilePage.firstName")}
										</Label>
										<Input
											id="firstName"
											value={firstName}
											onChange={(e) =>
												setFirstName(e.target.value)
											}
											className="bg-background/50"
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="lastName"
											className="flex items-center gap-2"
										>
											<Type className="h-4 w-4" />
											{t("profilePage.lastName")}
										</Label>
										<Input
											id="lastName"
											value={lastName}
											onChange={(e) =>
												setLastName(e.target.value)
											}
											className="bg-background/50"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="phone"
										className="flex items-center gap-2"
									>
										<Phone className="h-4 w-4" />
										{t("profilePage.phone")}
									</Label>
									<Input
										id="phone"
										value={phoneNumber}
										onChange={(e) =>
											setPhoneNumber(
												e.target.value.replace(
													/[^0-9]/g,
													"",
												),
											)
										}
										className="bg-background/50"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="email"
										className="flex items-center gap-2"
									>
										<Mail className="h-4 w-4" />
										{t("profilePage.email")}
									</Label>
									<Input
										id="email"
										value={email}
										disabled
										className="bg-muted/50 cursor-not-allowed"
									/>
								</div>

								{/* Action Buttons */}
								<div className="flex flex-col sm:flex-row gap-3 pt-4">
									<Button
										type="submit"
										className="flex-1 btn-gaming gap-2"
										disabled={isProfileLoading}
									>
										<Save className="h-4 w-4" />
										{isProfileLoading
											? t("profilePage.saving")
											: t("profilePage.saveInfo")}
									</Button>

									<Dialog
										open={isPasswordDialogOpen}
										onOpenChange={setIsPasswordDialogOpen}
									>
										<DialogTrigger asChild>
											<Button
												type="button"
												variant="outline"
												className="flex-1 gap-2 border-primary/20 hover:bg-primary/5"
											>
												<KeyRound className="h-4 w-4" />
												{t(
													"profilePage.changePassword",
												)}
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[425px]">
											<DialogHeader>
												<DialogTitle>
													{t(
														"profilePage.changePassword",
													)}
												</DialogTitle>
												<DialogDescription>
													{t(
														"profilePage.manageProfile",
													)}
												</DialogDescription>
											</DialogHeader>
											<form
												onSubmit={handleChangePassword}
												className="space-y-4 py-4"
											>
												{/* Old password */}
												<div className="space-y-2">
													<Label htmlFor="oldPass">
														{t(
															"profilePage.oldPassword",
														)}
													</Label>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
														<Input
															id="oldPass"
															type={
																showOldPass
																	? "text"
																	: "password"
															}
															value={oldPassword}
															onChange={(e) =>
																setOldPassword(
																	e.target
																		.value,
																)
															}
															className="pl-10 pr-10"
															required
														/>
														<button
															type="button"
															onClick={() =>
																setShowOldPass(
																	!showOldPass,
																)
															}
															tabIndex={-1}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
														>
															{showOldPass ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>
												</div>

												{/* New password */}
												<div className="space-y-2">
													<Label htmlFor="newPass">
														{t(
															"profilePage.newPassword",
														)}
													</Label>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
														<Input
															id="newPass"
															type={
																showNewPass
																	? "text"
																	: "password"
															}
															value={newPassword}
															onChange={(e) =>
																setNewPassword(
																	e.target
																		.value,
																)
															}
															className="pl-10 pr-10"
															required
															minLength={8}
															maxLength={30}
														/>
														<button
															type="button"
															onClick={() =>
																setShowNewPass(
																	!showNewPass,
																)
															}
															tabIndex={-1}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
														>
															{showNewPass ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>
												</div>

												{/* Confirm password */}
												<div className="space-y-2">
													<Label htmlFor="confirmPass">
														{t(
															"profilePage.confirmNewPassword",
														)}
													</Label>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
														<Input
															id="confirmPass"
															type={
																showConfirmPass
																	? "text"
																	: "password"
															}
															value={
																confirmPassword
															}
															onChange={(e) =>
																setConfirmPassword(
																	e.target
																		.value,
																)
															}
															className="pl-10 pr-10"
															required
															minLength={8}
															maxLength={30}
														/>
														<button
															type="button"
															onClick={() =>
																setShowConfirmPass(
																	!showConfirmPass,
																)
															}
															tabIndex={-1}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
														>
															{showConfirmPass ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>
												</div>

												<div className="flex justify-end gap-3 pt-4">
													<Button
														type="button"
														variant="ghost"
														onClick={() =>
															setIsPasswordDialogOpen(
																false,
															)
														}
													>
														{t(
															"profilePage.cancel",
														)}
													</Button>
													<Button
														type="submit"
														disabled={
															isPasswordLoading
														}
													>
														{isPasswordLoading
															? t(
																	"profilePage.processing",
																)
															: t(
																	"profilePage.confirm",
																)}
													</Button>
												</div>
											</form>
										</DialogContent>
									</Dialog>
								</div>
							</form>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</>
	);
}
