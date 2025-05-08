/** @format */
import ControlButton from "../Controls/Components/ControlButton";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { useEdgeStore } from "../Edge/store/useEdgeStore";
import { useNodeStore } from "../Node/store/useNodeStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <ControlButton
            tooltip="Load Test Data"
            icon={<DataObjectIcon />}
            onClick={(e) => e.preventDefault()}
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => switchToDataSet("default")}>
          Default Example Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchToDataSet("simple")}>
          Simple Example Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchToDataSet("simplest")}>
          LMS Simple Example Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchToDataSet("lms")}>
          LMS Basic Example Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
