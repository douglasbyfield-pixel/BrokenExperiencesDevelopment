import { useForm } from "@tanstack/react-form";
import GoogleLogo from "@web/components/icons/google-logo";
import { Button } from "@web/components/ui/button";
import { Dialog } from "@web/components/ui/dialog";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { authClient } from "@web/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import z from "zod";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const [forgotOpen, setForgotOpen] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	// const { data: session, isPending } = authClient.useSession();

	// Debug logging
	// useEffect(() => {
	// 	console.log("Session state changed:", { session, isPending });
	// }, [session, isPending]);


	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
            const { error } = await authClient.signIn.email({
                email: value.email,
                password: value.password,
            });
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success("Sign in successful");
            router.push("/home");
        },
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});


	return (
		<div className="w-full">
			<div className="mb-6 text-center">
				<h2 className="mb-2 font-bold text-black text-xl">Welcome back</h2>
				<p className="text-gray-600">Sign in to your account</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				<div>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="font-medium text-gray-900 text-sm"
								>
									Email address
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="Enter your email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-black placeholder:text-gray-400 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="mt-1 text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="font-medium text-gray-900 text-sm"
								>
									Password
								</Label>
								<div className="relative">
									<Input
										id={field.name}
										name={field.name}
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 pr-12 text-black placeholder:text-gray-400 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-12 w-12 px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</Button>
								</div>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="mt-1 text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div className="flex items-center justify-end">
					<button
						type="button"
						onClick={() => setForgotOpen(true)}
						className="font-medium text-black text-sm underline hover:text-gray-700 bg-transparent border-none cursor-pointer"
					>
						Forgot password?
					</button>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="h-12 w-full rounded-xl bg-black font-medium text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Signing in..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			{/* OAuth section */}
			<div className="relative my-5">
				<div className="absolute inset-0 flex items-center" aria-hidden="true">
					<div className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-white px-2 text-gray-500">OR</span>
				</div>
			</div>

			<div className="w-full">
				<Button
					variant="outline"
					className="h-12 w-full justify-center border-gray-300 text-black hover:bg-gray-50 hover:text-black"
					onClick={async () => {
						const { error } = await authClient.signIn.social({
							provider: "google",
						});
						if (error) toast.error(error.message);
					}}
				>
					<GoogleLogo className="mr-2" /> Sign In with Google
				</Button>
			</div>

			<div className="mt-8 border-gray-200 border-t pt-6">
				<div className="text-center">
					<span className="text-gray-600">Don't have an account? </span>
					<button
						onClick={onSwitchToSignUp}
						className="font-medium text-black underline transition-colors duration-200 hover:text-gray-700 bg-transparent border-none cursor-pointer"
					>
						Sign up
					</button>
				</div>
			</div>

			{/* Forgot Password Modal */}
			<ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
		</div>
	);
}

// Inline modal for forgot password
function ForgotPasswordDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [touched, setTouched] = useState(false);
	const isValidEmail = z.string().email().safeParse(email).success;
	const showError = touched && !isValidEmail;

	return (
		<Dialog open={open} onOpenChange={onOpenChange} title="Reset your password">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="fp-email" className="font-medium text-black text-sm">
						Email
					</Label>
					<Input
						id={`fp-email-${Math.random().toString(36).substring(2, 15)}`}
						type="email"
						placeholder="you@example.com"
						value={email}
						onBlur={() => setTouched(true)}
						onChange={(e) => setEmail(e.target.value)}
						className={`h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-black placeholder:text-gray-400 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black ${showError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
					/>
					{showError ? (
						<p className="text-red-500 text-sm">Enter a valid email address</p>
					) : null}
				</div>
				<div className="flex justify-end gap-3 pt-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="rounded-xl border-2 border-gray-300 px-6 py-2 text-black transition-all duration-200 hover:bg-gray-50 hover:text-black"
					>
						Cancel
					</Button>
					<Button
						disabled={!isValidEmail || sending}
						onClick={async () => {
							setSending(true);
							const { error } = await authClient.requestPasswordReset({
								email,
							});
							setSending(false);
							if (error) {
								toast.error(error.message);
								return;
							}
							onOpenChange(false);
							// Show toast after closing modal to avoid any overlay stacking issues
							setTimeout(() => {
								toast.success(
									"If an account exists for this email, a reset link has been sent.",
								);
							}, 0);
						}}
						className="rounded-xl bg-black px-6 py-2 font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						{sending ? "Sending..." : "Send link"}
					</Button>
				</div>
			</div>
		</Dialog>
	);
}
