import type { Experience } from "@web/types";
import ExperienceCard from "./experience-card";

interface FeedProps {
	experiences: Experience[] | null;
}

export default function Feed({ experiences }: FeedProps) {
	return (
		<main className="relative mb-8 flex min-h-0 w-full min-w-0 max-w-full flex-col">
			<div className="mx-auto flex min-h-[88dvh] w-[1208px] min-w-0 max-w-full justify-center lg:min-h-0">
				<div className="flex w-full flex-col space-y-4 overflow-auto p-4 pr-0! lg:p-6">
					{experiences?.map((experience) => (
						<ExperienceCard key={experience.id} experience={experience} />
					))}
				</div>
			</div>
		</main>
	);
}
