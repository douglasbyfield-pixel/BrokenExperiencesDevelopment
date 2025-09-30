import { db } from "../../db";
import { report, reportImage } from "../../db/schema/report";
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
