import { eden } from "@web/lib/eden";
import Response from "./feature/response";
import Link from "next/link";

export default async function DevPage() {
	const experiences = await eden.experience.get({ $query: {} });
	const createCategories = await eden.category.get({
		$query: { limit: 10, offset: 0 },
	});

	return (
		<div className="flex min-h-dvh flex-col gap-y-4 bg-black py-10">
			{/* Dev Tools Navigation */}
			<div className="mx-auto w-full max-w-4xl px-4 mb-4">
				<h1 className="text-3xl font-bold text-white mb-4">Dev Tools</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Link 
						href="/dev/images"
						className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
					>
						<h3 className="text-xl font-semibold text-white mb-2">
							📸 Image Storage Test
						</h3>
						<p className="text-gray-400 text-sm">
							View all images from Supabase storage bucket
						</p>
					</Link>
					<Link 
						href="/home" 
						className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
					>
						<h3 className="text-xl font-semibold text-white mb-2">
							🏠 Home Feed
						</h3>
						<p className="text-gray-400 text-sm">
							View the main feed with experiences and images
						</p>
					</Link>
					
					<Link 
						href="/dev/upload-test" 
						className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
					>
						<h3 className="text-xl font-semibold text-white mb-2">
							🧪 Upload Test
						</h3>
						<p className="text-gray-400 text-sm">
							Test image upload functionality and debug issues
						</p>
					</Link>
				</div>
			</div>

			{/* API Response Data */}
			<Response response={experiences} title="Experiences" />
			<Response response={createCategories} title="Categories" />
		</div>
	);
}
