"use client";

import type * as React from "react";

type DialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={() => onOpenChange(false)}
			/>
			<div
				role="dialog"
				aria-modal="true"
				className="fade-in zoom-in-95 relative z-10 w-[90vw] max-w-md animate-in rounded-2xl border bg-white p-6 shadow-2xl"
			>
				{title ? (
					<h2 className="mb-4 font-semibold text-black text-lg">{title}</h2>
				) : null}
				{children}
			</div>
		</div>
	);
}
