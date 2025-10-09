"use client";

import { useExperience } from "@web/hooks/use-experiences";
import { notFound } from "next/navigation";
import React, { use } from "react";
import SharedExperienceClient from "./shared-experience-client";

interface SharedExperiencePageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function SharedExperiencePage({
	params,
}: SharedExperiencePageProps) {
	const { id } = use(params);
	const { data: experience, isLoading, error } = useExperience(id);

	const formatRelativeTime = (dateString: string | Date) => {
		const now = new Date();
		const postDate =
			typeof dateString === "string" ? new Date(dateString) : dateString;
		const diffInMs = now.getTime() - postDate.getTime();
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		// Check if it's the same day
		const isSameDay = now.toDateString() === postDate.toDateString();

		// Check if it's yesterday
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		const isYesterday = postDate.toDateString() === yesterday.toDateString();

		if (isSameDay) {
			if (diffInMinutes < 1) {
				return "Just now";
			}
			if (diffInMinutes < 60) {
				return `${diffInMinutes}m ago`;
			}
			return `${diffInHours}h ago`;
		}
		if (isYesterday) {
			return "Yesterday";
		}
		// Format as "Sep 9" style
		return postDate.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	const displayName =
		experience?.reportedBy?.name ||
		experience?.reportedBy?.email?.split("@")[0] ||
		"Anonymous";

	if (isLoading) {
		return (
			<div className="mx-auto">
				<div className="animate-pulse">
					<div className="flex items-start gap-3 p-4">
						<div className="h-10 w-10 rounded-full bg-gray-200" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-32 rounded bg-gray-200" />
						</div>
					</div>
					<div className="space-y-3 px-4 pb-3">
						<div className="h-4 w-3/4 rounded bg-gray-200" />
						<div className="h-4 w-1/2 rounded bg-gray-200" />
						<div className="h-4 w-2/3 rounded bg-gray-200" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !experience) {
		notFound();
	}

	return (
		<SharedExperienceClient
			experience={experience}
			displayName={displayName}
			formatRelativeTime={formatRelativeTime}
		/>
	);
}
