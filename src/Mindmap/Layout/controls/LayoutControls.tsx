/** @format */
import React, { useCallback } from "react";
import { IconButton, Tooltip, Menu, Divider } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import {
  useLayoutStore,
  LayoutDirection,
  LayoutAlgorithm,
} from "../store/useLayoutStore";
import { useReactFlow, Node, Edge } from "@xyflow/react";
import { applyLayout } from "../layoutUtils";
import { useNodeStore, useEdgeStore } from "../../stores";

// Import new components
import DirectionControls from "./components/DirectionControls";
import AlgorithmControls from "./components/AlgorithmControls";
import SpacingControls from "./components/SpacingControls";
import AutoLayoutToggle from "./components/AutoLayoutToggle";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useTrackableState } from "@jalez/react-state-history";

const LayoutControls: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { fitView } = useReactFlow();
  const { selectedNodes } = useSelect();

  // Get layout settings and actions from the store
  const {
    direction,
    algorithm,
    autoLayout,
    layoutInProgress,
    nodeSpacing,
    layerSpacing,
    setDirection,
    setAlgorithm,
    setAutoLayout,
    setLayoutInProgress,
    setNodeSpacing,
    setLayerSpacing,
    getElkOptions,
  } = useLayoutStore();

  const { nodes, nodeParentMap, updateNodes } = useNodeStore();
  const { edges, setEdges, edgeSourceMap } = useEdgeStore();
  const trackUpdateNodes = useTrackableState(
    "LayoutControls/UpdateNodes",
    updateNodes
  );

  const onLayout = useCallback(
    async (_: LayoutDirection, ns: Node[], es: Edge[]) => {
      return applyLayout(ns, es, getElkOptions());
    },
    []
  );
  // Menu handlers
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Apply layout
  const handleApplyLayout = useCallback(async () => {
    if (layoutInProgress || nodes.length === 0) return;

    try {
      setLayoutInProgress(true);

      let nodesToLayout: Node[] = [];
      if (selectedNodes.length < 1) {
        //Then we should be applying the layout to the nodes that have no parent
        nodesToLayout = nodeParentMap?.get("no-parent") || [];
      } else {
        // Determine which nodes to layout
        let nodesToApplyLayout = selectedNodes;
        // Get nodes from parent map
        nodesToLayout = nodeParentMap?.get(nodesToApplyLayout[0].id) || [];
      }
      // Additional check to prevent layout on empty array
      if (nodesToLayout.length === 0) {
        console.warn("No nodes found in parent map for selected node");
        return;
      }

      // Get only the edges that connect the nodes we're laying out, using edgeSourceMap (where key is source node id)
      const relevantEdges = nodesToLayout
        .map((node) => edgeSourceMap.get(node.id))
        .flat()
        .filter((edge) => edge !== undefined) as Edge[];

      console.log(
        `Applying layout to ${nodesToLayout.length} nodes and ${relevantEdges.length} edges`
      );
      const result = await onLayout(direction, nodesToLayout, relevantEdges);

      if (result && result.nodes) {
        trackUpdateNodes(result.nodes, nodesToLayout);
      } else {
        console.warn("Layout result did not contain nodes");
      }
    } catch (error) {
      console.error("Error applying layout:", error);
    } finally {
      setLayoutInProgress(false);
    }
  }, [
    nodes,
    edges,
    selectedNodes,
    layoutInProgress,
    getElkOptions,
    setLayoutInProgress,
    setEdges,
  ]);

  // Fit all nodes in view
  const handleFitAllNodes = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 });
  }, [fitView]);

  // Handle direction change
  const handleDirectionChange = useCallback(
    (newDirection: LayoutDirection) => {
      setDirection(newDirection);
      handleMenuClose();
      handleApplyLayout();
    },
    [setDirection, handleMenuClose, handleApplyLayout]
  );

  // Handle algorithm change
  const handleAlgorithmChange = useCallback(
    (newAlgorithm: LayoutAlgorithm) => {
      setAlgorithm(newAlgorithm);
      handleMenuClose();
      handleApplyLayout();
    },
    [setAlgorithm, handleMenuClose, handleApplyLayout]
  );

  // Handle auto-layout toggle
  const handleAutoLayoutToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const enabled = event.target.checked;
      setAutoLayout(enabled);
      if (enabled) {
        handleApplyLayout();
      }
    },
    [setAutoLayout, handleApplyLayout]
  );

  // Handle spacing changes
  const handleNodeSpacingChange = useCallback(
    (_: any, value: number | number[]) => {
      setNodeSpacing(value as number);
    },
    [setNodeSpacing]
  );

  const handleLayerSpacingChange = useCallback(
    (_: any, value: number | number[]) => {
      setLayerSpacing(value as number);
    },
    [setLayerSpacing]
  );

  // Apply spacing changes - always trigger layout regardless of auto-layout
  const handleSpacingChangeCommitted = useCallback(() => {
    handleApplyLayout();
  }, [handleApplyLayout]);

  return (
    <>
      <Tooltip title="Layout Settings">
        <IconButton
          onClick={handleMenuOpen}
          color="inherit"
          disabled={layoutInProgress}
        >
          <SettingsOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Apply Layout">
        <IconButton
          onClick={handleApplyLayout}
          color="primary"
          disabled={layoutInProgress}
        >
          <AutoFixHighIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Fit All Nodes">
        <IconButton
          onClick={handleFitAllNodes}
          color="inherit"
          disabled={layoutInProgress}
        >
          <FitScreenIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "layout-settings-button",
        }}
        PaperProps={{
          style: { maxWidth: 320 },
        }}
      >
        <DirectionControls
          direction={direction}
          onDirectionChange={handleDirectionChange}
        />

        <Divider />

        <AlgorithmControls
          algorithm={algorithm}
          onAlgorithmChange={handleAlgorithmChange}
        />

        <Divider />

        <SpacingControls
          algorithm={algorithm}
          nodeSpacing={nodeSpacing}
          layerSpacing={layerSpacing}
          onNodeSpacingChange={handleNodeSpacingChange}
          onLayerSpacingChange={handleLayerSpacingChange}
          onSpacingChangeCommitted={handleSpacingChangeCommitted}
        />

        <Divider />

        <AutoLayoutToggle
          autoLayout={autoLayout}
          onAutoLayoutToggle={handleAutoLayoutToggle}
        />
      </Menu>
    </>
  );
};

export default React.memo(LayoutControls);
