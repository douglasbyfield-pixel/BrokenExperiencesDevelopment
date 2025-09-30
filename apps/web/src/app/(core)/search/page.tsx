import { eden } from "@web/lib/eden";
import Link from "next/link";
import { Suspense } from "react";
import ExperienceCard from "../home/features/experience-card";

interface SearchPageProps {
	searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
	if (!query || query.trim().length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-600">Enter a search term to find experiences</p>
			</div>
		);
	}

	try {
		const searchResults = await eden.experience.search.get({
			$query: { q: query }
		});

		if (!searchResults.data || searchResults.data.length === 0) {
			return (
				<div className="p-8 text-center">
					<p className="text-gray-600">No experiences found for "{query}"</p>
					<p className="text-gray-500 text-sm mt-2">Try different keywords or check your spelling</p>
				</div>
			);
		}

		return (
			<div>
				<div className="p-4 border-b border-gray-200 bg-gray-50">
					<p className="text-sm text-gray-600">
						Found {searchResults.data.length} experience{searchResults.data.length === 1 ? '' : 's'} for "{query}"
					</p>
				</div>
				{searchResults.data.map((experience) => (
					<ExperienceCard key={experience.id} experience={experience} />
				))}
			</div>
		);
	} catch (error) {
		console.error("Search error:", error);
		return (
			<div className="p-8 text-center">
				<p className="text-red-600">An error occurred while searching</p>
				<p className="text-gray-500 text-sm mt-2">Please try again later</p>
			</div>
		);
	}
}

function SearchLoading() {
	return (
		<div className="space-y-4">
			{[1, 2, 3].map((i) => (
				<div key={i} className="border-b border-gray-200 p-4 animate-pulse">
					<div className="flex space-x-3">
						<div className="h-12 w-12 rounded-full bg-gray-200" />
						<div className="flex-1 space-y-2">
							<div className="h-4 bg-gray-200 rounded w-1/4"></div>
							<div className="h-6 bg-gray-200 rounded w-full"></div>
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const resolvedSearchParams = await searchParams;
	const query = resolvedSearchParams.q || "";

	return (
		<div className="min-h-screen bg-white">
			<div className="mx-auto max-w-2xl">
				<div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
					<div className="flex items-center p-4">
						<Link href="/home" className="mr-4 p-2 rounded-full hover:bg-gray-100">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</Link>
						<h1 className="text-xl font-semibold text-black">Search Results</h1>
					</div>
				</div>
				<Suspense fallback={<SearchLoading />}>
					<SearchResults query={query} />
				</Suspense>
			</div>
		</div>
	);
}