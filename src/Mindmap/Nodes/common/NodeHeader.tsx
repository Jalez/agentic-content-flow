import {
  forwardRef,
  useCallback,
  HTMLAttributes,
  ReactNode,
  useState,
} from "react";
import { useNodeId, useReactFlow } from "@xyflow/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { IconButton, Menu, Box, Typography } from "@mui/material";

/* NODE HEADER -------------------------------------------------------------- */

export type NodeHeaderProps = HTMLAttributes<HTMLElement>;

const StyledHeader = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
}));

export const NodeHeader = forwardRef<HTMLElement, NodeHeaderProps>(
  ({ className, ...props }, ref) => {
    return <StyledHeader ref={ref} {...props} />;
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
    <Typography
      ref={ref}
      variant="subtitle1"
      component="h3"
      sx={{
        userSelect: "none",
        flex: 1,
        fontWeight: 600,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
});

NodeHeaderTitle.displayName = "NodeHeaderTitle";

/* NODE HEADER ICON --------------------------------------------------------- */

export type NodeHeaderIconProps = HTMLAttributes<HTMLSpanElement>;

export const NodeHeaderIcon = forwardRef<HTMLSpanElement, NodeHeaderIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="span"
        sx={{ "& > *": { width: 20, height: 20 } }}
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
    <Box
      ref={ref}
      sx={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        justifySelf: "flex-end",
      }}
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
    <IconButton
      ref={ref}
      size="small"
      aria-label={label}
      title={label}
      className="nodrag"
      sx={{ padding: 0.5, width: 24, height: 24 }}
      {...props}
    >
      {children}
    </IconButton>
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <NodeHeaderAction
        ref={ref}
        onClick={handleClick}
        label={label}
        {...props}
      >
        {trigger ?? <MoreVertIcon />}
      </NodeHeaderAction>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {children}
      </Menu>
    </>
  );
});

NodeHeaderMenuAction.displayName = "NodeHeaderMenuAction";

/* NODE HEADER DELETE ACTION ----------------------------------------------- */

export const NodeHeaderDeleteAction = () => {
  const id = useNodeId();
  const { setNodes } = useReactFlow();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    },
    [id, setNodes]
  );

  return (
    <NodeHeaderAction onClick={handleClick} label="Delete node">
      <DeleteIcon />
    </NodeHeaderAction>
  );
};

NodeHeaderDeleteAction.displayName = "NodeHeaderDeleteAction";
