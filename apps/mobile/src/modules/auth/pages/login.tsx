import { SignInForm } from "../components/sign-in-form";

export function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<h1 className="font-bold text-2xl">Welcome Back</h1>
					<p className="text-muted-foreground">Sign in to your account</p>
				</div>
				<SignInForm />
			</div>
		</div>
	);
}
