import { Position } from "@xyflow/react";
import { ReactNode } from "react";
import { BaseHandle } from "@/components/base-handle";

interface ConnectionHandlesProps {
    color: string;
    icons?: {
        left?: ReactNode;
        right?: ReactNode;
        top?: ReactNode;
        bottom?: ReactNode;
    };
}

const ConnectionHandles = ({ color, icons }: ConnectionHandlesProps) => {
    return (
        <>
            <BaseHandle 
                type="target" 
                position={Position.Left} 
                id="left" 
                style={{ backgroundColor: color }}
            >
                {icons?.left && <div className="w-3.5 h-3.5 flex items-center justify-center">{icons.left}</div>}
            </BaseHandle>

            <BaseHandle 
                type="source" 
                position={Position.Right} 
                id="right" 
                style={{ backgroundColor: color }}
            >
                {icons?.right && <div className="w-3.5 h-3.5 flex items-center justify-center">{icons.right}</div>}
            </BaseHandle>

            <BaseHandle 
                type="target" 
                position={Position.Top} 
                id="top" 
                style={{ backgroundColor: color }}
            >
                {icons?.top && <div className="w-3.5 h-3.5 flex 
                items-center justify-center">{icons.top}</div>}
            </BaseHandle>

            <BaseHandle 
                type="source" 
                position={Position.Bottom} 
                id="bottom" 
                style={{ backgroundColor: color }}
            >
                {icons?.bottom && <div className="w-3.5 h-3.5 flex items-center justify-center">{icons.bottom}</div>}
            </BaseHandle>
        </>
    );
}

export default ConnectionHandles;