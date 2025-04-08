/** @format */
import { useState, memo, useEffect } from "react";
import { useReactFlow, Node, Position } from "@xyflow/react";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { subjectConfig } from "../../../config/subjectConfig";
import { CellNodeMenu } from "./CellNodeMenu";
import { CourseNodeData } from "../../types";
import {
  StyledNodeCard,
  StyledAccordion,
  StyledAccordionDetails,
  SubjectIcon,
} from "./CellNodeStyles";
import { StyledCellHandle } from "./CellNodeHandleStyles";

const CellComponent = (node: Node<CourseNodeData>) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenuAnchor, setContextMenuAnchor] =
    useState<HTMLElement | null>(null);
  const reactFlowInstance = useReactFlow();
  const theme = useTheme();

  const subject = node.data.subject || "COMP.CS";
  const config = subjectConfig[subject] || subjectConfig["COMP.CS"];
  const level = node.data.nodeLevel || "basic";
  const courseColor =
    config.levelShades[level as keyof typeof config.levelShades];

  useEffect(() => {
    if (isExpanded) {
      reactFlowInstance.setNodes((nodes) =>
        nodes.map((n) => (n.id === node.id ? { ...n, zIndex: 1000 } : n))
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
                <Box
                  onClick={handleExpandIconClick}
                  sx={{ display: "flex", alignItems: "center" }}
                  role="button"
                  aria-label="Toggle details"
                >
                  <ExpandMoreIcon sx={{ color: courseColor }} />
                </Box>
              ) : null
            }
          >
            <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              {node.data?.courseCode && (
                <Box
                  component="span"
                  sx={{
                    color: courseColor,
                    typography: "caption",
                    fontWeight: "bold",
                    display: "block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.data?.courseCode}
                </Box>
              )}
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                <Box
                  component="span"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                    color: theme.palette.text.primary,
                    typography: "body2",
                  }}
                >
                  {node.data?.label}
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          {node.data.details && (
            <StyledAccordionDetails>
              <Box
                component="p"
                sx={{
                  typography: "body2",
                  color: "text.secondary",
                  m: 0,
                }}
              >
                {node.data.details}
              </Box>
              <SubjectIcon
                className="subject-icon"
                src={config.icon}
                alt={subject}
                courseColor={courseColor}
              />
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
