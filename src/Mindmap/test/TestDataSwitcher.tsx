/** @format */
import React, { useCallback, useState } from "react";
import ControlButton from "../Controls/Components/ControlButton";
import { Box, Menu, MenuItem, Tooltip } from "@mui/material";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { useEdgeStore } from "../Edge/store/useEdgeStore";
import { useNodeStore } from "../Node/store/useNodeStore";

// Import test data sets
import { nodesData } from "./nodesData";
import { edgesData } from "./edgeData";
import { initialSimpleNodes } from "./simple/nodesData";
import { initialSimpleEdges } from "./simple/edgeData";

/**
 * TestDataSwitcher Component
 *
 * A self-contained test utility that allows switching between different data sets
 * for the mindmap. This is useful for testing different scenarios without affecting
 * the rest of the application.
 */
const TestDataSwitcher: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Access the node and edge stores
  const { setNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const switchToDataSet = useCallback(
    (set: string) => {
      switch (set) {
        case "default":
          // Load the default complex test data
          setNodes(nodesData);
          setEdges(edgesData);
          break;
        case "simple":
          // Load simple test data
          setNodes(initialSimpleNodes);
          setEdges(initialSimpleEdges);
          break;
        case "empty":
          // Load empty data
          setNodes([]);
          setEdges([]);
          break;
        default:
          console.warn("Unknown data set:", set);
      }
      handleClose();
    },
    [setNodes, setEdges]
  );

  return (
    <>
      <Tooltip title="Switch Test Data">
        <ControlButton
          tooltip="Switch Test Data"
          onClick={handleClick}
          icon={<DataObjectIcon />}
        />
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => switchToDataSet("default")}>
          Default Test Data
        </MenuItem>
        <MenuItem onClick={() => switchToDataSet("simple")}>
          Simple Test Data
        </MenuItem>
        <MenuItem onClick={() => switchToDataSet("empty")}>Empty Data</MenuItem>
      </Menu>
    </>
  );
};

export default TestDataSwitcher;
