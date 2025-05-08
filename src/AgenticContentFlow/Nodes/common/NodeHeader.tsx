import {
  forwardRef,
  useCallback,
  HTMLAttributes,
  ReactNode,
  useState,
} from "react";
import { useNodeId, useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/* NODE HEADER -------------------------------------------------------------- */

export type NodeHeaderProps = HTMLAttributes<HTMLElement>;

export const NodeHeader = forwardRef<HTMLElement, NodeHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <header 
        ref={ref} 
        className={cn(
          "flex items-center justify-between gap-2 p-1 text-slate",
          className
        )}
        {...props} 
      />
    );
  }
);

NodeHeader.displayName = "NodeHeader";

/* NODE HEADER TITLE -------------------------------------------------------- */

export type NodeHeaderTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  asChild?: boolean;
};

export const NodeHeaderTitle = forwardRef<
  HTMLHeadingElement,
  NodeHeaderTitleProps
>(({ className, asChild, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "select-none flex-1 font-semibold text-base",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

NodeHeaderTitle.displayName = "NodeHeaderTitle";

/* NODE HEADER ICON --------------------------------------------------------- */

export type NodeHeaderIconProps = HTMLAttributes<HTMLSpanElement>;

export const NodeHeaderIcon = forwardRef<HTMLSpanElement, NodeHeaderIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "[&>*]:[width:20px] [&>*]:[height:20px]",
          className
        )}
        {...props}
      />
    );
  }
);

NodeHeaderIcon.displayName = "NodeHeaderIcon";

/* NODE HEADER ACTIONS ------------------------------------------------------ */

export type NodeHeaderActionsProps = HTMLAttributes<HTMLDivElement>;

export const NodeHeaderActions = forwardRef<
  HTMLDivElement,
  NodeHeaderActionsProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "ml-auto flex items-center gap-2 self-end",
        className
      )}
      {...props}
    />
  );
});

NodeHeaderActions.displayName = "NodeHeaderActions";

/* NODE HEADER ACTION ------------------------------------------------------- */

export type NodeHeaderActionProps = {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children?: ReactNode;
};

export const NodeHeaderAction = forwardRef<
  HTMLButtonElement,
  NodeHeaderActionProps
>(({ className, label, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "nodrag inline-flex items-center justify-center rounded-full p-2 w-6 h-6 text-sm",
        "hover:bg-black/5 dark:hover:bg-white/10",
        "transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

NodeHeaderAction.displayName = "NodeHeaderAction";

/* NODE HEADER MENU ACTION -------------------------------------------------- */

export type NodeHeaderMenuActionProps = Omit<
  NodeHeaderActionProps,
  "onClick"
> & {
  trigger?: ReactNode;
};

export const NodeHeaderMenuAction = forwardRef<
  HTMLButtonElement,
  NodeHeaderMenuActionProps
>(({ trigger, children, label = "More options", ...props }, ref) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NodeHeaderAction
          ref={ref}
          label={label}
          {...props}
        >
          {trigger ?? <MoreVertIcon />}
        </NodeHeaderAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NodeHeaderMenuAction.displayName = "NodeHeaderMenuAction";

/* NODE HEADER DELETE ACTION ----------------------------------------------- */

export const NodeHeaderDeleteAction = () => {
  const id = useNodeId();
  const { setNodes } = useReactFlow();

  const handleClick = useCallback(
    () => {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    },
    [id, setNodes]
  );

  return (
    <DropdownMenuItem onClick={handleClick} className="text-red-600">
      <div className="flex items-center gap-2">
        <DeleteIcon fontSize="small" />
        <span>Delete</span>
      </div>
    </DropdownMenuItem>
  );
};

NodeHeaderDeleteAction.displayName = "NodeHeaderDeleteAction";
