"use client";

import type { Experience } from "@web/types";
import ExperienceCard from "./experience-card";

interface FeedProps {
	experiences: Experience[] | null;
}

export default function Feed({ experiences }: FeedProps) {
	return (
		<div>
			{experiences && experiences.length > 0 ? (
				experiences.map((experience) => (
					<ExperienceCard key={experience.id} experience={experience} />
				))
			) : (
				<div className="p-8 text-center">
					<p className="text-gray-600">No experiences yet. Be the first to share!</p>
				</div>
			)}
		</div>
	);
}
