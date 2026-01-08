import React from 'react';
import { MessageSquare, FileText, Cpu, MessageCircle } from 'lucide-react';

const Sidebar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-700 p-4 flex flex-col gap-4">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Workflow Builder
            </div>

            <div className="space-y-3">
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Components</div>

                <div className="grid gap-3">
                    <div
                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-colors border border-slate-700 hover:border-blue-500/50"
                        onDragStart={(event) => onDragStart(event, 'user_query')}
                        draggable
                    >
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">User Query</span>
                    </div>

                    <div
                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-colors border border-slate-700 hover:border-green-500/50"
                        onDragStart={(event) => onDragStart(event, 'knowledge_base')}
                        draggable
                    >
                        <FileText className="w-5 h-5 text-green-400" />
                        <span className="font-medium">Knowledge Base</span>
                    </div>

                    <div
                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-colors border border-slate-700 hover:border-purple-500/50"
                        onDragStart={(event) => onDragStart(event, 'llm_engine')}
                        draggable
                    >
                        <Cpu className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">LLM Engine</span>
                    </div>

                    <div
                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-colors border border-slate-700 hover:border-orange-500/50"
                        onDragStart={(event) => onDragStart(event, 'output')}
                        draggable
                    >
                        <MessageCircle className="w-5 h-5 text-orange-400" />
                        <span className="font-medium">Output</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-400">
                    Drag components to the canvas to build your workflow.
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
