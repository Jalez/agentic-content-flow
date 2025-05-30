import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseNodeContainer } from "../common/NodeStyles";

// Define additional props interface for the ContentNodeContainer
interface ContentNodeProps {
  color?: string;
  selected?: boolean;
  isExpanded?: boolean;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onTransitionEnd?: () => void;
}

// Custom container for ContentNode with dashboard-like appearance
export function ContentNodeContainer({
  color,
  selected,
  className,
  children,
  style,
  ...props
}: ContentNodeProps) {
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