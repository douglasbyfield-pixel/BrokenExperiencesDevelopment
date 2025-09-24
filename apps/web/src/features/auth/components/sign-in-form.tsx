
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "../../../components/loader";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useRouter } from "next/navigation";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push("/home");
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
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
				<h2 className="text-2xl font-bold text-black mb-2">Welcome back</h2>
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
									placeholder="Enter your password"
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

				<div className="flex items-center justify-end">
					<button
						type="button"
						className="text-sm text-black hover:text-gray-700 font-medium underline"
					>
						Forgot password?
					</button>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Signing in..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-8 pt-6 border-t border-gray-200">
				<div className="text-center">
					<span className="text-gray-600">Don't have an account? </span>
					<button
						onClick={onSwitchToSignUp}
						className="text-black hover:text-gray-700 font-medium underline transition-colors duration-200"
					>
						Sign up
					</button>
				</div>
			</div>
		</div>
	);
}
