import { useForm } from "@tanstack/react-form";
import { Image, SendHorizonal, Type, X } from "lucide-react";
import { useState } from "react";

interface ExperienceFormProps {
	contentType: "camera" | "upload" | "text";
	photos: string[];
	onPhotosChange: (photos: string[]) => void;
	onSubmit: (data: {
		description: string;
		photos: string[];
		categories: string[];
		location?: { lat: number; lng: number };
	}) => void;
	isLoading?: boolean;
	location?: { lat: number; lng: number };
}

export function ExperienceForm({
	contentType,
	photos,
	onPhotosChange,
	onSubmit,
	isLoading = false,
	location,
}: ExperienceFormProps) {
	const [showConfirmation, setShowConfirmation] = useState(false);

	const form = useForm({
		defaultValues: {
			description: "",
			categories: ["Security", "Transportation", "Public space"],
		},
		onSubmit: async ({ value }) => {
			onSubmit({
				description: value.description,
				photos,
				categories: value.categories,
				location,
			});
		},
	});

	const removePhoto = (index: number) => {
		const newPhotos = photos.filter((_, i) => i !== index);
		onPhotosChange(newPhotos);
	};

	const handleSubmit = () => {
		setShowConfirmation(true);
	};

	const handleFinalSubmit = () => {
		form.handleSubmit();
	};

	const handleDescriptionChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		const value = e.target.value;
		form.setFieldValue("description", value);

		// Auto-resize textarea
		const textarea = e.target;
		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
	};

	// Show confirmation view after submit
	if (showConfirmation) {
		return (
			<div className="flex h-screen flex-col bg-white">
				{/* Header */}
				<div className="border-border border-b p-4">
					<h2 className="font-semibold text-gray-900 text-lg">
						Review Your Report
					</h2>
				</div>

				{/* Content */}
				<div className="flex-1 space-y-6 p-4">
					{/* Image */}
					{contentType !== "text" && photos.length > 0 && (
						<div>
							<h3 className="mb-2 font-medium text-gray-700 text-sm">Image</h3>
							<div className="relative">
								{photos.map((photo, index) => (
									<div
										key={photo}
										className="h-48 w-full overflow-hidden rounded-lg"
									>
										{photo.startsWith("blob:") ? (
											<img
												src={photo}
												alt={`Selected ${index + 1}`}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-gray-200">
												<Image className="h-12 w-12 text-gray-400" />
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Description */}
					<div>
						<h3 className="mb-2 font-medium text-gray-700 text-sm">
							Description
						</h3>
						<form.Field
							name="description"
							children={(field) => (
								<p className="rounded-lg bg-gray-50 p-3 text-gray-900">
									{field.state.value}
								</p>
							)}
						/>
					</div>

					{/* Categories */}
					<div>
						<h3 className="mb-2 font-medium text-gray-700 text-sm">
							Categories
						</h3>
						<form.Field
							name="categories"
							children={(field) => (
								<div className="flex flex-wrap gap-2">
									{field.state.value.map((category) => (
										<span
											key={category}
											className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 text-sm"
										>
											{category}
										</span>
									))}
								</div>
							)}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3 border-border border-t p-4">
					<button
						onClick={handleFinalSubmit}
						disabled={isLoading}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Submitting...
							</>
						) : (
							"Submit Report"
						)}
					</button>
					<button
						onClick={() => setShowConfirmation(false)}
						className="w-full rounded-lg bg-gray-100 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
					>
						Edit Report
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col">
			{/* Main content area */}
			<div className="relative flex-1">
				{/* Show selected content - show photos if any exist, regardless of content type */}
				{photos.length > 0 && (
					<div className="absolute inset-0">
						{photos.map((photo, index) => (
							<div key={photo} className="relative h-full w-full">
								{photo.startsWith("blob:") ? (
									<img
										src={photo}
										alt={`Selected ${index + 1}`}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-muted">
										<Image className="h-16 w-16 text-muted-foreground" />
									</div>
								)}
								<button
									onClick={() => removePhoto(index)}
									className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				)}

				{/* Empty state for text-only reports when no photos */}
				{contentType === "text" && photos.length === 0 && (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<div className="text-center">
							<Type className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
							<p className="text-muted-foreground">
								Describe your broken experience
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Caption input overlay */}
			<div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-4">
				<div className="flex w-full items-center justify-between gap-2">
					<form.Field
						name="description"
						children={(field) => (
							<textarea
								id="description"
								value={field.state.value}
								onChange={(e) => {
									field.handleChange(e.target.value);
									handleDescriptionChange(e);
								}}
								placeholder="Describe your experience"
								className="my-2 max-h-[120px] min-h-[40px] w-full resize-none overflow-hidden rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
								style={{ height: "40px" }}
							/>
						)}
					/>
					<button
						onClick={handleSubmit}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
					>
						<SendHorizonal className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
