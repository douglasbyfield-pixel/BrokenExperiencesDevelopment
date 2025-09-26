"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase-client";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	return (
		<div className="container mx-auto max-w-md px-4 py-10">
			<h1 className="mb-2 font-semibold text-2xl">Forgot password</h1>
			<p className="mb-6 text-gray-600 text-sm">
				Enter your email and we&apos;ll send you a reset link.
			</p>
			<div className="space-y-3">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<Button
					disabled={!email || loading}
					onClick={async () => {
						setLoading(true);
						const { error } = await supabase.auth.resetPasswordForEmail(email, {
							redirectTo:
								typeof window !== "undefined"
									? `${window.location.origin}/reset-password`
									: undefined,
						});
						setLoading(false);
						if (error) return toast.error(error.message);
						toast.success("Reset link sent. Check your email.");
					}}
				>
					{loading ? "Sending..." : "Send reset link"}
				</Button>
			</div>
		</div>
	);
}
