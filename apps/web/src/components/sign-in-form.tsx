import { supabase } from "@/lib/supabase-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useSupabaseSession } from "@/lib/use-supabase-session";
import { Dialog } from "./ui/dialog";
import { useState } from "react";
import { AppleLogo } from "./icons/apple-logo";
import { GoogleLogo } from "./icons/google-logo";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
    const { loading } = useSupabaseSession();
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [sending, setSending] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
        onSubmit: async ({ value }) => {
            const { error } = await supabase.auth.signInWithPassword({
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

    // Show form even if loading; Supabase session loads lazily

	return (
		<div className="w-full">
			<div className="text-center mb-6">
				<h2 className="text-xl font-bold text-black mb-2">Welcome back</h2>
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
								<Label htmlFor={field.name} className="text-sm font-medium text-gray-900">
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
								<Label htmlFor={field.name} className="text-sm font-medium text-gray-900">
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
                        onClick={() => setForgotOpen(true)}
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
					className="w-full h-12 justify-center text-black border-gray-300 hover:bg-gray-50 hover:text-black"
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
					<GoogleLogo className="mr-2" /> Sign In with Google
				</Button>
			</div>

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

			{/* Forgot Password Modal */}
			<ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
		</div>
	);
}

// Inline modal for forgot password
function ForgotPasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [touched, setTouched] = useState(false);
    const isValidEmail = z.string().email().safeParse(email).success;
    const showError = touched && !isValidEmail;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} title="Reset your password">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fp-email" className="text-sm font-medium text-black">Email</Label>
                    <Input
                        id="fp-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onBlur={() => setTouched(true)}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full h-12 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black bg-white transition-all duration-200 ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {showError ? (
                        <p className="text-sm text-red-500">Enter a valid email address</p>
                    ) : null}
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 border-2 border-gray-300 text-black hover:bg-gray-50 hover:text-black rounded-xl transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!isValidEmail || sending}
                        onClick={async () => {
                            setSending(true);
                            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
                            });
                            setSending(false);
                            if (error) {
                                toast.error(error.message);
                                return;
                            }
                            onOpenChange(false);
                            // Show toast after closing modal to avoid any overlay stacking issues
                            setTimeout(() => {
                                toast.success("If an account exists for this email, a reset link has been sent.");
                            }, 0);
                        }}
                        className="px-6 py-2 bg-black hover:bg-gray-800 text-white hover:text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? "Sending..." : "Send link"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
