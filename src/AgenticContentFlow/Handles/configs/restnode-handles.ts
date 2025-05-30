import { NodeHandleConfiguration } from "../../types/handleTypes";

export const restNodeConfig: NodeHandleConfiguration = {
    nodeType: 'restnode',
    category: 'integration',
    handles: [
        {
            position: 'left',
            type: 'target',
            dataFlow: 'data',
            acceptsFrom: ['data'],
            edgeType: 'default'
        },
        {
            position: 'right',
            type: 'source',
            dataFlow: 'data',
            connectsTo: ['view', 'data', 'integration'],
            edgeType: 'default'
        }
    ]
};