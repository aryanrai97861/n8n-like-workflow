import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    workflowData: any; // { nodes, edges }
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    logs?: string[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, workflowData }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Include workflow definition in every request for stateless execution
            // In a real app, we might save workflow ID first.
            const payload = {
                workflow: workflowData,
                user_query: userMessage
            };

            // Assuming VITE_API_URL is set, or proxy is used.
            // For now hardcode localhost:8000 if env not present, or use relative /api
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

            const response = await axios.post(`${apiUrl}/api/execute`, payload);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.result,
                logs: response.data.logs
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message || 'Unknown error occurred'}`,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[800px] h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-400" />
                        Chat with Stack
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-500 mt-20">
                            <p>Ask a question to start the workflow.</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[70%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.logs && msg.logs.length > 0 && (
                                    <details className="mt-2 text-xs text-slate-500 border-t border-slate-700 pt-2 cursor-pointer">
                                        <summary>Execution Logs</summary>
                                        <ul className="list-disc pl-4 mt-1 space-y-1 font-mono">
                                            {msg.logs.map((log, i) => (
                                                <li key={i}>{log}</li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-slate-300" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-slate-800 rounded-2xl p-4 rounded-bl-none border border-slate-700 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                <span className="text-slate-400 text-sm">Processing workflow...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-slate-800 border-t border-slate-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-white"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
