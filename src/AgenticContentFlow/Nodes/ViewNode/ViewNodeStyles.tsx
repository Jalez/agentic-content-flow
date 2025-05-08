import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseNodeContainer } from "../common/NodeStyles";

// Define additional props interface for the ViewNodeContainer
interface ViewNodeProps {
  color?: string;
  selected?: boolean;
  isExpanded?: boolean;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onTransitionEnd?: () => void;
}

// Custom container for ViewNode with dashboard-like appearance
export function ViewNodeContainer({
  color,
  selected,
  className,
  children,
  style,
  ...props
}: ViewNodeProps) {
  return (
    <BaseNodeContainer
      color={color}
      selected={selected}
      className={cn(
        "relative p-0 overflow-visible z-0 rounded-md border-2 border-solid border-black shadow-[5px_-2px_black]",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </BaseNodeContainer>
  );
}