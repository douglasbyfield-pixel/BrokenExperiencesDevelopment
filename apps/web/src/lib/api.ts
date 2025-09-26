export async function checkEmailExists(email: string): Promise<boolean> {
	const base = process.env.NEXT_PUBLIC_SERVER_URL;
	if (!base) return false;
	try {
		const res = await fetch(`${base}/misc/auth/email-exists`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		const data = await res.json();
		return Boolean(data?.exists);
	} catch {
		return false;
	}
}
