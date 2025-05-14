import { HandleType, Position } from "@xyflow/react";
import { StyledCellHandle } from "./CellNodeHandleStyles";
import { cn } from "@/lib/utils";

interface CellNodeHandleProps {
  type: HandleType;
  id: string;
  position: Position;
  className?: string;
  backgroundColor?: string;
  color?: string;
  isConnectable?: boolean;
}

const CellNodeHandle = ({
  type,
  id,
  position,
  className,
  backgroundColor,
  color,
  isConnectable = true,
}: CellNodeHandleProps) => {
  return (
    <StyledCellHandle
      type={type}
      id={id}
      position={position}
      className={cn(className)}
      isConnectable={isConnectable}
      color={color || backgroundColor}
      style={backgroundColor ? { backgroundColor } : undefined}
    />
  );
};

export default CellNodeHandle;
