import { Button } from "@/components/ui/button";
import { eden } from "@/lib/eden";
import { mockPosts } from "@/mock/post";
import CreatePost from "./features/create-post-card";
import ExperienceCard from "./features/experience-card";

export default async function HomePage() {
	const experiences = await eden.experience.get({ $query: {} });
	const createCategories = await eden.category.post({ name: "Animals" });
	const categories = await eden.category.get({
		$query: { limit: 10, offset: 0 },
	});
	return (
		<div className="container mx-auto flex min-h-screen text-white">
			<pre>{JSON.stringify(createCategories, null, 2)}</pre>
			<pre>{JSON.stringify(experiences, null, 2)}</pre>
			<pre>{JSON.stringify(categories, null, 2)}</pre>
			{/* Main Content - Scrollable */}
			<div className="flex-1 overflow-y-auto bg-black">
				{/* Header with tabs */}
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

				<div className="mx-auto max-w-2xl space-y-4 p-4">
					{/* Create Post Section */}
					<CreatePost />

					{/* Feed */}
					<div className="space-y-4">
						{mockPosts.map((post) => (
							<ExperienceCard key={post.id} post={post} />
						))}
					</div>

					{/* Load More */}
					<div className="py-8 text-center">
						<Button variant="outline" className="rounded-full px-8">
							Load More Posts
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
