"use client";

import { useSettings } from "@web/context/SettingsContext";
import React, { createContext, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAContextType {
	canInstall: boolean;
	isInstalled: boolean;
	showInstallPrompt: () => void;
	hideInstallPrompt: () => void;
	isPromptVisible: boolean;
	hasDismissedPrompt: boolean;
}

const PWAContext = createContext<PWAContextType>({
	canInstall: false,
	isInstalled: false,
	showInstallPrompt: () => {},
	hideInstallPrompt: () => {},
	isPromptVisible: false,
	hasDismissedPrompt: false,
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isPromptVisible, setIsPromptVisible] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);
	const { settings, updateSettings } = useSettings();

	useEffect(() => {
		// Check if already installed as PWA
		const checkIfInstalled = () => {
			const displayMode =
				window.matchMedia("(display-mode: standalone)").matches ||
				window.matchMedia("(display-mode: fullscreen)").matches ||
				window.matchMedia("(display-mode: minimal-ui)").matches;
			const iosStandalone = (window.navigator as any).standalone === true;
			return displayMode || iosStandalone;
		};

		setIsInstalled(checkIfInstalled());

		// Listen for install prompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			console.log("📱 PWA install prompt available");
		};

		// Listen for successful installation
		window.addEventListener("appinstalled", () => {
			console.log("✅ PWA was successfully installed!");
			setIsInstalled(true);
			setIsPromptVisible(false);
		});

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	const showInstallPrompt = async () => {
		console.log("🔘 Show install prompt requested");

		if (deferredPrompt) {
			try {
				deferredPrompt.prompt();
				const { outcome } = await deferredPrompt.userChoice;

				console.log("👤 User choice:", outcome);
				if (outcome === "accepted") {
					console.log("✅ User accepted the install prompt");
					// Mark as seen only if they install
					await updateSettings({
						app: { pwaInstallPromptSeen: true },
					});
				}

				setDeferredPrompt(null);
			} catch (error) {
				console.error("❌ Install prompt failed:", error);
			}
		} else {
			// Show custom prompt for Safari/Firefox
			setIsPromptVisible(true);
		}
	};

	const hideInstallPrompt = async () => {
		setIsPromptVisible(false);
		// Mark as seen when they dismiss
		await updateSettings({
			app: { pwaInstallPromptSeen: true },
		});
	};

	const hasDismissedPrompt = settings?.app?.pwaInstallPromptSeen === true;
	const canInstall =
		!isInstalled &&
		!hasDismissedPrompt &&
		(!!deferredPrompt ||
			/iPad|iPhone|iPod|Safari|Firefox/.test(navigator.userAgent));

	return React.createElement(
		PWAContext.Provider,
		{
			value: {
				canInstall,
				isInstalled,
				showInstallPrompt,
				hideInstallPrompt,
				isPromptVisible,
				hasDismissedPrompt,
			},
		},
		children,
		isPromptVisible &&
			!deferredPrompt &&
			React.createElement(
				"div",
				{
					className:
						"fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4 animate-in slide-in-from-bottom-4 fade-in duration-500",
				},
				React.createElement(
					"div",
					{
						className:
							"relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-lg border border-border shadow-2xl",
					},
					React.createElement("div", {
						className:
							"absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent",
					}),
					React.createElement(
						"div",
						{ className: "relative p-6" },
						React.createElement(
							"div",
							{ className: "flex items-start gap-4" },
							React.createElement(
								"div",
								{ className: "flex-shrink-0" },
								React.createElement(
									"div",
									{ className: "relative" },
									React.createElement(
										"div",
										{
											className:
												"w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center",
										},
										React.createElement("img", {
											src: "/images/logo.png",
											alt: "App Icon",
											className: "w-7 h-7 filter drop-shadow-sm",
										}),
									),
									React.createElement("div", {
										className:
											"absolute inset-0 w-12 h-12 rounded-xl bg-primary/10 blur-sm -z-10",
									}),
								),
							),
							React.createElement(
								"div",
								{ className: "flex-1 min-w-0" },
								React.createElement(
									"h3",
									{
										className:
											"text-base font-semibold text-foreground tracking-tight",
									},
									"Install App",
								),
								React.createElement(
									"p",
									{
										className:
											"text-sm text-muted-foreground mt-1 leading-relaxed",
									},
									"Add to your home screen for instant access",
								),
								React.createElement(
									"div",
									{ className: "mt-4 w-full" },
									React.createElement(
										"button",
										{
											onClick: hideInstallPrompt,
											className:
												"w-full flex items-center justify-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted/70 text-foreground text-sm font-medium rounded-lg transition-all duration-200",
										},
										/iPad|iPhone|iPod/.test(navigator.userAgent)
											? [
													React.createElement(Share2, {
														key: "icon",
														className: "w-4 h-4",
													}),
													React.createElement(
														"span",
														{ key: "text" },
														"Tap Share → Add to Home Screen",
													),
												]
											: /Safari/.test(navigator.userAgent)
												? [
														React.createElement(MoreHorizontal, {
															key: "icon",
															className: "w-4 h-4",
														}),
														React.createElement(
															"span",
															{ key: "text" },
															"File → Add to Dock",
														),
													]
												: [
														React.createElement(Download, {
															key: "icon",
															className: "w-4 h-4",
														}),
														React.createElement(
															"span",
															{ key: "text" },
															"Menu → Install",
														),
													],
									),
								),
							),
							React.createElement(
								"button",
								{
									onClick: hideInstallPrompt,
									className:
										"absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-200",
								},
								React.createElement(X, { className: "w-4 h-4" }),
							),
						),
					),
				),
			),
	);
}

export const usePWAInstall = () => useContext(PWAContext);

// Import needed icons
import { Download, MoreHorizontal, Share2, X } from "lucide-react";
