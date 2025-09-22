"use client";

import * as React from "react";

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
            <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
            <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 w-[90vw] max-w-md rounded-2xl bg-white p-6 shadow-2xl border animate-in fade-in zoom-in-95"
            >
                {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
                {children}
            </div>
        </div>
    );
}


