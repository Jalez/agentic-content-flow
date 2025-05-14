/** @format */
import { useState, memo, useEffect } from "react";
import { useReactFlow, Node, Position } from "@xyflow/react";
import { ChevronDown } from "lucide-react"; // Replace MUI's ExpandMoreIcon
import { CellNodeMenu } from "./CellNodeMenu";
import { CourseNodeData } from "../../types";
import {
  StyledNodeCard,
  StyledAccordion,
  StyledAccordionDetails,
  AccordionSummary,
} from "./CellNodeStyles";
import { StyledCellHandle } from "./CellNodeHandleStyles";

const CellComponent = (node: Node<CourseNodeData>) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleExpandIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuAnchor(event.currentTarget as HTMLElement);
  };
  const courseColor = "#FF5733"; // Replace with your logic to get the course color

  return (
    <>
      <StyledNodeCard
        courseColor={courseColor}
        selected={Boolean(node.selected)}
        onContextMenu={handleContextMenu}
      >
        <StyledCellHandle
          type="target"
          id="target-handle"
          position={node?.targetPosition || Position.Top}
          className="target-handle"
          color={courseColor}
        />
        <StyledAccordion
          expanded={isExpanded}
          disableGutters
          courseColor={courseColor}
          isExpanded={isExpanded}
          nodeSelected={node.selected || false}
        >
          <AccordionSummary
            expandIcon={
              node.data.details ? (
                <div
                  onClick={handleExpandIconClick}
                  className="flex items-center"
                  role="button"
                  aria-label="Toggle details"
                >
                  <ChevronDown 
                    className="size-4 transition-transform" 
                    style={{ color: courseColor }}
                  />
                </div>
              ) : null
            }
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
                <span
                  className="text-sm font-medium text-foreground"
                >
                  {node.data?.label}
                </span>
              </div>
            </div>
          </AccordionSummary>
          {node.data.details && (
            <StyledAccordionDetails>
              <p
                className="text-sm text-muted-foreground m-0"
              >
                {node.data.details}
              </p>
              {/* <SubjectIcon
                className="subject-icon"
                src={config.icon}
                alt={subject}
                courseColor={courseColor}
              /> */}
            </StyledAccordionDetails>
          )}
        </StyledAccordion>
        <StyledCellHandle
          type="source"
          id="source-handle"
          position={node?.sourcePosition || Position.Bottom}
          className="source-handle"
          color={courseColor}
        />
      </StyledNodeCard>

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
