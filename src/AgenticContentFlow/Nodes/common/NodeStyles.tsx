import { Handle } from "@xyflow/react";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

// Common type for color props
export interface BaseNodeProps {
  color?: string;
  selected?: boolean;
  isExpanded?: boolean;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
}

interface SelectableProps {
  selected?: boolean;
}

// Base component for all node containers using Tailwind CSS
export function BaseNodeContainer({

  color,
  selected,
  className,
  children,
  style,
  ref,
  ...props
}: BaseNodeProps) {
  return (
    <div 
      className={cn(
        "relative rounded-lg w-full h-full min-w-[300px] min-h-[150px] transition-all",
        selected ? `border-[${color}]` : "border-divider", 
        "text-foreground",
        className
      )}
      style={{
        ...style,
        borderColor: selected ? color : undefined
      }}
      ref={ref as React.Ref<HTMLDivElement>}
      {...props}
    >
      {children}
    </div>
  );
}

// Handle component using Tailwind CSS
export function StyledHandle({
  selected,
  className,
  children,
  position,
  ...props
}: React.ComponentProps<typeof Handle> & SelectableProps) {
  // Custom styles based on position for positioning and transforms
  const positionClasses = {
    left: "left-[-1px] [--translate-x:-5px]",
    right: "right-[-1px] [--translate-x:5px]",
    top: "top-[-1px] [--translate-y:-5px]",
    bottom: "bottom-[-1px] [--translate-y:5px]",
  };

  // Determine which position class to use
  const positionClass = position ? 
    positionClasses[position.toLowerCase() as keyof typeof positionClasses] : "";

  return (
    <Handle
      className={cn(
        // Base handle styles
        "w-[20px] h-[20px] border border-black rounded-full overflow-hidden flex items-center justify-center transition-all duration-300",
        // Positioning and transform styles
        positionClass,
        // Apply transform with CSS variables
        "[transform-origin:center] [transform:translateX(var(--translate-x,0)_translateY(var(--translate-y,0)_scale(var(--scale,1)))]",
        // Hover effects
        "hover:[--scale:1.6] hover:z-[1000] hover:shadow-md",
        className
      )}
      position={position}
      {...props}
    >
      {children && (
        <div className="w-full h-full flex items-center justify-center text-xs transition-all duration-300">
          {children}
        </div>
      )}
    </Handle>
  );
}

// Resize control component using Tailwind CSS
export function StyledResizeControl({
  color,
  selected,
  className,
  children,
  ...props
}: {
  color?: string;
  selected?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        "absolute cursor-nwse-resize text-white transition-transform shadow-md",
        "hover:scale-110",
        className
      )}
      style={{
        backgroundColor: color
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Title component using Tailwind CSS
export function StyledTitle({
  color,
  className,
  children,
  ...props
}: {
  color?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}) {
  return (
    <h3
      className={cn(
        "font-bold",
        className
      )}
      style={{ color }}
      {...props}
    >
      {children}
    </h3>
  );
}
