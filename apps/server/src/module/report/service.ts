import { db } from "../../db";
import { report, reportImage, reportVerification } from "../../db/schema/report";
import { eq } from "drizzle-orm";
import type { ReportCreate } from "./model";

export async function createReport({ data }: { data: ReportCreate }) {
	try {
		// Create the report
		const [newReport] = await db
			.insert(report)
			.values({
				description: data.description,
				categories: data.categories,
				latitude: data.latitude,
				longitude: data.longitude,
				status: data.status,
				priority: data.priority,
			})
			.returning();

		// Handle image uploads if provided
		if (data.images && data.images.length > 0) {
			const imageRecords = data.images.map((image) => ({
				reportId: newReport.id,
				imageUrl: image.name, // In production, this would be the uploaded file URL
			}));

			await db.insert(reportImage).values(imageRecords);
		}

		return {
			success: true,
			data: newReport,
		};
	} catch (error) {
		console.error("Error creating report:", error);
		return {
			success: false,
			error: "Failed to create report",
		};
	}
}

export async function getReport({ id }: { id: string }) {
	try {
		// Get the report
		const [reportData] = await db
			.select()
			.from(report)
			.where(eq(report.id, id))
			.limit(1);

		if (!reportData) {
			return {
				success: false,
				error: "Report not found",
			};
		}

		// Get associated images
		const images = await db
			.select()
			.from(reportImage)
			.where(eq(reportImage.reportId, id));

		// Get verification status
		const verifications = await db
			.select()
			.from(reportVerification)
			.where(eq(reportVerification.reportId, id));

		// Check if report is verified (has at least one verified verification)
		const isVerified = verifications.some(v => v.verificationStatus === "verified");

		return {
			success: true,
			data: {
				...reportData,
				images,
				verifications,
				isVerified,
			},
		};
	} catch (error) {
		console.error("Error fetching report:", error);
		return {
			success: false,
			error: "Failed to fetch report",
		};
	}
}
