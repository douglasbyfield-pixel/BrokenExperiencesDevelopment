import { listAllImages } from "@web/lib/supabase/storage-server";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ImagesTestPage() {
	const images = await listAllImages();

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4">
				{/* Header */}
				<div className="mb-8">
					<Link 
						href="/dev" 
						className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
					>
						← Back to Dev
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">
						Image Storage Test
					</h1>
					<p className="text-gray-600 mt-2">
						Viewing all images from Supabase <code className="bg-gray-200 px-2 py-1 rounded">issue-images</code> bucket
					</p>
					<div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800">
							<strong>Total Images:</strong> {images.length}
						</p>
					</div>
				</div>

				{/* Images Grid */}
				{images.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
						<p className="text-gray-500 text-lg">No images found in storage</p>
						<p className="text-gray-400 text-sm mt-2">
							Upload some images by creating a post on the home page
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{images.map((image) => (
							<div 
								key={image.name}
								className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
							>
								{/* Image */}
								<div className="relative aspect-square bg-gray-100">
									<img
										src={image.url}
										alt={image.name}
										className="w-full h-full object-cover"
									/>
								</div>
								
								{/* Image Info */}
								<div className="p-4">
									<p className="text-xs font-mono text-gray-600 truncate mb-2" title={image.name}>
										{image.name}
									</p>
									<div className="flex justify-between text-xs text-gray-500">
										<span>
											{image.createdAt 
												? new Date(image.createdAt).toLocaleDateString()
												: 'Unknown date'
											}
										</span>
										<span>
											{(image.size / 1024).toFixed(0)} KB
										</span>
									</div>
									<a
										href={image.url}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-3 block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
									>
										Open Original →
									</a>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Instructions */}
				<div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						How to Test
					</h2>
					<ol className="list-decimal list-inside space-y-2 text-gray-700">
						<li>Go to the <Link href="/home" className="text-blue-600 hover:underline">home page</Link></li>
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

