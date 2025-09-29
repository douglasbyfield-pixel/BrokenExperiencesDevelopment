'use client'

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<html>
			<body>
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900">Something went wrong!</h1>
						<button 
							onClick={() => reset()}
							className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						>
							Try again
						</button>
					</div>
				</div>
			</body>
		</html>
	)
}