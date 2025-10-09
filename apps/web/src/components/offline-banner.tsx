"use client";

export function OfflineBanner() {
	if (navigator.onLine) {
		return null;
	}

	return (
		<div className="bg-red-500 px-4 py-1 text-center font-medium text-white text-xs">
			<span className="flex items-center justify-center gap-2">
				<svg
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
					/>
				</svg>
				You're currently offline. Some features may not be available.
			</span>
		</div>
	);
}
