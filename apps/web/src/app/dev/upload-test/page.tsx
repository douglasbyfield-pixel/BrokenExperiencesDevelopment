"use client";

import { Button } from "@web/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { uploadExperienceImage } from "@web/lib/supabase/storage";
import { useState } from "react";

export default function UploadTestPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [uploadResult, setUploadResult] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setError(null);
			setUploadResult(null);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		setUploading(true);
		setError(null);
		setUploadResult(null);

		try {
			console.log("🚀 Starting upload test...");
			const imageUrl = await uploadExperienceImage(selectedFile);
			console.log("✅ Upload successful:", imageUrl);
			setUploadResult(imageUrl);
		} catch (err) {
			console.error("❌ Upload failed:", err);
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 p-8 text-white">
			<div className="mx-auto max-w-2xl">
				<a href="/dev" className="mb-6 block text-blue-400 hover:underline">
					&larr; Back to Dev Tools
				</a>

				<h1 className="mb-8 text-center font-bold text-4xl">
					🧪 Image Upload Test
				</h1>

				<Card className="border-gray-700 bg-gray-800">
					<CardHeader>
						<CardTitle>Test Image Upload</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="mb-2 block font-medium text-sm">
								Select an image file:
							</label>
							<input
								type="file"
								accept="image/*"
								onChange={handleFileSelect}
								className="block w-full text-gray-300 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-sm file:text-white hover:file:bg-blue-700"
							/>
						</div>

						{selectedFile && (
							<div className="rounded-lg bg-gray-700 p-4">
								<p className="text-sm">
									<strong>Selected file:</strong> {selectedFile.name}
								</p>
								<p className="text-sm">
									<strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)}{" "}
									KB
								</p>
								<p className="text-sm">
									<strong>Type:</strong> {selectedFile.type}
								</p>
							</div>
						)}

						<Button
							onClick={handleUpload}
							disabled={!selectedFile || uploading}
							className="w-full"
						>
							{uploading ? "Uploading..." : "Upload Image"}
						</Button>

						{error && (
							<div className="rounded-lg border border-red-700 bg-red-900 p-4">
								<p className="font-medium text-red-200">Error:</p>
								<p className="text-red-300 text-sm">{error}</p>
							</div>
						)}

						{uploadResult && (
							<div className="rounded-lg border border-green-700 bg-green-900 p-4">
								<p className="font-medium text-green-200">Success!</p>
								<p className="mb-3 text-green-300 text-sm">
									Image uploaded successfully
								</p>
								<div className="space-y-2">
									<p className="text-green-300 text-sm">
										<strong>URL:</strong> {uploadResult}
									</p>
									<div className="mt-3">
										<img
											src={uploadResult}
											alt="Uploaded image"
											className="h-auto max-w-full rounded-lg border border-gray-600"
											style={{ maxHeight: "300px" }}
										/>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="mt-8 rounded-lg border border-blue-700 bg-blue-900 p-4">
					<h3 className="mb-2 font-semibold text-lg">Debug Info</h3>
					<p className="text-blue-200 text-sm">
						Check the browser console for detailed upload logs. This test will
						help us identify if the issue is with file upload, Supabase
						configuration, or image rendering.
					</p>
				</div>
			</div>
		</div>
	);
}
