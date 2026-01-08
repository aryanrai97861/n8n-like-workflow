import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position, useReactFlow } from 'reactflow';
import { MessageSquare, Database, Settings, SquareStack, Upload } from 'lucide-react';

// Common wrapper style for consistent "Card" look - matching Figma design
const NodeCard = ({ title, subtitle, icon: Icon, children, selected, iconColor = "text-slate-600", iconBg = "bg-blue-50" }: any) => (
    <div className={`bg-white rounded-xl shadow-lg border w-72 overflow-hidden text-slate-800 ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'}`}>
        {/* Header with light blue background like Figma */}
        <div className="bg-[#EBF0FF] border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 ${iconBg} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <span className="font-semibold text-sm text-slate-800">{title}</span>
            </div>
            <Settings className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
        </div>
        {/* Subtitle */}
        {subtitle && (
            <div className="px-4 pt-3">
                <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
        )}
        {/* Body */}
        <div className="p-4 space-y-3 bg-white">
            {children}
        </div>
    </div>
);

// Handle with label component
const LabeledHandle = ({ type, position, id, label, style }: any) => (
    <div className="relative">
        <Handle
            type={type}
            position={position}
            id={id}
            style={style}
            className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
        />
        {label && (
            <span
                className={`absolute text-[10px] text-slate-500 whitespace-nowrap ${position === Position.Left ? 'left-4' : 'right-4'
                    } top-1/2 -translate-y-1/2`}
                style={style}
            >
                {label}
            </span>
        )}
    </div>
);

export const UserQueryNode = memo(({ data, selected }: NodeProps) => {
    const query = data.config?.query || '';

    return (
        <>
            <NodeCard
                title="User Query"
                subtitle="Enter point for querys"
                icon={MessageSquare}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                selected={selected}
            >
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">User Query</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[60px] text-sm">
                        {query || (
                            <span className="text-slate-400">Write your query here</span>
                        )}
                    </div>
                </div>
            </NodeCard>
            {/* Output handle with label */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
                id="query"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">Query</div>
        </>
    );
});

export const KnowledgeBaseNode = memo(({ id, data, selected }: NodeProps) => {
    const fileName = data.config?.filename || "";
    const embeddingModel = data.config?.embeddingModel || "text-embedding-3-large";
    const [uploading, setUploading] = React.useState(false);
    const { setNodes } = useReactFlow();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { uploadDocument } = await import('../services/api');
            const response = await uploadDocument(file);

            setNodes((nds) => nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...node.data.config,
                                filename: file.name,
                                fileId: response.file_id
                            }
                        }
                    };
                }
                return node;
            }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* Input handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">Query</div>

            <NodeCard
                title="Knowledge Base"
                subtitle="Let LLM search info in your file"
                icon={Database}
                iconColor="text-green-600"
                iconBg="bg-green-100"
                selected={selected}
            >
                <div className="space-y-3">
                    {/* File Upload - Green dashed border like Figma */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">File for Knowledge Base</label>
                        <div className="relative border-2 border-dashed border-green-400 bg-green-50/50 rounded-lg p-4 text-center hover:bg-green-50 transition-all cursor-pointer">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleUpload}
                                accept=".pdf,.txt,.md"
                            />
                            {uploading ? (
                                <p className="text-sm text-slate-600 animate-pulse">Uploading...</p>
                            ) : fileName ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm text-green-700 font-medium truncate">{fileName}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <Upload className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">Upload File</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Embedding Model */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Embedding Model</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:border-blue-500">
                            <option value="text-embedding-3-large">{embeddingModel}</option>
                            <option value="gemini-embedding-001">gemini-embedding-001</option>
                        </select>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:border-blue-500"
                            value="••••••••••••••••"
                            readOnly
                        />
                    </div>
                </div>
            </NodeCard>

            {/* Output handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
                id="context"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">Context</div>
        </>
    );
});

export const LLMNode = memo(({ data, selected }: NodeProps) => {
    const model = data.config?.model || "gemini-2.0-flash";
    const prompt = data.config?.prompt || "You are a helpful PDF assistant. Use web search if the PDF lacks context.\n\nCONTEXT: {context}\nUser Query: {query}";
    const temperature = data.config?.temperature || "0.75";
    const useWebSearch = data.config?.useWebSearch || false;

    // Render prompt with colored variables like Figma
    const renderPromptWithVariables = (text: string) => {
        return text.split(/(\{context\}|\{query\})/g).map((part, i) => {
            if (part === '{context}') {
                return <span key={i} className="bg-blue-100 text-blue-700 px-1 rounded">CONTEXT: {'{context}'}</span>;
            }
            if (part === '{query}') {
                return <span key={i} className="bg-orange-100 text-orange-700 px-1 rounded">User Query: {'{query}'}</span>;
            }
            return part;
        });
    };

    return (
        <>
            {/* Input handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
                style={{ top: '35%' }}
                id="query"
            />
            <div className="absolute left-6 text-[10px] text-slate-500" style={{ top: '35%', transform: 'translateY(-50%)' }}>Query</div>

            <Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
                style={{ top: '65%' }}
                id="context"
            />
            <div className="absolute left-6 text-[10px] text-slate-500" style={{ top: '65%', transform: 'translateY(-50%)' }}>Context</div>

            <NodeCard
                title="LLM (Gemini)"
                subtitle="Run a query with Gemini LLM"
                icon={Settings}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
                selected={selected}
            >
                <div className="space-y-3">
                    {/* Model Selection */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Model</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:border-blue-500"
                            defaultValue={model}
                        >
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-flash-latest">Gemini Flash Latest</option>
                        </select>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
                        <input
                            type="password"
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:border-blue-500"
                            value="••••••••••••••••"
                            readOnly
                        />
                    </div>

                    {/* Prompt with colored variables */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Prompt</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 min-h-[80px] text-xs leading-relaxed">
                            <p className="text-slate-600 mb-2">You are a helpful PDF assistant. Use web search if the PDF lacks context.</p>
                            <div className="space-y-1">
                                <div><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">CONTEXT:</span> <span className="text-slate-500">{'{context}'}</span></div>
                                <div><span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-medium">User Query:</span> <span className="text-slate-500">{'{query}'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Temperature</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:border-blue-500"
                            value={temperature}
                            readOnly
                        />
                    </div>

                    {/* Web Search Toggle */}
                    <div className="flex items-center justify-between py-2">
                        <label className="text-xs font-medium text-slate-600">WebSearch Tool</label>
                        <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${useWebSearch ? 'bg-green-500' : 'bg-slate-300'} relative`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${useWebSearch ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                        </div>
                    </div>

                    {/* SERP API */}
                    {useWebSearch && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">SERF API</label>
                            <input
                                type="password"
                                className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:border-blue-500"
                                placeholder="Enter SERP API key..."
                                readOnly
                            />
                        </div>
                    )}
                </div>
            </NodeCard>

            {/* Output handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
            />
        </>
    );
});

export const OutputNode = memo(({ data, selected }: NodeProps) => {
    const outputText = data.config?.outputText || "";
    const executionLogs = data.config?.executionLogs || [];

    return (
        <>
            {/* Input handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !shadow-md"
            />

            <NodeCard
                title="Output"
                subtitle="Output of the result nodes as text"
                icon={SquareStack}
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
                selected={selected}
            >
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">Output Text</label>
                    <div className={`border rounded-lg p-3 min-h-[80px] max-h-[150px] overflow-y-auto ${outputText ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'
                        }`}>
                        {outputText ? (
                            <div>
                                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{outputText}</p>
                                {executionLogs.length > 0 && (
                                    <details className="mt-3 text-xs border-t border-slate-200 pt-2">
                                        <summary className="cursor-pointer text-slate-500 hover:text-slate-700 font-medium">
                                            Execution Logs ({executionLogs.length})
                                        </summary>
                                        <ul className="mt-2 space-y-1 text-slate-500 pl-4 list-disc">
                                            {executionLogs.map((log: string, i: number) => (
                                                <li key={i} className="font-mono text-[10px]">{log}</li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Output will be generated based on query</p>
                        )}
                    </div>
                </div>
            </NodeCard>
        </>
    );
});
