export default function Loading() {
	return (
		<div className="min-h-screen bg-white">
			<div className="animate-pulse">
				<div className="border-gray-200 border-b p-4">
					<div className="h-12 rounded bg-gray-200" />
				</div>
				<div className="border-gray-200 border-b p-4">
					<div className="flex space-x-3">
						<div className="h-12 w-12 rounded-full bg-gray-200" />
						<div className="flex-1 space-y-2">
							<div className="h-6 w-3/4 rounded bg-gray-200" />
							<div className="h-4 w-1/2 rounded bg-gray-200" />
						</div>
					</div>
				</div>
				{[1, 2, 3].map((i) => (
					<div key={i} className="border-gray-200 border-b p-4">
						<div className="flex space-x-3">
							<div className="h-12 w-12 rounded-full bg-gray-200" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-1/4 rounded bg-gray-200" />
								<div className="h-6 w-full rounded bg-gray-200" />
								<div className="h-4 w-3/4 rounded bg-gray-200" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
