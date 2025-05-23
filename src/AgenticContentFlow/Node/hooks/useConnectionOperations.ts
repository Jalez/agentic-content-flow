import { useSourceNodeOperations } from "./connectionOperations/useSourceNodeOperations";
import { useTargetNodeOperations } from "./connectionOperations/useTargetNodeOperations";
import { useDirectConnectionOperations } from "./connectionOperations/useDirectConnectionOperations";
import { useDragToCreateOperations } from "./connectionOperations/useDragToCreateOperations";

export const useConnectionOperations = () => {
  const { addSourceNode } = useSourceNodeOperations();
  const { addTargetNode } = useTargetNodeOperations();
  const { onConnect } = useDirectConnectionOperations();
  const { onConnectEnd } = useDragToCreateOperations();

  return {
    addSourceNode,
    addTargetNode,
    onConnect,
    onConnectEnd,
  };
};
