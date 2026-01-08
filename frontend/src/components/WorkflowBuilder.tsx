import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { Play, Save } from 'lucide-react';
import axios from 'axios';

import {
    UserQueryNode,
    KnowledgeBaseNode,
    LLMNode,
    OutputNode
} from '../nodes/CustomNodes';

import ChatInterface from './ChatInterface';
import ConfigPanel from './ConfigPanel';

const idGen = () => `dndnode_${Math.random().toString(36).substr(2, 9)}`;

interface WorkflowBuilderProps {
    workflowId?: string;
    initialData?: any;
}

const nodeTypes = {
    user_query: UserQueryNode,
    knowledge_base: KnowledgeBaseNode,
    llm_engine: LLMNode,
    output: OutputNode,
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflowId, initialData }) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            if (initialData.nodes) setNodes(initialData.nodes);
            if (initialData.edges) setEdges(initialData.edges);
        }
    }, [initialData, setNodes, setEdges]);


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
                id: idGen(),
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

    const onSave = async () => {
        if (!workflowId) return;
        setSaving(true);
        try {
            const workflowDef = {
                nodes: nodes,
                edges: edges
            };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            // We need to fetch current name/desc to merge, or PUT endpoint could support partial.
            // For now assume PUT updates definition.

            // Fetch first to get name/desc (inefficient but safe)
            const currentRes = await axios.get(`${apiUrl}/api/workflows/${workflowId}`);

            await axios.put(`${apiUrl}/api/workflows/${workflowId}`, {
                name: currentRes.data.name,
                description: currentRes.data.description,
                definition: workflowDef
            });
            alert("Workflow Saved!");
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save workflow");
        } finally {
            setSaving(false);
        }
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
                className="bg-slate-50"
                nodeTypes={nodeTypes}
            >
                <Controls className="bg-white border-slate-200 fill-slate-500" />
                <Background color="#cbd5e1" gap={20} size={1} />
                <MiniMap className="bg-white border-slate-200" maskColor="rgba(241, 245, 249, 0.7)" />

                <Panel position="top-right" className="flex gap-2">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow-lg border border-slate-600 transition-all font-medium"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
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
