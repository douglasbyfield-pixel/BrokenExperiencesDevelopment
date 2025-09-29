import { Button } from "@/components/ui/button";
import { eden } from "@/lib/eden";
import CreateExperienceCard from "./features/create-experience-card";
import Feed from "./features/feed";
import FeedHeader from "./features/feed-header";

export default async function HomePage() {
	const experiences = await eden.experience.get({ $query: {} });
	const categoryOptions = await eden.category.options.get();

	return (
		<div className="flex min-h-dvh w-full min-w-0 flex-col transition-all duration-300 lg:flex-row">
			<div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
				<FeedHeader />
				<div className="flex min-h-dvh w-full flex-col transition-all duration-300 lg:flex-row">
					<div className="mx-auto max-w-3xl space-y-4 p-4">
						<CreateExperienceCard categoryOptions={Array.isArray(categoryOptions.data) ? categoryOptions.data : []} />
						<Feed experiences={experiences.data} />
						<div className="py-8 text-center">
							<Button variant="outline" className="rounded-full px-8">
								Load More Experiences
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
