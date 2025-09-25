import { db } from "../../db";
import { issue } from "../../db/schema";
import { eq, and, or, gte, lte } from "drizzle-orm";

// Mock data for demo purposes - Jamaica locations only
const mockIssues = [
	{
		id: "issue-1",
		title: "Broken Streetlight on Hope Road",
		description: "The streetlight near UWI campus has been out for 2 weeks",
		latitude: 18.0179,
		longitude: -76.7426,
		address: "Hope Road, Kingston 6, Jamaica",
		status: "reported" as const,
		severity: "high" as const,
		reporterId: "demo-user",
		categoryId: "lighting",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-01-15"),
		upvotes: 12,
		downvotes: 1
	},
	{
		id: "issue-2",
		title: "Pothole on Spanish Town Road",
		description: "Large pothole causing damage to vehicles near Coronation Market",
		latitude: 17.9692,
		longitude: -76.8103,
		address: "Spanish Town Road, Kingston, Jamaica",
		status: "pending" as const,
		severity: "critical" as const,
		reporterId: "demo-user",
		categoryId: "roads",
		createdAt: new Date("2024-01-20"),
		updatedAt: new Date("2024-01-22"),
		upvotes: 25,
		downvotes: 0
	},
	{
		id: "issue-3",
		title: "Water Main Break in Half Way Tree",
		description: "Water main burst causing flooding on Constant Spring Road",
		latitude: 18.0175,
		longitude: -76.7966,
		address: "Constant Spring Road, Kingston 10, Jamaica",
		status: "pending" as const,
		severity: "critical" as const,
		reporterId: "demo-user",
		categoryId: "water",
		createdAt: new Date("2024-01-10"),
		updatedAt: new Date("2024-01-18"),
		upvotes: 35,
		downvotes: 0
	},
	{
		id: "issue-4",
		title: "Broken Traffic Light in New Kingston",
		description: "Traffic light not working properly at major intersection",
		latitude: 18.0051,
		longitude: -76.7837,
		address: "Knutsford Boulevard & Trafalgar Road, Kingston 5, Jamaica",
		status: "pending" as const,
		severity: "critical" as const,
		reporterId: "demo-user",
		categoryId: "traffic",
		createdAt: new Date("2024-01-25"),
		updatedAt: new Date("2024-01-25"),
		upvotes: 30,
		downvotes: 0
	},
	{
		id: "issue-5",
		title: "Overflowing Garbage Collection Point",
		description: "Garbage collection point hasn't been emptied in days, attracting pests",
		latitude: 18.0199,
		longitude: -76.8018,
		address: "Cross Roads, Kingston, Jamaica",
		status: "reported" as const,
		severity: "medium" as const,
		reporterId: "demo-user",
		categoryId: "sanitation",
		createdAt: new Date("2024-01-28"),
		updatedAt: new Date("2024-01-28"),
		upvotes: 18,
		downvotes: 1
	},
	{
		id: "issue-6",
		title: "Fallen Tree Blocking Road",
		description: "Large tree fell across road after storm, blocking traffic",
		latitude: 18.0456,
		longitude: -76.7300,
		address: "Blue Mountain Road, Kingston, Jamaica",
		status: "resolved" as const,
		severity: "high" as const,
		reporterId: "demo-user",
		categoryId: "environment",
		createdAt: new Date("2024-01-20"),
		updatedAt: new Date("2024-01-21"),
		resolvedAt: new Date("2024-01-21"),
		upvotes: 22,
		downvotes: 0
	},
	{
		id: "issue-7",
		title: "Power Line Down in Downtown Kingston",
		description: "Electrical power line down after storm, area unsafe",
		latitude: 17.9712,
		longitude: -76.7655,
		address: "Orange Street, Kingston, Jamaica",
		status: "pending" as const,
		severity: "critical" as const,
		reporterId: "demo-user",
		categoryId: "utilities",
		createdAt: new Date("2024-01-26"),
		updatedAt: new Date("2024-01-26"),
		upvotes: 45,
		downvotes: 0
	},
	{
		id: "issue-8",
		title: "Bridge Damage in Montego Bay",
		description: "Bridge structure showing cracks and needs urgent repair",
		latitude: 18.4762,
		longitude: -77.8939,
		address: "Hip Strip, Montego Bay, St. James, Jamaica",
		status: "reported" as const,
		severity: "high" as const,
		reporterId: "demo-user",
		categoryId: "infrastructure",
		createdAt: new Date("2024-01-22"),
		updatedAt: new Date("2024-01-22"),
		upvotes: 28,
		downvotes: 2
	},
	{
		id: "issue-9",
		title: "Sewer Overflow in Spanish Town",
		description: "Sewer system overflowing causing unsanitary conditions",
		latitude: 17.9909,
		longitude: -76.9552,
		address: "Spanish Town Square, St. Catherine, Jamaica",
		status: "pending" as const,
		severity: "critical" as const,
		reporterId: "demo-user",
		categoryId: "sanitation",
		createdAt: new Date("2024-01-24"),
		updatedAt: new Date("2024-01-25"),
		upvotes: 38,
		downvotes: 1
	},
	{
		id: "issue-10",
		title: "Road Closure in Ocho Rios",
		description: "Landslide blocking main road to tourist attractions",
		latitude: 18.4078,
		longitude: -77.1030,
		address: "Main Street, Ocho Rios, St. Ann, Jamaica",
		status: "pending" as const,
		severity: "high" as const,
		reporterId: "demo-user",
		categoryId: "roads",
		createdAt: new Date("2024-01-27"),
		updatedAt: new Date("2024-01-27"),
		upvotes: 42,
		downvotes: 0
	},
	{
		id: "issue-11",
		title: "Port Security Concerns",
		description: "Inadequate lighting at port area creating safety issues",
		latitude: 18.4692,
		longitude: -77.9197,
		address: "Port of Montego Bay, Jamaica",
		status: "reported" as const,
		severity: "medium" as const,
		reporterId: "demo-user",
		categoryId: "safety",
		createdAt: new Date("2024-01-29"),
		updatedAt: new Date("2024-01-29"),
		upvotes: 15,
		downvotes: 3
	}
];

export const issueService = {
	async getIssues(filters?: {
		status?: string[];
		severity?: string[];
		bounds?: {
			north: number;
			south: number;
			east: number;
			west: number;
		};
	}) {
		// Return mock data for demo
		let filteredIssues = [...mockIssues];
		
		if (filters?.status && filters.status.length > 0) {
			filteredIssues = filteredIssues.filter(issue => 
				filters.status!.includes(issue.status)
			);
		}
		
		if (filters?.severity && filters.severity.length > 0) {
			filteredIssues = filteredIssues.filter(issue => 
				filters.severity!.includes(issue.severity)
			);
		}
		
		if (filters?.bounds) {
			const { north, south, east, west } = filters.bounds;
			filteredIssues = filteredIssues.filter(issue => {
				const lat = parseFloat(issue.latitude.toString());
				const lng = parseFloat(issue.longitude.toString());
				return lat >= south && lat <= north && lng >= west && lng <= east;
			});
		}
		
		return filteredIssues;
	},
	
	async getIssueById(id: string) {
		return mockIssues.find(issue => issue.id === id) || null;
	},
	
	async createIssue(data: {
		title: string;
		description: string;
		latitude: number;
		longitude: number;
		address?: string;
		severity: "low" | "medium" | "high" | "critical";
		reporterId: string;
		categoryId?: string;
		imageUrls?: string[];
	}) {
		const newIssue = {
			id: `issue-${Date.now()}`,
			...data,
			status: "reported" as const,
			createdAt: new Date(),
			updatedAt: new Date(),
			upvotes: 0,
			downvotes: 0
		};
		
		mockIssues.push(newIssue);
		return newIssue;
	},
	
	async updateIssueStatus(id: string, status: "reported" | "pending" | "resolved") {
		const issue = mockIssues.find(i => i.id === id);
		if (issue) {
			issue.status = status;
			issue.updatedAt = new Date();
			if (status === "resolved") {
				issue.resolvedAt = new Date();
			}
		}
		return issue;
	},
	
	async voteIssue(id: string, voteType: "upvote" | "downvote") {
		const issue = mockIssues.find(i => i.id === id);
		if (issue) {
			if (voteType === "upvote") {
				issue.upvotes++;
			} else {
				issue.downvotes++;
			}
			issue.updatedAt = new Date();
		}
		return issue;
	},
	
	async getIssuesByUser(userId: string) {
		return mockIssues.filter(issue => issue.reporterId === userId);
	},
	
	async getNearbyIssues(lat: number, lng: number, radiusKm: number) {
		// Calculate distance between two coordinates using Haversine formula
		const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
			const R = 6371; // Earth's radius in kilometers
			const dLat = (lat2 - lat1) * Math.PI / 180;
			const dLng = (lng2 - lng1) * Math.PI / 180;
			const a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
				Math.sin(dLng/2) * Math.sin(dLng/2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			const distance = R * c;
			return distance;
		};
		
		return mockIssues.filter(issue => {
			const distance = calculateDistance(
				lat,
				lng,
				issue.latitude,
				issue.longitude
			);
			return distance <= radiusKm;
		}).map(issue => ({
			...issue,
			distance: calculateDistance(lat, lng, issue.latitude, issue.longitude)
		})).sort((a, b) => a.distance - b.distance);
	},
	
	async getIssueStats() {
		const total = mockIssues.length;
		const reported = mockIssues.filter(i => i.status === "reported").length;
		const pending = mockIssues.filter(i => i.status === "pending").length;
		const resolved = mockIssues.filter(i => i.status === "resolved").length;
		
		const byCategory: Record<string, number> = {};
		const bySeverity: Record<string, number> = {
			low: 0,
			medium: 0,
			high: 0,
			critical: 0
		};
		
		mockIssues.forEach(issue => {
			// Count by category
			const category = issue.categoryId || "other";
			byCategory[category] = (byCategory[category] || 0) + 1;
			
			// Count by severity
			bySeverity[issue.severity]++;
		});
		
		// Calculate resolution rate
		const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
		
		// Calculate average resolution time
		const resolvedIssues = mockIssues.filter(i => i.status === "resolved" && i.resolvedAt);
		const avgResolutionTime = resolvedIssues.length > 0
			? resolvedIssues.reduce((sum, issue) => {
				const resolutionTime = issue.resolvedAt!.getTime() - issue.createdAt.getTime();
				return sum + resolutionTime;
			}, 0) / resolvedIssues.length / (1000 * 60 * 60 * 24) // Convert to days
			: 0;
		
		return {
			total,
			byStatus: {
				reported,
				pending,
				resolved
			},
			byCategory,
			bySeverity,
			resolutionRate: Math.round(resolutionRate),
			avgResolutionDays: Math.round(avgResolutionTime),
			mostReportedCategory: Object.entries(byCategory)
				.sort((a, b) => b[1] - a[1])[0]?.[0] || "none",
			totalUpvotes: mockIssues.reduce((sum, issue) => sum + issue.upvotes, 0)
		};
	}
};