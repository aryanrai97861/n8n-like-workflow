import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { MessageSquare, FileText, Cpu, LogOut, Settings } from 'lucide-react';

// Common wrapper style for consistent "Card" look
const NodeCard = ({ title, icon: Icon, children, selected }: any) => (
    <div className={`bg-white rounded-xl shadow-xl border-2 w-80 overflow-hidden text-slate-900 ${selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-200'}`}>
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                    <Icon className="w-4 h-4 text-slate-700" />
                </div>
                <span className="font-semibold text-sm text-slate-800">{title}</span>
            </div>
            <Settings className="w-4 h-4 text-slate-400" />
        </div>
        <div className="p-4 space-y-3 bg-white">
            {children}
        </div>
    </div>
);

export const UserQueryNode = memo(({ data, selected }: NodeProps) => {
    const query = data.config?.query || '';
    
    return (
        <>
            <NodeCard title="User Input" icon={MessageSquare} selected={selected}>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Entry point for queries</label>
                    <div className="relative">
                        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 min-h-[80px] text-sm text-slate-600">
                            {query || (
                                <span className="text-slate-400 italic">Write your query here...</span>
                            )}
                        </div>
                        <div className="absolute top-2 right-2 text-xs text-slate-400">Query</div>
                    </div>
                </div>
            </NodeCard>
            <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" id="query" />
        </>
    );
});

export const KnowledgeBaseNode = memo(({ data, selected }: NodeProps) => {
    const fileName = data.config?.filename || "No file selected";
    const embeddingModel = data.config?.embeddingModel || "text-embedding-3-large";
    const apiKey = data.config?.apiKey || "";

    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" />
            <NodeCard title="Knowledge Base" icon={FileText} selected={selected}>
                <p className="text-xs text-slate-500 mb-2">Let LLM search info in your file</p>

                <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">File for Knowledge Base</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer">
                            <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
                            {fileName !== "No file selected" && (
                                <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                            )}
                        </div>
                    </div>

                    {/* Embedding Model */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Embedding Model</label>
                        <select className="w-full bg-white border border-slate-300 rounded-lg text-sm p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <option value="text-embedding-3-large">{embeddingModel}</option>
                            <option value="gemini-embedding-001">gemini-embedding-001</option>
                        </select>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={apiKey}
                                placeholder="Enter API key..."
                                readOnly
                            />
                            <div className="absolute right-2 top-2 text-slate-400 text-xs">
                                {apiKey ? "•••••" : "Not set"}
                            </div>
                        </div>
                    </div>
                </div>
            </NodeCard>
            <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" id="context" />
        </>
    );
});

export const LLMNode = memo(({ data, selected }: NodeProps) => {
    const model = data.config?.model || "GPT-4o-Mini";
    const apiKey = data.config?.apiKey || "";
    const prompt = data.config?.prompt || "You are a helpful PDF assistant. Use web search if the PDF lacks context.\n\nCONTEXT: {context}\nUser Query: {query}";
    const temperature = data.config?.temperature || "0.75";
    const useWebSearch = data.config?.useWebSearch || false;
    const serpApiKey = data.config?.serpApiKey || "";

    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" style={{ top: '30%' }} id="query" />
            <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" style={{ top: '70%' }} id="context" />

            <NodeCard title="LLM (Gemini)" icon={Cpu} selected={selected}>
                <div className="space-y-3">
                    {/* Model Selection */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Model</label>
                        <select className="w-full bg-white border border-slate-300 rounded-lg text-sm p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <option>{model}</option>
                            <option>gemini-pro</option>
                            <option>gemini-pro-vision</option>
                        </select>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm p-2 pr-8 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={apiKey}
                                placeholder="Enter API key..."
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Prompt</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs p-2 h-20 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                            value={prompt}
                            placeholder="System prompt..."
                            readOnly
                        />
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Temperature</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={temperature}
                            readOnly
                        />
                    </div>

                    {/* Web Search Toggle */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="text-xs font-medium text-slate-600">WebSearch Tool</label>
                        <div className={`w-10 h-5 rounded-full transition-colors ${useWebSearch ? 'bg-green-500' : 'bg-slate-300'} relative`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${useWebSearch ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                        </div>
                    </div>

                    {/* SERP API (if web search enabled) */}
                    {useWebSearch && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">SERP API</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={serpApiKey}
                                placeholder="SERP API key..."
                                readOnly
                            />
                        </div>
                    )}
                </div>
            </NodeCard>
            <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" />
        </>
    );
});

export const OutputNode = memo(({ data, selected }: NodeProps) => {
    const outputText = data.config?.outputText || "";
    const executionLogs = data.config?.executionLogs || [];
    
    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" />
            <NodeCard title="Output" icon={LogOut} selected={selected}>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Final Result</label>
                    <div>
                        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                            {outputText ? (
                                <div>
                                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{outputText}</p>
                                    {executionLogs.length > 0 && (
                                        <details className="mt-3 text-xs border-t border-slate-300 pt-2">
                                            <summary className="cursor-pointer text-slate-500 hover:text-slate-700 font-medium">
                                                Execution Logs ({executionLogs.length})
                                            </summary>
                                            <ul className="mt-2 space-y-1 text-slate-600 pl-4 list-disc">
                                                {executionLogs.map((log: string, i: number) => (
                                                    <li key={i} className="font-mono text-xs">{log}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-xs text-slate-400 italic">Click "Run Workflow" to see results</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </NodeCard>
        </>
    );
});
