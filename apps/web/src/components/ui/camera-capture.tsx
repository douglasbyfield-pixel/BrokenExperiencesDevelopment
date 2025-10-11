"use client";

import { useCamera } from "@web/context/CameraContext";
import { Camera, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
	onCapture: (file: File) => void;
	onClose: () => void;
	isOpen: boolean;
}

export function CameraCapture({
	onCapture,
	onClose,
	isOpen,
}: CameraCaptureProps) {
	const { setIsCameraActive } = useCamera();
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [capturedImages, setCapturedImages] = useState<string[]>([]);
	const [showCaptureFlash, setShowCaptureFlash] = useState(false);

	// Handle video stream when component mounts or stream changes
	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
			videoRef.current.play().catch(console.error);
		}
	}, [stream]);

	// Start camera when modal opens and update camera context
	useEffect(() => {
		if (isOpen) {
			startCamera();
			setIsCameraActive(true);
		} else {
			stopCamera();
			setIsCameraActive(false);
		}
	}, [isOpen, setIsCameraActive]);

	const startCamera = async () => {
		try {
			setError(null);
			// Check if getUserMedia is supported
			if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: "environment", // Use rear camera
					},
				});
				setStream(mediaStream);
			} else {
				setError("Camera not supported on this device");
			}
		} catch (error) {
			console.error("Camera access denied or not available:", error);
			setError(
				"Camera access denied. Please allow camera access to take photos.",
			);
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
		}
	};

	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");

			if (ctx) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				ctx.drawImage(video, 0, 0);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const file = new File([blob], `camera-${Date.now()}.jpg`, {
								type: "image/jpeg",
							});

							// Create preview URL for captured image
							const imageUrl = URL.createObjectURL(blob);
							setCapturedImages((prev) => [...prev, imageUrl]);

							// Show capture flash effect
							setShowCaptureFlash(true);
							setTimeout(() => setShowCaptureFlash(false), 150);

							onCapture(file);
							// Don't automatically close - let user stay on camera screen
						}
					},
					"image/jpeg",
					0.8,
				);
			}
		}
	};

	const handleClose = () => {
		stopCamera();
		setIsCameraActive(false);
		// Cleanup image URLs to prevent memory leaks
		capturedImages.forEach((url) => URL.revokeObjectURL(url));
		setCapturedImages([]);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
			{/* Header */}
			<div className="flex items-center justify-between bg-black/90 p-4">
				<div className="flex items-center gap-3">
					<h2 className="font-semibold text-lg text-white">Take Photo</h2>
					{capturedImages.length > 0 && (
						<div className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
							<div className="h-2 w-2 rounded-full bg-white" />
							<span className="font-medium">{capturedImages.length}</span>
						</div>
					)}
				</div>
				<button
					onClick={handleClose}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
				>
					<X className="h-6 w-6 text-white" />
				</button>
			</div>

			{/* Camera video */}
			<div className="relative flex-1">
				{error ? (
					<div className="flex h-full items-center justify-center p-8">
						<div className="text-center">
							<Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
							<p className="mb-4 text-gray-300">{error}</p>
							<button
								onClick={startCamera}
								className="rounded-lg bg-white px-4 py-2 text-black transition-colors hover:bg-gray-200"
							>
								Try Again
							</button>
						</div>
					</div>
				) : (
					<>
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							className="h-full w-full object-cover"
						/>

						{/* Flash effect */}
						{showCaptureFlash && (
							<div className="pointer-events-none absolute inset-0 animate-pulse bg-white" />
						)}

						{/* Recent captures thumbnail strip */}
						{capturedImages.length > 0 && (
							<div className="absolute bottom-4 left-4 flex gap-2">
								{capturedImages.slice(-3).map((imageUrl, index) => (
									<div
										key={index}
										className="h-12 w-12 overflow-hidden rounded-lg border-2 border-white/50 bg-black/20"
									>
										<img
											src={imageUrl}
											alt={`Captured ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									</div>
								))}
								{capturedImages.length > 3 && (
									<div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white/50 bg-black/50">
										<span className="text-white text-xs">
											+{capturedImages.length - 3}
										</span>
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>

			{/* Camera controls */}
			<div className="bg-gradient-to-t from-black/90 to-transparent p-6">
				<div className="flex items-center justify-center">
					<button
						onClick={capturePhoto}
						disabled={!!error}
						className="flex h-16 w-16 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Camera className="h-8 w-8 text-black" />
					</button>
				</div>
			</div>

			{/* Hidden canvas for capture */}
			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
}
