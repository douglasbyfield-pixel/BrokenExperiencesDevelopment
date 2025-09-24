import { supabase } from "@/lib/supabase-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useSupabaseSession } from "@/lib/use-supabase-session";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AppleLogo } from "./icons/apple-logo";
import { GoogleLogo } from "./icons/google-logo";
import { checkEmailExists } from "@/lib/api";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
    const { loading } = useSupabaseSession();
	const [showPassword, setShowPassword] = useState(false);
    const [serverEmailError, setServerEmailError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
        onSubmit: async ({ value }) => {
            // hard pre-check against server to avoid async race UX
            const exists = await checkEmailExists(value.email);
            if (exists) {
                setServerEmailError("Email already in use. Try logging in or reset password.");
                await supabase.auth.resend({ type: "signup", email: value.email });
                return;
            }
            const { data, error } = await supabase.auth.signUp({
                email: value.email,
                password: value.password,
                options: {
                    data: { name: value.name },
                    emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
                },
            });
            if (error) {
                const msg = error.message?.toLowerCase() ?? "";
                const looksLikeExisting = error?.status === 422 || /already|exists|duplicate/.test(msg);
                if (looksLikeExisting) {
                    // If the email already exists (possibly unconfirmed), resend verification
                    await supabase.auth.resend({ type: "signup", email: value.email });
                    setServerEmailError("Email already in use. Try logging in or check your inbox for verification.");
                    toast.success("If this email wasn’t confirmed, we re‑sent the verification link.");
                } else {
                    setServerEmailError(error.message);
                    toast.error(error.message);
                }
                return;
            }
            toast.success("Sign up successful. Check your email to confirm.");
            router.push(`/verify?email=${encodeURIComponent(value.email)}`);
        },
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

    // Show form even if loading

	return (
		<div className="w-full">
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold text-black mb-2">Welcome to Broken Experience</h2>
				<p className="text-gray-600">It only takes a minute to start making an impact.</p>
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
                                    onChange={(e) => {
                                        setServerEmailError(null);
                                        field.handleChange(e.target.value);
                                    }}
                                    className={`w-full h-12 px-4 border-2 rounded-xl focus:ring-2 focus:ring-black bg-white transition-all duration-200 ${serverEmailError ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-sm text-red-500 mt-1">
										{error?.message}
									</p>
								))}
                                {serverEmailError ? (
                                    <p className="text-sm text-red-500 mt-1">{serverEmailError}</p>
                                ) : null}
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
								<div className="relative">
									<Input
										id={field.name}
										name={field.name}
										type={showPassword ? "text" : "password"}
										placeholder="Your password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="w-full h-12 pr-12 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black bg-white transition-all duration-200"
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
									<p key={error?.message} className="text-sm text-red-500 mt-1">
										{error?.message}
									</p>
								))}
								<div className="grid grid-cols-2 gap-x-6 text-xs text-gray-500 mt-2 text-left">
									<ul className="list-disc list-inside space-y-1">
										<li>minimum 8 characters</li>
										<li>one special character</li>
										<li>one number</li>
									</ul>
									<ul className="list-disc list-inside space-y-1">
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
							className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Creating account..." : "Create an account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="text-center text-sm mt-3">
				I already have an account.{' '}
				<button onClick={onSwitchToSignIn} className="text-black font-medium underline">Log in</button>
			</div>

			<div className="relative my-5">
				<div className="absolute inset-0 flex items-center" aria-hidden="true">
					<div className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-white px-2 text-gray-500">OR</span>
				</div>
			</div>

			<div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
				<Button
					variant="outline"
					className="w-full h-12 justify-center"
                    onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                            provider: "apple",
                            options: {
                                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
                                // preferRedirect implicitly true in our flow by not using popups
                            },
                        });
						if (error) toast.error(error.message);
					}}
				>
					<AppleLogo className="mr-2" /> Sign Up with Apple
				</Button>
				<Button
					variant="outline"
					className="w-full h-12 justify-center"
                    onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
                            },
                        });
						if (error) toast.error(error.message);
					}}
				>
					<GoogleLogo className="mr-2" /> Sign Up with Google
				</Button>
			</div>

			<div className="mt-6">
				<p className="text-xs text-gray-500 text-center leading-relaxed">
					By continuing, you agree to Broken Experience{' '}
					<a href="#" className="text-black hover:text-gray-700 underline">Terms of Service</a>{' '}
					and{' '}
					<a href="#" className="text-black hover:text-gray-700 underline">Privacy Policy</a>.
				</p>
			</div>


		</div>
	);
}
