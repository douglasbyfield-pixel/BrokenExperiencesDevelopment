"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CameraContextType {
	isCameraActive: boolean;
	setIsCameraActive: (active: boolean) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export function CameraProvider({ children }: { children: ReactNode }) {
	const [isCameraActive, setIsCameraActive] = useState(false);

	return (
		<CameraContext.Provider value={{ isCameraActive, setIsCameraActive }}>
			{children}
		</CameraContext.Provider>
	);
}

export function useCamera() {
	const context = useContext(CameraContext);
	if (context === undefined) {
		throw new Error("useCamera must be used within a CameraProvider");
	}
	return context;
}