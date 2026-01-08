import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Panel
} from 'reactflow';
import type {
    Node,
    Connection,
    Edge,
    ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play } from 'lucide-react';

import ChatInterface from './ChatInterface';
import ConfigPanel from './ConfigPanel';

const initialNodes: Node[] = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

const WorkflowBuilder = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node`, config: {} },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onRunWorkflow = () => {
        // Validate workflow?
        setIsChatOpen(true);
    };

    const getWorkflowData = () => {
        return {
            nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
            edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
        };
    };

    return (
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView
                className="bg-slate-900 text-white"
                nodeTypes={{}}
            >
                <Controls className="bg-slate-800 border-slate-700 fill-slate-400" />
                <Background color="#334155" gap={20} size={1} />
                <MiniMap className="bg-slate-900 border-slate-800" maskColor="rgba(30, 41, 59, 0.7)" />

                <Panel position="top-right" className="flex gap-2">
                    <button
                        onClick={onRunWorkflow}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all font-medium"
                    >
                        <Play className="w-4 h-4" />
                        Build & Run
                    </button>
                </Panel>
            </ReactFlow>

            <ConfigPanel selectedNode={selectedNode} setNodes={setNodes} />

            <ChatInterface
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                workflowData={getWorkflowData()}
            />
        </div>
    );
};

export default WorkflowBuilder;
