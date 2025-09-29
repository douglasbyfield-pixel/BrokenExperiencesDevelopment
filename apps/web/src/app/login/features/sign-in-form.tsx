import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import Loader from "@web/components/loader";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { authClient } from "@web/lib/auth-client";

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
			<div className="mb-8 text-center">
				<h2 className="mb-2 font-bold text-2xl text-black">Welcome back</h2>
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
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="font-medium text-black text-sm"
								>
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

				<div className="flex items-center justify-end">
					<button
						type="button"
						className="font-medium text-black text-sm underline hover:text-gray-700"
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

			<div className="mt-8 border-gray-200 border-t pt-6">
				<div className="text-center">
					<span className="text-gray-600">Don't have an account? </span>
					<Button
						variant="link"
						onClick={onSwitchToSignUp}
						className="font-medium text-black underline transition-colors duration-200 hover:text-gray-700"
					>
						Sign up
					</Button>
				</div>
			</div>
		</div>
	);
}
