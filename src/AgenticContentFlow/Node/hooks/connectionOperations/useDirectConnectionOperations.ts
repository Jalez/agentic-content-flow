import { Connection } from "@xyflow/react";
import { useCallback } from "react";
import { withErrorHandler } from "../../../utils/withErrorHandler";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { createConnectionWithTargetHandle } from "../utils/edgeUtils";

export const useDirectConnectionOperations = () => {
  const { 
    edges, 
    onEdgeAdd, 
    edgeMap 
  } = useEdgeContext();

  const onConnect = useCallback(
    withErrorHandler("onConnect", (params: Connection) => {
      const connection = createConnectionWithTargetHandle(params);
      onEdgeAdd(connection);
    }),
    [edgeMap, edges, onEdgeAdd]
  );

  return {
    onConnect,
  };
};