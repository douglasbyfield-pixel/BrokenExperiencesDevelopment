import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@web/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all duration-500 ease-out relative overflow-hidden"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {/* Gradient fill for gaming effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600" />
        
        {/* Animated stripes */}
        <div className="absolute inset-0 bg-stripes opacity-20 animate-stripes" />
        
        {/* Glow effect at the end */}
        <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-white/40 to-transparent animate-pulse" />
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
  )
}

export { Progress }
