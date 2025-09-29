"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase-client";

function VerifyContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const emailFromQuery = searchParams.get("email") ?? "";
	const [email, setEmail] = useState<string>(emailFromQuery);
	const [resending, setResending] = useState(false);
	const [justResent, setJustResent] = useState(false);
	const [code, setCode] = useState("");
	const [verifying, setVerifying] = useState(false);

	useEffect(() => {
		// If user completes email confirmation, Supabase will sign them in and
		// we'll see an auth state change → redirect to onboarding.
		const sub = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_IN" && session) {
				const { data: prof } = await supabase
					.from("user_profiles")
					.select("id")
					.eq("auth_user_id", session.user.id)
					.limit(1)
					.maybeSingle();
				if (prof) router.replace("/home");
				else router.replace("/onboarding/participation");
			}
		});

		// Also check current session in case email confirmation is disabled.
		supabase.auth.getSession().then(async ({ data }) => {
			if (data.session) {
				const { data: prof } = await supabase
					.from("user_profiles")
					.select("id")
					.eq("auth_user_id", data.session.user.id)
					.limit(1)
					.maybeSingle();
				if (prof) router.replace("/home");
				else router.replace("/onboarding/participation");
			}
		});

		return () => {
			sub.data.subscription.unsubscribe();
		};
	}, [router]);

	const canResend = useMemo(() => {
		return email.length > 3 && email.includes("@");
	}, [email]);

	return (
		<div className="container mx-auto max-w-md px-4 py-10">
			<div className="space-y-4 text-center">
				<h1 className="font-semibold text-2xl">Verify your email</h1>
				<p className="text-muted-foreground">
					We sent a verification link to your email. Please click the link to
					complete your registration.
				</p>
				<div className="flex justify-center py-6">
					<Loader />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Didn&apos;t get the email? You can resend it.
					</p>
					<div className="flex justify-center gap-2">
						<input
							type="email"
							className="w-64 rounded border px-3 py-2"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Button
							disabled={!canResend || resending}
							onClick={async () => {
								if (!canResend) return;
								setResending(true);
								setJustResent(false);
								const { error } = await supabase.auth.resend({
									type: "signup",
									email,
								});
								setResending(false);
								if (!error) {
									setJustResent(true);
								}
							}}
						>
							{resending ? "Resending..." : "Resend email"}
						</Button>
					</div>
					<p className="text-gray-500 text-xs">
						After clicking the link, you will be brought back to the app
						automatically.
					</p>
					{justResent ? (
						<p className="text-green-600 text-xs">Verification email sent.</p>
					) : null}
				</div>
				<div className="mx-auto max-w-sm space-y-3 pt-6 text-left">
					<Label htmlFor="otp">Or enter the 6-digit code from the email</Label>
					<Input
						id="otp"
						inputMode="numeric"
						pattern="[0-9]*"
						maxLength={6}
						placeholder="123456"
						value={code}
						onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
					/>
					<Button
						disabled={code.length !== 6 || verifying}
						onClick={async () => {
							setVerifying(true);
							const { error } = await supabase.auth.verifyOtp({
								email,
								token: code,
								type: "signup",
							});
							setVerifying(false);
							if (error) {
								toast.error(error.message);
								return;
							}
							toast.success("Verification successful");
							router.replace("/onboarding/participation");
						}}
					>
						{verifying ? "Verifying..." : "Verify code"}
					</Button>
				</div>
				<div className="pt-4 text-muted-foreground text-xs">
					After confirming, you&apos;ll be redirected automatically.
				</div>
			</div>
		</div>
	);
}

export default function VerifyPage() {
	return (
		<Suspense fallback={<div className="container mx-auto max-w-md px-4 py-10 text-center"><Loader /></div>}>
			<VerifyContent />
		</Suspense>
	);
}
