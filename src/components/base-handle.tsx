import { forwardRef } from "react";
import { Handle, HandleProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

export type BaseHandleProps = HandleProps;
  
// Define styles using CSS custom properties for size override
// This won't create new objects on each render
const handleBaseStyles = {
  '--handle-size': '30px',
  width: 'var(--handle-size)',
  height: 'var(--handle-size)',
  borderColor: 'var(--handle-color)',
};

export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, style = {}, ...props }, ref) => {
    // Function to ensure clicks are captured and propagated properly
    const handleInnerClick = (e: React.MouseEvent) => {
      // Don't stop propagation, allowing the Handle component to receive the event
    };

    return (
      <Handle
        ref={ref}
        {...props}
        // Merge the base styles with any custom styles passed in
        style={{ ...handleBaseStyles, ...style }}
        className={cn(

          "rounded-full border border-slate-300 bg-slate-100 transition dark:border-secondary dark:bg-secondary flex items-center justify-center  shadow-[1px_-1px_black]",
          className,
        )}
      >
        {children && (
          <div 
            className="flex items-center justify-center w-full h-full" 
            onClick={handleInnerClick}
            style={{ pointerEvents: 'none' }} // Allow clicks to pass through to the handle
          >
            {children}
          </div>
        )}
      </Handle>
    );
  },
);

BaseHandle.displayName = "BaseHandle";
