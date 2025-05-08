import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BaseNodeContainer } from "../common/NodeStyles";

// Define additional props interface for the DataNodeContainer
interface DataNodeProps {
  color?: string;
  selected?: boolean;
  isCollapsed?: boolean;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onTransitionEnd?: () => void;
}

// Custom container for DataNode with file/folder appearance
export function DataNodeContainer({
  color,
  selected,
  isCollapsed = true,
  className,
  children,
  style,
  ...props
}: DataNodeProps) {
  return (
    <BaseNodeContainer
      color={color}
      selected={selected}
      className={cn(
        "relative p-0 overflow-visible z-0 rounded-md border-2 border-solid border-black shadow-[5px_-2px_black] mt-5",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </BaseNodeContainer>
  );
}

export default DataNodeContainer;