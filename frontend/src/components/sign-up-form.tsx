import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

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

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="w-full">
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold text-black mb-2">Create account</h2>
				<p className="text-gray-600">Get started with Broken Experiences</p>
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
								<Label htmlFor={field.name} className="text-sm font-medium text-black">
									Full name
								</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter your full name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="w-full h-12 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black bg-white transition-all duration-200"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-sm text-red-500 mt-1">
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
								<Label htmlFor={field.name} className="text-sm font-medium text-black">
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
									className="w-full h-12 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black bg-white transition-all duration-200"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-sm text-red-500 mt-1">
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
								<Label htmlFor={field.name} className="text-sm font-medium text-black">
									Password
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Create a password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="w-full h-12 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black bg-white transition-all duration-200"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-sm text-red-500 mt-1">
										{error?.message}
									</p>
								))}
								<p className="text-xs text-gray-500 mt-1">
									Must be at least 8 characters long
								</p>
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Creating account..." : "Create Account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-6">
				<p className="text-xs text-gray-500 text-center leading-relaxed">
					By creating an account, you agree to our{" "}
					<a href="#" className="text-black hover:text-gray-700 underline">
						Terms of Service
					</a>{" "}
					and{" "}
					<a href="#" className="text-black hover:text-gray-700 underline">
						Privacy Policy
					</a>
				</p>
			</div>

			<div className="mt-8 pt-6 border-t border-gray-200">
				<div className="text-center">
					<span className="text-gray-600">Already have an account? </span>
					<button
						onClick={onSwitchToSignIn}
						className="text-black hover:text-gray-700 font-medium underline transition-colors duration-200"
					>
						Sign in
					</button>
				</div>
			</div>
		</div>
	);
}
