import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StyledNodeCardProps {
  courseColor: string;
  selected: boolean;
  children: ReactNode;
  onContextMenu?: (event: React.MouseEvent) => void;
  className?: string;
}

export const StyledNodeCard: React.FC<StyledNodeCardProps> = ({
  courseColor,
  selected,
  children,
  onContextMenu,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "inline-block w-[172px] overflow-hidden bg-card grab cursor-grab active:cursor-grabbing select-none transition-all",
        selected ? "shadow-[0_0_0_2px_var(--color-primary),_0_0_10px_2px_var(--color-primary)]" : "shadow-none",
        "hover:shadow-md",
        className
      )}
      style={{
        borderLeft: `4px solid ${courseColor}`,
      }}
      onContextMenu={onContextMenu}
      {...props}
    >
      {children}
    </div>
  );
};

interface StyledAccordionProps {
  courseColor: string;
  isExpanded: boolean;
  nodeSelected: boolean;
  expanded?: boolean;
  disableGutters?: boolean;
  children: ReactNode;
  className?: string;
}

export const StyledAccordion: React.FC<StyledAccordionProps> = ({
  courseColor,
  isExpanded,
  nodeSelected,
  children,
  className,
  ...props
}) => {
  // Calculate background color based on state
  const getBackgroundColor = () => {
    if (isExpanded) return `${courseColor}08`;
    if (nodeSelected) return `${courseColor}20`;
    return "transparent";
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] bg-transparent z-[1] p-0.5 transition-colors",
        "hover:bg-opacity-10",
        className
      )}
      style={{
        backgroundColor: getBackgroundColor(),
      }}
      {...props}
    >
      {children}
    </div>
  );
};

interface AccordionSummaryProps {
  expandIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const AccordionSummary: React.FC<AccordionSummaryProps> = ({
  expandIcon,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "min-h-0 p-0 flex items-center justify-between",
        "my-1",
        className
      )}
      {...props}
    >
      <div className="flex-grow">{children}</div>
      {expandIcon && <div className="flex-shrink-0">{expandIcon}</div>}
    </div>
  );
};

interface StyledAccordionDetailsProps {
  children: ReactNode;
  className?: string;
}

export const StyledAccordionDetails: React.FC<StyledAccordionDetailsProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col relative border-t border-border pt-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface SubjectIconProps {
  courseColor: string;
  src: string;
  alt: string;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({
  courseColor,
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "absolute right-1 bottom-1 w-[30px] h-[30px] opacity-[0.08] transition-all pointer-events-none z-0",
        className
      )}
      style={{
        filter: `drop-shadow(0 0 1px ${courseColor})`,
      }}
      {...props}
    />
  );
};
