import { AlertCircle, CheckCircle, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { GoogleMap } from "../../map/components/google-map";
import { AnimatedHeaderText } from "../components/animated-header-text";
import { ExperienceForm } from "../components/experience-form";
import { ExperienceTypeSelection } from "../components/experience-type-selection";
import { useCreateReport } from "../hooks/useCreateReport";

export function ReportPage() {
	const [showContentSelection, setShowContentSelection] = useState(true);
	const [selectedContentType, setSelectedContentType] = useState<
		"camera" | "upload" | "text" | null
	>(null);
	const [photos, setPhotos] = useState<string[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [reportSubmitted, setReportSubmitted] = useState(false);
	const [submittedReportId, setSubmittedReportId] = useState<string | null>(
		null,
	);
	const [currentLocation, setCurrentLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [locationName, setLocationName] = useState<string>("");

	const createReportMutation = useCreateReport();

	// Capture location on mount
	useEffect(() => {
		const getCurrentLocation = () => {
			if (!navigator.geolocation) {
				setLocationName("Geolocation not supported");
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					const location = { lat: latitude, lng: longitude };
					setCurrentLocation(location);
					setLocationName(
						`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
					);
				},
				() => {
					setLocationName("Unable to get location");
				},
			);
		};

		getCurrentLocation();
	}, []);

	const handleContentTypeSelection = (
		type: "camera" | "upload" | "text",
		files?: File[],
	) => {
		setSelectedContentType(type);
		if (files && files.length > 0) {
			setSelectedFiles(files);
			// Create object URLs for preview
			const urls = files.map((file) => URL.createObjectURL(file));
			setPhotos(urls);
		} else if (type === "text") {
			setPhotos([]);
			setSelectedFiles([]);
		}
		setShowContentSelection(false);
	};

	const handleFormSubmit = async (data: {
		description: string;
		photos: string[];
		categories: string[];
		location?: { lat: number; lng: number };
	}) => {
		const reportData = {
			description: data.description,
			categories: data.categories,
			latitude: currentLocation?.lat.toString(),
			longitude: currentLocation?.lng.toString(),
			images: selectedFiles,
		};

		createReportMutation.mutate(reportData, {
			onSuccess: (response) => {
				if (response.data) {
					setSubmittedReportId(response.data.id);
					setReportSubmitted(true);
				}
			},
			onError: (error) => {
				console.error("Error submitting report:", error);
			},
		});
	};

	const handleBackToStart = () => {
		setShowContentSelection(true);
		setSelectedContentType(null);
		setPhotos([]);
		setSelectedFiles([]);
		setReportSubmitted(false);
		setSubmittedReportId(null);
		createReportMutation.reset();
	};

	// Show success screen after report submission
	if (reportSubmitted) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header */}
				<div className="flex items-center justify-between border-border border-b bg-white p-4 text-black">
					<button
						onClick={handleBackToStart}
						className="font-medium text-black"
					>
						<ChevronLeft className="h-6 w-6" />
					</button>
					<h1 className="font-semibold text-lg">Report Submitted</h1>
					<div className="w-6" />
				</div>

				{/* Success Content */}
				<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
					<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-10 w-10 text-green-600" />
					</div>

					<h2 className="mb-2 font-bold text-2xl text-gray-900">
						Report Submitted Successfully!
					</h2>
					<p className="mb-6 max-w-sm text-gray-600">
						Your report has been submitted and is now visible to others in your
						area. Once verified by the community, it will be visible globally.
					</p>

					{submittedReportId && (
						<div className="mb-6 rounded-lg bg-gray-50 p-3">
							<p className="text-gray-500 text-sm">Report ID</p>
							<p className="font-mono text-gray-700 text-sm">
								{submittedReportId}
							</p>
						</div>
					)}

					<button
						onClick={handleBackToStart}
						className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
					>
						Submit Another Report
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="flex items-center justify-between border-border border-b bg-white p-4 text-black">
				<button
					onClick={
						showContentSelection
							? undefined
							: () => setShowContentSelection(true)
					}
					className="font-medium text-black"
				>
					<ChevronLeft className="h-6 w-6" />
				</button>
				<h1 className="font-semibold text-lg">
					<AnimatedHeaderText />
				</h1>
				<div className="w-6" /> {/* Spacer for centering */}
			</div>

			{/* Error Display */}
			{createReportMutation.error && (
				<div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
					<AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
					<div>
						<p className="font-medium text-red-800 text-sm">
							Error submitting report
						</p>
						<p className="mt-1 text-red-600 text-sm">
							{createReportMutation.error.message}
						</p>
						<button
							onClick={() => createReportMutation.reset()}
							className="mt-2 text-red-600 text-sm underline"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}

			{showContentSelection ? (
				<ExperienceTypeSelection onSelect={handleContentTypeSelection} />
			) : (
				<div className="flex h-full flex-col">
					<div className="flex-1">
						<ExperienceForm
							contentType={selectedContentType!}
							photos={photos}
							onPhotosChange={setPhotos}
							onSubmit={handleFormSubmit}
							isLoading={createReportMutation.isPending}
							location={currentLocation || undefined}
						/>
					</div>

					{/* Map showing current location */}
					<div className="h-48 border-border border-t">
						<GoogleMap
							center={currentLocation || { lat: 0, lng: 0 }}
							zoom={15}
							height="100%"
							width="100%"
							showMarker={!!currentLocation}
							markerColor="#3b82f6"
							markerBorderColor="#1e40af"
							markerGlyphColor="#fff"
							isLoading={!currentLocation}
							loadingMessage={locationName || "Loading location..."}
						/>
					</div>
				</div>
			)}

			{/* Loading Overlay */}
			{createReportMutation.isPending && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="flex items-center gap-3 rounded-lg bg-white p-6">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
						<span className="text-gray-700">Submitting report...</span>
					</div>
				</div>
			)}
		</div>
	);
}
