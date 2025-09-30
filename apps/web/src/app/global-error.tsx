"use client";

import { Button } from "@web/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="font-bold text-4xl text-gray-900">
							Something went wrong!
						</h1>
						<Button
							onClick={() => reset()}
							className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						>
							Try again
						</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
