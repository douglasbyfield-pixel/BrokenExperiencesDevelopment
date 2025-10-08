"use client";

export function OfflineBanner() {
  if (navigator.onLine) {
    return null;
  }

  return (
    <div className="bg-red-500 text-white text-center py-1 px-4 text-xs font-medium">
      <span className="flex items-center justify-center gap-2">
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
          />
        </svg>
        You're currently offline. Some features may not be available.
      </span>
    </div>
  );
}
