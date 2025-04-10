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
}) => {
  // This fixes the MUI warning: "You are providing a disabled `button` child to the Tooltip component"
  // By wrapping the disabled button in a span, the tooltip can listen to events on the span
  const buttonElement = (
    <IconButton
      size="small"
      onClick={onClick}
      disabled={disabled}
      color={active ? "primary" : "default"}
    >
      {icon}
    </IconButton>
  );

  return (
    <Tooltip title={tooltip} arrow>
      {disabled ? <span>{buttonElement}</span> : buttonElement}
    </Tooltip>
  );
};

export default ControlButton;
