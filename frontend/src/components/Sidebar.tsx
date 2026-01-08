import React from 'react';
import { MessageSquare, Database, Settings, SquareStack, MessageCircle } from 'lucide-react';

const Sidebar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Componentes</h2>
            </div>

            {/* Chat With AI Button */}
            <div className="p-4 border-b border-slate-200">
                <button
                    onClick={() => {
                        if ((window as any).openChat) {
                            (window as any).openChat();
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    Chat With AI
                </button>
            </div>

            {/* Component List */}
            <div className="p-4 space-y-3 flex-1">
                {/* User Query */}
                <div
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-grab hover:bg-slate-50 transition-colors border border-slate-200 hover:border-blue-400 hover:shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'user_query')}
                    draggable
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700 text-sm">User Query</span>
                </div>

                {/* LLM (Gemini) */}
                <div
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-grab hover:bg-slate-50 transition-colors border border-slate-200 hover:border-purple-400 hover:shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'llm_engine')}
                    draggable
                >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-700 text-sm">LLM (Gemini)</span>
                </div>

                {/* Knowledge Base */}
                <div
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-grab hover:bg-slate-50 transition-colors border border-slate-200 hover:border-green-400 hover:shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'knowledge_base')}
                    draggable
                >
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Database className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium text-slate-700 text-sm">Knowledge Base</span>
                </div>

                {/* Output */}
                <div
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-grab hover:bg-slate-50 transition-colors border border-slate-200 hover:border-orange-400 hover:shadow-sm"
                    onDragStart={(event) => onDragStart(event, 'output')}
                    draggable
                >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <SquareStack className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-medium text-slate-700 text-sm">Output</span>
                </div>
            </div>

            {/* Help text */}
            <div className="p-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                    Drag components to the canvas to build your workflow.
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
