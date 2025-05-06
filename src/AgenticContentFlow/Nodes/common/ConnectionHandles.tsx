import { Position } from "@xyflow/react";
import { StyledHandle } from "./NodeStyles";

const ConnectionHandles = ({ color }: { color: string }) => {
    return (
        <>
                        <StyledHandle
                    type="target"
                    position={Position.Left}
                    id="left"
                    color={color}

                    style={{ left: '-1px', zIndex: 3, borderColor: "black" }}
                />
                <StyledHandle
                    type="source"
                    position={Position.Right}
                    id="right"
                    color={color}
                    style={{ right: '-4px', zIndex: 3, borderColor: "black" }}
                />
                <StyledHandle
                    type="target"
                    position={Position.Top}
                    id="top"
                    color={color}
                    style={{ top: '-23px', zIndex: 3, borderColor: "black" }}
                />
                <StyledHandle
                    type="source"
                    position={Position.Bottom}
                    id="bottom"
                    color={color}
                    style={{ bottom: '-2px', zIndex: 3, borderColor: "black" }}
                />
        </>
    );
    }
export default ConnectionHandles;