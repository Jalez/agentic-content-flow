import React from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface StyledCellHandleProps {
  position: Position;
  type: 'source' | 'target';
  id: string;
  className?: string;
  color?: string;
  [key: string]: any;
}

// A utility function to get position-specific classes
export const getHandleClasses = (position: Position): string => {
  const baseClasses = "border-2 z-10 transition-all duration-200";
  
  switch (position) {
    case Position.Top:
      return cn(baseClasses, "top-0 translate-y-[-50%] left-1/2 translate-x-[-50%]");
    case Position.Bottom:
      return cn(baseClasses, "bottom-0 translate-y-[50%] left-1/2 translate-x-[-50%]");
    case Position.Left:
      return cn(baseClasses, "left-0 translate-x-[-50%] top-1/2 translate-y-[-50%]");
    case Position.Right:
      return cn(baseClasses, "right-0 translate-x-[50%] top-1/2 translate-y-[-50%]");
    default:
      return baseClasses;
  }
};

export const StyledCellHandle: React.FC<StyledCellHandleProps> = ({
  position,
  type,
  id,
  className,
  color,
  ...props
}) => {
  return (
    <Handle
      type={type}
      id={id}
      position={position}
      className={cn(
        getHandleClasses(position),
        "size-3 rounded-full opacity-0 hover:opacity-100 group-hover:opacity-60",
        "border-white shadow-sm",
        className
      )}
      style={{
        backgroundColor: color || 'var(--color-primary)',
        borderColor: 'var(--color-border)',
      }}
      {...props}
    />
  );
};
