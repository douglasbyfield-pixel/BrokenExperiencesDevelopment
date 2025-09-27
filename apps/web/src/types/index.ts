export interface Post {
	id: string;
	user: {
		name: string;
		username: string;
		avatar: string;
		verified: boolean;
	};
	content: string;
	timestamp: string;
	location: string;
	likes: number;
	comments: number;
	shares: number;
	isLiked: boolean;
}
