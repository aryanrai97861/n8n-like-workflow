import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { MessageSquare, FileText, Cpu, LogOut } from 'lucide-react';

// Common wrapper style for consistent "Card" look
const NodeCard = ({ title, icon: Icon, children, selected }: any) => (
    <div className={`bg-white rounded-lg shadow-lg border-2 w-80 overflow-hidden text-slate-900 ${selected ? 'border-blue-500' : 'border-slate-200'}`}>
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <span className="font-semibold text-sm">{title}</span>
        </div>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

export const UserQueryNode = memo(({ data, selected }: NodeProps) => {
    return (
        <>
            <NodeCard title="User Input" icon={MessageSquare} selected={selected}>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enter point for querys</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <span className="text-sm text-slate-400 italic">User Query will be injected here...</span>
                    </div>
                </div>
            </NodeCard>
            <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3" />
        </>
    );
});

export const KnowledgeBaseNode = memo(({ data, selected }: NodeProps) => {
    // Handling generic file upload status via simple state or visual indication
    const fileName = data.config?.filename || "No file selected";

    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" />
            <NodeCard title="Knowledge Base" icon={FileText} selected={selected}>
                <p className="text-xs text-slate-500 mb-2">Let LLM search info in your file</p>

                <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                        <p className="text-sm font-medium text-green-600 truncate px-2">{fileName}</p>
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-slate-600">Click to Upload via Panel</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Embedding Model</label>
                        <select className="w-full bg-white border border-slate-300 rounded-md text-sm p-2 outline-none focus:border-blue-500" disabled>
                            <option>gemini-embedding-001</option>
                        </select>
                    </div>
                </div>
            </NodeCard>
            <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3" />
        </>
    );
});

export const LLMNode = memo(({ data, selected }: NodeProps) => {
    const model = "Gemini Pro";
    const apiKey = data.config?.apiKey ? "••••••••" : "";

    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" style={{ top: '30%' }} />
            <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-3 !h-3" style={{ top: '70%' }} id="context" />

            <NodeCard title="LLM Engine" icon={Cpu} selected={selected}>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                        <span className="text-xs font-medium text-blue-700">Model</span>
                        <span className="text-xs font-bold text-slate-700">{model}</span>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">API Key</label>
                        <div className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 h-9 flex items-center text-sm text-slate-500">
                            {apiKey || <span className="italic opacity-50">Not Set</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">System Prompt</label>
                        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-2 h-16 overflow-hidden text-ellipsis">
                            {data.config?.prompt || "You are a helpful assistant..."}
                        </div>
                    </div>
                </div>
            </NodeCard>
            <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3" />
        </>
    );
});

export const OutputNode = memo(({ data, selected }: NodeProps) => {
    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" />
            <NodeCard title="Output" icon={LogOut} selected={selected}>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Output Text</label>
                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 min-h-[60px] flex items-center justify-center">
                        <span className="text-xs text-slate-400">Result will be shown here</span>
                    </div>
                </div>
            </NodeCard>
        </>
    );
});
