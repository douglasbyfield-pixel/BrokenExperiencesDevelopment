import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@web/lib/utils";
import type * as React from "react";

function Progress({
	className,
	value,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn(
				"relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className="relative h-full w-full flex-1 overflow-hidden transition-all duration-500 ease-out"
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			>
				{/* Gradient fill for gaming effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600" />

				{/* Animated stripes */}
				<div className="absolute inset-0 animate-stripes bg-stripes opacity-20" />

				{/* Glow effect at the end */}
				<div className="absolute top-0 right-0 h-full w-4 animate-pulse bg-gradient-to-l from-white/40 to-transparent" />
			</ProgressPrimitive.Indicator>

			<style jsx>{`
        @keyframes stripes {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 20px 0;
          }
        }
        
        .bg-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 5px,
            rgba(255, 255, 255, 0.1) 5px,
            rgba(255, 255, 255, 0.1) 10px
          );
          background-size: 20px 20px;
        }
        
        .animate-stripes {
          animation: stripes 1s linear infinite;
        }
      `}</style>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
