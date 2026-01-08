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
    const [isExecuting, setIsExecuting] = useState(false);

    // Expose methods to parent via custom event
    useEffect(() => {
        (window as any).runWorkflow = onRunWorkflow;
        (window as any).saveWorkflow = onSave;
        (window as any).getWorkflowData = () => ({
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: n.data
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle,
                targetHandle: e.targetHandle
            }))
        });
        return () => {
            delete (window as any).runWorkflow;
            delete (window as any).saveWorkflow;
            delete (window as any).getWorkflowData;
        };
    }, [nodes, edges, workflowId]);

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

    const onRunWorkflow = async () => {
        // Find the User Query node to get the query
        const userQueryNode = nodes.find(n => n.type === 'user_query');
        if (!userQueryNode || !userQueryNode.data?.config?.query) {
            alert('Please configure the User Query node with a question first!');
            return;
        }

        setIsExecuting(true);

        try {
            const workflowDef = {
                nodes: nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    position: n.position,
                    data: n.data
                })),
                edges: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                    targetHandle: e.targetHandle
                }))
            };

            const { executeWorkflow } = await import('../services/api');
            const response = await executeWorkflow(workflowDef, userQueryNode.data.config.query);

            // Update the Output node with the result
            setNodes(nds =>
                nds.map(node => {
                    if (node.type === 'output') {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                config: {
                                    ...node.data.config,
                                    outputText: response.result,
                                    executionLogs: response.logs
                                }
                            }
                        };
                    }
                    return node;
                })
            );

            // Open chat with results automatically? 
            // Maybe just showing in node is enough as per "Output Component" requirement.

        } catch (error: any) {
            console.error('Execution error:', error);
            alert(`Execution failed: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsExecuting(false);
        }
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
            </ReactFlow>

            {/* Config Panel - Only show when node is selected */}
            {selectedNode && (
                <div className="absolute top-4 right-4 z-10 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <ConfigPanel selectedNode={selectedNode} setNodes={setNodes} onClose={() => setSelectedNode(null)} />
                </div>
            )}

            <ChatInterface
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                workflowData={getWorkflowData()}
            />
        </div>
    );
};

export default WorkflowBuilder;
