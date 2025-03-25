import { IconButton, Tooltip } from "@mui/material";
import { ReactElement } from "react";

// Reusable control button component
interface ControlButtonProps {
  tooltip: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon: ReactElement;
  disabled?: boolean;
  active?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  tooltip,
  onClick,
  icon,
  disabled = false,
  active = false,
}) => (
  <Tooltip title={tooltip}>
    <IconButton
      size="small"
      onClick={onClick}
      disabled={disabled}
      color={active ? "primary" : "default"}
    >
      {icon}
    </IconButton>
  </Tooltip>
);

export default ControlButton;
