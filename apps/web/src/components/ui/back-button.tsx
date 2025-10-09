"use client";

import { Button } from "@web/components/ui/button";
import { cn } from "@web/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
	fallbackUrl?: string;
	className?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
}

export function BackButton({
	fallbackUrl = "/home",
	className,
	variant = "ghost",
	size = "sm",
}: BackButtonProps) {
	const router = useRouter();

	const handleBack = () => {
		// Check if there's history to go back to
		if (window.history.length > 1) {
			router.back();
		} else {
			// Fallback to a default page if no history
			router.push(fallbackUrl as any);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleBack}
			className={cn("p-2", className)}
			aria-label="Go back"
		>
			<ArrowLeft className="h-4 w-4" />
		</Button>
	);
}
