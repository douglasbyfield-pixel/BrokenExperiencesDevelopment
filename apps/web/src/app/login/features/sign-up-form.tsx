import { useForm } from "@tanstack/react-form";
import GoogleLogo from "@web/components/icons/google-logo";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { authClient } from "@web/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);
	const [serverEmailError, setServerEmailError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						router.push("/home");
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="w-full">
			<div className="mb-8 text-center">
				<h2 className="mb-2 font-bold text-2xl text-black">
					Welcome to Broken Experience
				</h2>
				<p className="text-gray-600">
					It only takes a minute to start making an impact.
				</p>
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
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="font-medium text-black text-sm"
								>
									Full name
								</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter your full name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black"
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
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="font-medium text-black text-sm"
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
									onChange={(e) => {
										setServerEmailError(null);
										field.handleChange(e.target.value);
									}}
									className={`h-12 w-full rounded-xl border-2 bg-white px-4 transition-all duration-200 focus:ring-2 focus:ring-black ${serverEmailError ? "border-red-500" : "border-gray-300 focus:border-black"}`}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="mt-1 text-red-500 text-sm">
										{error?.message}
									</p>
								))}
								{serverEmailError ? (
									<p className="mt-1 text-red-500 text-sm">
										{serverEmailError}
									</p>
								) : null}
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
									className="font-medium text-black text-sm"
								>
									Password
								</Label>
								<div className="relative">
									<Input
										id={field.name}
										name={field.name}
										type={showPassword ? "text" : "password"}
										placeholder="Your password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 pr-12 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black"
									/>
									<button
										type="button"
										aria-label="Toggle password visibility"
										className="absolute inset-y-0 right-3 flex items-center text-gray-500"
										onClick={() => setShowPassword((v) => !v)}
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="mt-1 text-red-500 text-sm">
										{error?.message}
									</p>
								))}
								<div className="mt-2 grid grid-cols-2 gap-x-6 text-left text-gray-500 text-xs">
									<ul className="list-inside list-disc space-y-1">
										<li>minimum 8 characters</li>
										<li>one special character</li>
										<li>one number</li>
									</ul>
									<ul className="list-inside list-disc space-y-1">
										<li>one uppercase character</li>
										<li>one lowercase character</li>
									</ul>
								</div>
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="h-12 w-full rounded-xl bg-black font-medium text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Creating account..." : "Create an account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-3 text-center text-sm">
				<span className="text-gray-600">I already have an account. </span>
				<Button
					onClick={onSwitchToSignIn}
					className="font-medium text-black underline"
				>
					Log in
				</Button>
			</div>

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
					<GoogleLogo className="mr-2" /> Sign Up with Google
				</Button>
			</div>

			<div className="mt-6">
				<p className="text-center text-gray-500 text-xs leading-relaxed">
					By continuing, you agree to Broken Experience{" "}
					<a
						href="/terms-of-service"
						className="text-black underline hover:text-gray-700"
					>
						Terms of Service
					</a>{" "}
					and{" "}
					<a
						href="/privacy-policy"
						className="text-black underline hover:text-gray-700"
					>
						Privacy Policy
					</a>
					.
				</p>
			</div>
		</div>
	);
}
