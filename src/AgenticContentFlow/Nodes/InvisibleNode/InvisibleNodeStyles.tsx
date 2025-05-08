import { BaseNodeContainer, BaseNodeProps } from "../common/NodeStyles";
import { cn } from "@/lib/utils";

interface InvisibleNodeProps extends BaseNodeProps {
  isExpanded?: boolean;
  isHovered?: boolean;
  sx?: Record<string, any>;
  onTransitionEnd?: () => void;
}

export const InvisibleNodeContainer: React.FC<InvisibleNodeProps> = ({
  isExpanded,
  isHovered,
  color,
  selected,
  className,
  children,
  style,
  sx = {},
  ...props
}) => {
  return (
    <BaseNodeContainer
      color={color}
      selected={selected}
      className={cn(
        "relative p-0 overflow-visible z-0 rounded-md",
        isExpanded ? "border-dashed border-4" : "border-solid border-2",
        isExpanded ? "shadow-none" : "shadow-[5px_-2px_black]",
        isExpanded ? "bg-transparent" : "bg-white",
        "transition-all duration-200 ease-in-out",
        isHovered ? "border-black" : "border-transparent",
        className
      )}
      style={{
        ...style,
        ...sx
      }}
      {...props}
    >
      {children}
    </BaseNodeContainer>
  );
};