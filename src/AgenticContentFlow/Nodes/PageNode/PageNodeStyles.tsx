import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseNodeContainer } from "../common/NodeStyles";

// Define additional props interface for the PageNodeContainer
interface PageNodeProps {
  color?: string;
  selected?: boolean;
  isExpanded?: boolean;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onTransitionEnd?: () => void;
}

// Custom container for PageNode
export function PageNodeContainer({
  color,
  selected,
  isExpanded,
  className,
  children,
  style,
  ...props
}: PageNodeProps) {
  return (
    <BaseNodeContainer
      color={color}
      selected={selected}
      className={cn(
        "relative p-0 overflow-visible z-0 rounded-md",
        isExpanded ? "" : "border-2 border-solid border-black",
        "shadow-[5px_-2px_black]",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </BaseNodeContainer>
  );
}

