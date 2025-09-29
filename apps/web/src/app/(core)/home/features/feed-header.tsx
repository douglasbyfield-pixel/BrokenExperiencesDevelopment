export default function FeedHeader() {
	return (
		<div className="sticky top-0 z-10 border-gray-800 border-b bg-black">
			<div className="flex">
				<button
					type="button"
					className="flex-1 border-blue-500 border-b-2 py-4 text-center font-semibold text-white"
				>
					For you
				</button>
				<button
					type="button"
					className="flex-1 border-gray-800 border-b py-4 text-center font-semibold text-gray-400 hover:bg-gray-800"
				>
					Following
				</button>
			</div>
		</div>
	);
}
