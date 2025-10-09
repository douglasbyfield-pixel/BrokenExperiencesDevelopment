import { listAllImages } from "@web/lib/supabase/storage-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ImagesTestPage() {
	const images = await listAllImages();

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-7xl px-4">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/dev"
						className="mb-4 inline-block text-blue-600 hover:text-blue-700"
					>
						← Back to Dev
					</Link>
					<h1 className="font-bold text-3xl text-gray-900">
						Image Storage Test
					</h1>
					<p className="mt-2 text-gray-600">
						Viewing all images from Supabase{" "}
						<code className="rounded bg-gray-200 px-2 py-1">issue-images</code>{" "}
						bucket
					</p>
					<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
						<p className="text-blue-800 text-sm">
							<strong>Total Images:</strong> {images.length}
						</p>
					</div>
				</div>

				{/* Images Grid */}
				{images.length === 0 ? (
					<div className="rounded-lg border-2 border-gray-300 border-dashed bg-white py-12 text-center">
						<p className="text-gray-500 text-lg">No images found in storage</p>
						<p className="mt-2 text-gray-400 text-sm">
							Upload some images by creating a post on the home page
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{images.map((image) => (
							<div
								key={image.name}
								className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl"
							>
								{/* Image */}
								<div className="relative aspect-square bg-gray-100">
									<img
										src={image.url}
										alt={image.name}
										className="h-full w-full object-cover"
									/>
								</div>

								{/* Image Info */}
								<div className="p-4">
									<p
										className="mb-2 truncate font-mono text-gray-600 text-xs"
										title={image.name}
									>
										{image.name}
									</p>
									<div className="flex justify-between text-gray-500 text-xs">
										<span>
											{image.createdAt
												? new Date(image.createdAt).toLocaleDateString()
												: "Unknown date"}
										</span>
										<span>{(image.size / 1024).toFixed(0)} KB</span>
									</div>
									<a
										href={image.url}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-3 block w-full text-center font-medium text-blue-600 text-sm hover:text-blue-700"
									>
										Open Original →
									</a>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Instructions */}
				<div className="mt-12 rounded-lg border border-gray-200 bg-white p-6">
					<h2 className="mb-4 font-semibold text-gray-900 text-xl">
						How to Test
					</h2>
					<ol className="list-inside list-decimal space-y-2 text-gray-700">
						<li>
							Go to the{" "}
							<Link href="/home" className="text-blue-600 hover:underline">
								home page
							</Link>
						</li>
						<li>Click on "What's broken?" to create a new post</li>
						<li>Add some images using the camera icon</li>
						<li>Submit the post</li>
						<li>Refresh this page to see the uploaded images</li>
					</ol>
				</div>
			</div>
		</div>
	);
}
