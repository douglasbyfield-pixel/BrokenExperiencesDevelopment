import { cn } from "@web/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
				className,
			)}
			{...props}
		/>
	);
}

// Experience card skeleton
export function ExperienceCardSkeleton() {
	return (
		<div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
			{/* Header */}
			<div className="flex items-center space-x-3">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
				</div>
				<Skeleton className="h-6 w-16 rounded-full" />
			</div>

			{/* Title */}
			<Skeleton className="h-5 w-full" />

			{/* Description */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-4/5" />
				<Skeleton className="h-4 w-3/5" />
			</div>

			{/* Image placeholder */}
			<Skeleton className="h-48 w-full rounded-lg" />

			{/* Actions */}
			<div className="flex items-center justify-between">
				<div className="flex space-x-4">
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-8 w-16" />
				</div>
				<Skeleton className="h-8 w-20" />
			</div>
		</div>
	);
}

// Feed skeleton
export function FeedSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div className="space-y-6">
			{Array.from({ length: count }).map((_, i) => (
				<ExperienceCardSkeleton key={i} />
			))}
		</div>
	);
}

// Map skeleton
export function MapSkeleton() {
	return (
		<div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
			<div className="space-y-4 text-center">
				<Skeleton className="mx-auto h-12 w-12 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="mx-auto h-4 w-32" />
					<Skeleton className="mx-auto h-3 w-24" />
				</div>
			</div>
		</div>
	);
}

// Leaderboard skeleton
export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="flex items-center space-x-4 rounded-lg border bg-white p-3"
				>
					<Skeleton className="h-8 w-8 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<Skeleton className="h-6 w-16" />
				</div>
			))}
		</div>
	);
}

// Profile skeleton
export function ProfileSkeleton() {
	return (
		<div className="space-y-6">
			{/* Profile header */}
			<div className="space-y-4 text-center">
				<Skeleton className="mx-auto h-24 w-24 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="mx-auto h-6 w-32" />
					<Skeleton className="mx-auto h-4 w-24" />
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="space-y-2 text-center">
						<Skeleton className="mx-auto h-8 w-12" />
						<Skeleton className="mx-auto h-3 w-16" />
					</div>
				))}
			</div>

			{/* Content */}
			<div className="space-y-4">
				<Skeleton className="h-6 w-24" />
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-16 w-full rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
}
