import { HandleType, Position } from "@xyflow/react";
import { StyledHandle, getHandleStyles } from "./CellNodeHandleStyles";

interface CellNodeHandleProps {
  type: HandleType;
  id: string;
  position: Position;
  className: string;
  backgroundColor: string;
  isConnectable?: boolean;
}

const CellNodeHandle = ({
  type,
  id,
  position,
  className,
  backgroundColor,
  isConnectable = true,
}: CellNodeHandleProps) => {
  // Get position-specific styles
  const positionStyles = getHandleStyles(position);

  return (
    <StyledHandle
      type={type}
      id={id}
      position={position}
      className={className}
      isConnectable={isConnectable}
      style={{
        ...positionStyles,
        backgroundColor,
      }}
    />
  );
};

export default CellNodeHandle;
