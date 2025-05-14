/** @format */
import { useState, memo, useEffect } from "react";
import { useReactFlow, Node, Position } from "@xyflow/react";
import { CellNodeMenu } from "./CellNodeMenu";
import { CourseNodeData } from "../../types";
import { StyledCellHandle } from "./CellNodeHandleStyles";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const CellComponent = (node: Node<CourseNodeData>) => {
  const [isExpanded, setIsExpanded] = useState<string | undefined>(undefined);
  const [contextMenuAnchor, setContextMenuAnchor] =
    useState<HTMLElement | null>(null);
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    if (isExpanded) {
      reactFlowInstance.setNodes((nodes) =>
        nodes.map((n) => (n.id === node.id ? { ...n } : n))
      );
    }
  }, [isExpanded, node.id, reactFlowInstance]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuAnchor(event.currentTarget as HTMLElement);
  };
  const courseColor = "#FF5733"; // Replace with your logic to get the course color

  // Handle accordion value change
  const handleAccordionChange = (value: string) => {
    setIsExpanded(value === "" ? undefined : value);
  };

  return (
    <>
      <div
        className={cn(
          "inline-block w-[172px] overflow-hidden bg-card cursor-grab active:cursor-grabbing select-none transition-all rounded-lg",
          node.selected ? "shadow-[0_0_0_2px_var(--color-primary),_0_0_10px_2px_var(--color-primary)]" : "shadow-none",
          "hover:shadow-md"
        )}
        style={{
          borderLeft: `4px solid ${courseColor}`,
        }}
        onContextMenu={handleContextMenu}
      >
        <StyledCellHandle
          type="target"
          id="target-handle"
          position={node?.targetPosition || Position.Top}
          className="target-handle"
          color={courseColor}
        />
        
        <Accordion
          type="single"
          collapsible
          className={cn(
            "rounded-[var(--radius)] bg-transparent z-[1] p-0.5 transition-colors",
            node.selected ? `bg-opacity-20` : "bg-transparent",
            "hover:bg-opacity-10"
          )}
          style={{
            backgroundColor: isExpanded ? `${courseColor}08` : node.selected ? `${courseColor}20` : "transparent",
          }}
          value={isExpanded}
          onValueChange={handleAccordionChange}
        >
          <AccordionItem value="content" className="border-none">
            <AccordionTrigger 
              className="py-1 px-0"
              disabled={!node.data.details}
              iconColor={courseColor}
            >
              <div className="flex flex-col min-w-0">
                {node.data?.courseCode && (
                  <span
                    className="block whitespace-nowrap text-xs font-bold"
                    style={{ color: courseColor }}
                  >
                    {node.data?.courseCode}
                  </span>
                )}
                <div className="flex flex-row gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {node.data?.label}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            
            {node.data.details && (
              <AccordionContent className="border-t border-border pt-1">
                <p className="text-sm text-muted-foreground m-0">
                  {node.data.details}
                </p>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
        
        <StyledCellHandle
          type="source"
          id="source-handle"
          position={node?.sourcePosition || Position.Bottom}
          className="source-handle"
          color={courseColor}
        />
      </div>

      <CellNodeMenu
        anchorEl={contextMenuAnchor}
        onClose={() => setContextMenuAnchor(null)}
        node={node}
      />
    </>
  );
};

// Custom memo comparison function
const areEqual = (
  prevProps: Node<CourseNodeData>,
  nextProps: Node<CourseNodeData>
) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.details === nextProps.data?.details &&
    prevProps.data?.nodeLevel === nextProps.data?.nodeLevel &&
    prevProps.data?.subject === nextProps.data?.subject &&
    prevProps.sourcePosition === nextProps.sourcePosition &&
    prevProps.targetPosition === nextProps.targetPosition
  );
};

export const CellNode = memo(CellComponent, areEqual);
