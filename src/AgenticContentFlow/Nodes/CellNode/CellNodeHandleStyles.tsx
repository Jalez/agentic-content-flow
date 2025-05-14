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
  const baseClasses = "bg-transparent rounded-[10px] border-none z-10 transition-all duration-200";
  
  switch (position) {
    case Position.Top:
      return cn(baseClasses, "top-[10px] w-full h-[2%]");
    case Position.Bottom:
      return cn(baseClasses, "bottom-[10px] w-full h-[2%]");
    case Position.Left:
      return cn(baseClasses, "left-0 h-full w-[2%] rounded-l-[10px] border-r-0");
    case Position.Right:
      return cn(baseClasses, "right-[4px] h-full w-[2%] rounded-r-[10px] border-l-0");
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
  // Determine width and height based on position
  const isVertical = position === Position.Top || position === Position.Bottom;
  
  return (
    <Handle
      type={type}
      id={id}
      position={position}
      className={cn(
        getHandleClasses(position),
        "opacity-50 hover:opacity-100",
        className
      )}
      style={{
        width: isVertical ? "100%" : "2%",
        height: isVertical ? "2%" : "100%",
      }}
      {...props}
    />
  );
};
