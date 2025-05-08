import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface ScrollingTextProps {
  text: string;
  maxWidth?: string | number;
  variant?: string;
  className?: string;
  sx?: React.CSSProperties;
}

export const ScrollingText = ({ 
  text, 
  maxWidth = '100%', 
  className,
  sx,
  ...props 
}: ScrollingTextProps) => {
  // Only trigger animation if text is longer than container
  const shouldAnimate = text.length > 20;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "flex-1 relative w-full whitespace-nowrap overflow-hidden",
        className
      )}
      style={{ maxWidth, ...sx }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex overflow-hidden">
        <span 
          className={cn(
            "inline-block whitespace-nowrap min-w-fit overflow-hidden text-ellipsis",
            isHovered && shouldAnimate && "animate-scrollText"
          )}
          {...props}
        >
          {text}
        </span>
        
        {shouldAnimate && (
          <span 
            className={cn(
              "inline-block whitespace-nowrap min-w-fit overflow-hidden ml-8",
              isHovered && "animate-scrollText"
            )}
            {...props}
          >
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default ScrollingText;