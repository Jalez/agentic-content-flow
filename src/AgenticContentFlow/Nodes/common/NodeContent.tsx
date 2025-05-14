import { cn } from "@/lib/utils";

interface NodeContentProps {
  /**
   * Whether the node is a course node
   */
  isCourse: boolean;
  
  /**
   * The details text to display
   */
  details?: string;
  
  /**
   * Additional className to apply
   */
  className?: string;
}

/**
 * NodeContent component renders the content area of a node
 */
export const NodeContent = ({ isCourse, details, className }: NodeContentProps) => {
  // Don't render content for course nodes or if there are no details
  if (isCourse || !details) {
    return null;
  }
  
  return (
    <div className={cn("flex-1 p-5", className)}>
      <p className="text-sm text-muted-foreground">
        {details}
      </p>
    </div>
  );
};

export default NodeContent;