export interface Issue {
	id: string;
	title: string;
	description: string;
	status: "pending" | "in_progress" | "resolved";
	priority: "low" | "medium" | "high" | "critical";
	location: {
		latitude: number;
		longitude: number;
		address: string;
	};
	reportedBy: string;
	reportedAt: string;
	category:
		| "infrastructure"
		| "safety"
		| "environment"
		| "maintenance"
		| "accessibility";
	imageUrl?: string;
	upvotes: number;
	comments: Comment[];
}

export interface Comment {
	id: string;
	text: string;
	author: string;
	createdAt: string;
}

export interface User {
	id: string;
	email: string;
	displayName?: string;
	createdAt: string;
}

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	issuesReported: number;
	issuesResolved: number;
	reputation: number;
	joinedAt: string;
	badges: Badge[];
}

export interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	earnedAt: string;
}
