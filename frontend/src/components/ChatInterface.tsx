import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, Loader2 } from 'lucide-react';

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
            const payload = {
                workflow: workflowData,
                user_query: userMessage
            };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            {/* Modal Container - Light theme like Figma */}
            <div className="w-[600px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            ai
                        </div>
                        GenAI Stack Chat
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5">
                    {messages.length === 0 ? (
                        /* Empty State - Centered logo like Figma */
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
                                ai
                            </div>
                            <p className="text-slate-500 text-sm">Start a conversation to test your stack</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            ai
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-800'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        {msg.logs && msg.logs.length > 0 && (
                                            <details className="mt-2 text-xs border-t border-slate-200 pt-2 cursor-pointer">
                                                <summary className="text-slate-500">Execution Logs</summary>
                                                <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-slate-500">
                                                    {msg.logs.map((log, i) => (
                                                        <li key={i}>{log}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        ai
                                    </div>
                                    <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                        <span className="text-slate-500 text-sm">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Send a message"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
