// Core report interface matching backend schema
export interface IReport {
	id: string;
	reportedBy: string | null;
	description: string;
	categories: string[];
	latitude: string | null;
	longitude: string | null;
	priority: "low" | "medium" | "high" | "urgent";
	upvotes: number;
	downvotes: number;
	visibilityRadius: string | null;
	createdAt: string;
	updatedAt: string;
	resolvedAt: string | null;
}

// Report image interface
export interface IReportImage {
	id: string;
	reportId: string;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
}

// Report verification interface
export interface IReportVerification {
	id: string;
	reportId: string;
	verifiedBy: string;
	verificationStatus: "verified" | "rejected" | "pending";
	verificationNotes: string | null;
	verificationLatitude: string | null;
	verificationLongitude: string | null;
	createdAt: string;
	updatedAt: string;
}

// Extended report with relations
export interface IReportWithRelations extends IReport {
	images: IReportImage[];
	verifications: IReportVerification[];
	isVerified: boolean;
}

// API request/response types
export interface ReportCreate {
	description: string;
	categories: string[];
	latitude?: string;
	longitude?: string;
	priority?: "low" | "medium" | "high" | "urgent";
	images?: File[];
}

export interface ReportResponse {
	success: boolean;
	data?: IReportWithRelations;
	error?: string;
}

export interface ApiError {
	success: false;
	error: string;
}
