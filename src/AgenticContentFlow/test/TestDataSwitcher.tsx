/** @format */
import ControlDropdown from "../Controls/Components/ControlDropdown";
import { Database } from "lucide-react"; // Replace MUI icon with Lucide icon
import { useEdgeStore } from "../Edge/store/useEdgeStore";
import { useNodeStore } from "../Node/store/useNodeStore";

// Import test data sets
import { childNodesData, parentNodesData } from "./default/nodesData";
import { edgesData } from "./default/edgeData";

// Import simple test data
import { initialSimpleNodes } from "./simpleBasic/nodesData";
import { initialSimpleEdges } from "./simpleBasic/edgeData";

// Import LMS example data
import { lmsNodesData } from "./lms/nodesData";
import { lmsEdgesData } from "./lms/edgeData";

// Import LMS simplest data
import { testEdgesMinimalSiblingNested, testNodesMinimalSiblingNested } from "./lmsSimple/simplestLMSNodesEdges";

/**
 * @description Switcher for loading different test data sets
 */
export const TestDataSwitcher = () => {
  const { setEdges } = useEdgeStore();
  const { setNodes } = useNodeStore();

  const switchToDataSet = (dataSet: string) => {
    switch (dataSet) {
      case "default":
        setNodes([...childNodesData, ...parentNodesData]);
        setEdges(edgesData);
        break;
      case "simple":
        setNodes(initialSimpleNodes);
        setEdges(initialSimpleEdges);
        break;
      case "simplest":
        setNodes(testNodesMinimalSiblingNested);
        setEdges(testEdgesMinimalSiblingNested);
        break;
      case "lms":
        setNodes(lmsNodesData.map((node) => ({
          ...node,
          style: {
            width: node.type === "conditionalnode" ? 100: 300,
            height: node.type === "conditionalnode" ? 100: 200,
          }
        })));
        setEdges(lmsEdgesData);
        break;
      default:
        console.warn("Unknown test data set:", dataSet);
    }
  };

  const testDataItems = [
    {
      key: "default",
      label: "Default Example Data",
      onClick: () => switchToDataSet("default")
    },
    {
      key: "simple",
      label: "Simple Example Data",
      onClick: () => switchToDataSet("simple")
    },
    {
      key: "simplest",
      label: "LMS Simple Example Data",
      onClick: () => switchToDataSet("simplest")
    },
    {
      key: "lms",
      label: "LMS Basic Example Data",
      onClick: () => switchToDataSet("lms")
    }
  ];

  return (
    <ControlDropdown
      tooltip="Load Test Data"
      icon={<Database className="size-5" />}
      items={testDataItems}
    />
  );
};
