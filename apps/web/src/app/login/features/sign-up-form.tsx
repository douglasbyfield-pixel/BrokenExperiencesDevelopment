import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

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
			<div className="mb-8 text-center">
				<h2 className="mb-2 font-bold text-2xl text-black">Create account</h2>
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
									placeholder="Create a password"
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
								<p className="mt-1 text-gray-500 text-xs">
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
							className="h-12 w-full rounded-xl bg-black font-medium text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Creating account..." : "Create Account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-6">
				<p className="text-center text-gray-500 text-xs leading-relaxed">
					By creating an account, you agree to our{" "}
					<Link href="#" className="text-black underline hover:text-gray-700">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link href="#" className="text-black underline hover:text-gray-700">
						Privacy Policy
					</Link>
				</p>
			</div>

			<div className="mt-8 border-gray-200 border-t pt-6">
				<div className="text-center">
					<span className="text-gray-600">Already have an account? </span>
					<button
						type="button"
						onClick={onSwitchToSignIn}
						className="font-medium text-black underline transition-colors duration-200 hover:text-gray-700"
					>
						Sign in
					</button>
				</div>
			</div>
		</div>
	);
}
