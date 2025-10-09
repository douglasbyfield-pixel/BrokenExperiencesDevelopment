import { eden } from "@web/lib/eden";
import Link from "next/link";
import Response from "./feature/response";

export default async function DevPage() {
	const experiences = await eden.experience.get({ $query: {} });
	const createCategories = await eden.category.get({
		$query: { limit: 10, offset: 0 },
	});

	return (
		<div className="flex min-h-dvh flex-col gap-y-4 bg-black py-10">
			{/* Dev Tools Navigation */}
			<div className="mx-auto mb-4 w-full max-w-4xl px-4">
				<h1 className="mb-4 font-bold text-3xl text-white">Dev Tools</h1>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Link
						href="/dev/images"
						className="block rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors hover:bg-gray-700"
					>
						<h3 className="mb-2 font-semibold text-white text-xl">
							📸 Image Storage Test
						</h3>
						<p className="text-gray-400 text-sm">
							View all images from Supabase storage bucket
						</p>
					</Link>
					<Link
						href="/home"
						className="block rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors hover:bg-gray-700"
					>
						<h3 className="mb-2 font-semibold text-white text-xl">
							🏠 Home Feed
						</h3>
						<p className="text-gray-400 text-sm">
							View the main feed with experiences and images
						</p>
					</Link>

					<Link
						href="/dev/upload-test"
						className="block rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors hover:bg-gray-700"
					>
						<h3 className="mb-2 font-semibold text-white text-xl">
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
