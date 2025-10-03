export default function Loading() {
	return (
		<div className="min-h-screen bg-white">
			<div className="animate-pulse">
				<div className="border-b border-gray-200 p-4">
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
				<div className="border-b border-gray-200 p-4">
					<div className="flex space-x-3">
						<div className="h-12 w-12 rounded-full bg-gray-200" />
						<div className="flex-1 space-y-2">
							<div className="h-6 bg-gray-200 rounded w-3/4"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						</div>
					</div>
				</div>
				{[1, 2, 3].map((i) => (
					<div key={i} className="border-b border-gray-200 p-4">
						<div className="flex space-x-3">
							<div className="h-12 w-12 rounded-full bg-gray-200" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-gray-200 rounded w-1/4"></div>
								<div className="h-6 bg-gray-200 rounded w-full"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							</div>
					</div>
				</div>
			))}
			</div>
		</div>
	);
}