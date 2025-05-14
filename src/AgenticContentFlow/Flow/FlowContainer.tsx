/** @format */
import { ReactNode, forwardRef, ForwardedRef, WheelEvent } from "react";
import { cn } from "@/lib/utils";

interface FlowContainerProps {
  children: ReactNode;
  onWheel?: (event: WheelEvent<HTMLDivElement>) => void;
  className?: string;
}

export const FlowContainer = forwardRef<HTMLDivElement, FlowContainerProps>(
  ({ children, onWheel, className }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        onWheel={onWheel}
        className={cn(
          "relative h-full w-full overflow-hidden bg-background", 
          "[&_.react-flow__renderer]:will-change-transform",
          "[&_.react-flow__attribution]:hidden",
          "[&_.react-flow__node-group]:rounded-lg [&_.react-flow__node-group]:bg-yellow-300 [&_.react-flow__node-group]:p-1 [&_.react-flow__node-group]:shadow-sm",
          "[&_.react-flow__connection-path]:stroke-primary [&_.react-flow__connection-path]:stroke-[3px]",
          "[&_.react-flow__edge-path]:cursor-pointer [&_.react-flow__edge-path]:stroke-border [&_.react-flow__edge-path]:stroke-[2px] [&_.react-flow__edge-path]:drop-shadow-sm [&_.react-flow__edge-path:hover]:stroke-[3px] [&_.react-flow__edge-path:hover]:drop-shadow-md",
          "[&_.selected]:z-0 [&_.selected_.react-flow__node]:z-0",
          "[&_.react-flow__edge.selected_.react-flow__edge-path]:stroke-primary [&_.react-flow__edge.selected_.react-flow__edge-path]:stroke-[3px] [&_.react-flow__edge.selected_.react-flow__edge-path]:drop-shadow-primary",
          "[&_.react-flow__node]:z-0 [&_.react-flow__node]:rounded-lg [&_.react-flow__node.dragging]:cursor-grabbing",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
