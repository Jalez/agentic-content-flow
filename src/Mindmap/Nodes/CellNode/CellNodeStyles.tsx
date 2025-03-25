import { styled } from "@mui/material/styles";
import { Accordion, AccordionDetails, Card } from "@mui/material";

export const StyledNodeCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "courseColor" && prop !== "selected",
})<{ courseColor: string; selected: boolean }>(
  ({ theme, courseColor, selected }) => ({
    display: "inline-block",
    width: "fit-content",
    backgroundColor: theme.palette.background.paper,
    borderLeft: `4px solid ${courseColor}`,
    overflow: "hidden",
    boxShadow: selected
      ? `0 0 0 2px ${theme.palette.primary.main}, 0 0 10px 2px ${theme.palette.primary.main}`
      : "none",
    "&:hover": {
      boxShadow: selected
        ? `0 0 0 2px ${theme.palette.primary.main}, 0 0 10px 2px ${theme.palette.primary.main}`
        : theme.shadows[4],
    },
    transition: theme.transitions.create(["box-shadow", "transform"]),
    userSelect: "none",
    cursor: "grab",
    "&:active": {
      cursor: "grabbing",
    },
  })
);

export const StyledAccordion = styled(Accordion, {
  shouldForwardProp: (prop) =>
    !["courseColor", "isExpanded", "nodeSelected"].includes(prop as string),
})<{ courseColor: string; isExpanded: boolean; nodeSelected: boolean }>(
  ({ theme, courseColor, isExpanded, nodeSelected }) => ({
    borderRadius: theme.shape.borderRadius,
    background: "transparent",
    "&:before": { display: "none" },
    "& .MuiAccordionSummary-root": {
      minHeight: 0,
      padding: 0,
    },
    "& .MuiAccordionSummary-content": {
      margin: theme.spacing(1, 0),
    },
    zIndex: 1,
    padding: theme.spacing(0.125),
    backgroundColor: isExpanded
      ? `${courseColor}08`
      : nodeSelected
        ? `${courseColor}20`
        : "transparent",
    transition: theme.transitions.create(["background-color"]),
    "&:hover": {
      backgroundColor: `${courseColor}15`,
    },
  })
);

export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(1),
}));

export const SubjectIcon = styled("img", {
  shouldForwardProp: (prop) => prop !== "courseColor",
})<{ courseColor: string }>(({ theme, courseColor }) => ({
  position: "absolute",
  right: 4,
  bottom: 4,
  width: "30px",
  height: "30px",
  opacity: 0.08,
  transition: theme.transitions.create("all"),
  filter: `drop-shadow(0 0 1px ${courseColor})`,
  pointerEvents: "none",
  zIndex: 0,
}));
