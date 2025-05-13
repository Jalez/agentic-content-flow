import { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={active ? "default" : "secondary"}
            onClick={handleClick}
            disabled={disabled}
            //no background color, no border, no padding, no shadow
            className={`flex items-center justify-center, 
               shadow-none rounded-full text-gray-500 hover:bg-gray-100
               
               ${
              active ? "bg-gray-200" : "bg-transparent"
            } ${disabled ? "cursor-not-allowed" : ""}`}
          >
            {icon}
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ControlButton;
