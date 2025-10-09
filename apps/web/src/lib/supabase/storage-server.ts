import { createClient } from "./server";

/**
 * List all files in the issue-images bucket
 * For use in Server Components only
 */
export async function listAllImages() {
	try {
		const supabase = await createClient();

		// List files directly in the bucket root
		const { data, error } = await supabase.storage
			.from("issue-images")
			.list("", {
				limit: 100,
				offset: 0,
				sortBy: { column: "created_at", order: "desc" },
			});

		if (error) {
			console.error("Error listing images:", error);
			return [];
		}

		if (!data || data.length === 0) {
			console.log("No images found in storage");
			return [];
		}

		console.log("Found", data.length, "images in storage");

		// Get public URLs for all files
		return data.map((file) => {
			const {
				data: { publicUrl },
			} = supabase.storage.from("issue-images").getPublicUrl(file.name);

			return {
				name: file.name,
				url: publicUrl,
				createdAt: file.created_at,
				size: file.metadata?.size || 0,
			};
		});
	} catch (err) {
		console.error("Exception in listAllImages:", err);
		return [];
	}
}

/**
 * Get a single image URL by filename
 * For use in Server Components only
 */
export async function getImageUrl(filename: string): Promise<string> {
	const supabase = await createClient();
	const {
		data: { publicUrl },
	} = supabase.storage.from("issue-images").getPublicUrl(filename);

	return publicUrl;
}

/**
 * Delete an image from storage
 * For use in Server Components only
 */
export async function deleteImage(filename: string): Promise<boolean> {
	const supabase = await createClient();

	const { error } = await supabase.storage
		.from("issue-images")
		.remove([filename]);

	if (error) {
		console.error("Error deleting image:", error);
		return false;
	}

	return true;
}
