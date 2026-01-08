import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, Settings } from 'lucide-react';
import type { Node } from 'reactflow';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ConfigPanelProps {
    selectedNode: Node | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    onClose?: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ selectedNode, setNodes, onClose }) => {
    const [config, setConfig] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setConfig(selectedNode.data.config || {});
        }
    }, [selectedNode]);

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode?.id) {
                    node.data = {
                        ...node.data,
                        config: newConfig,
                    };
                }
                return node;
            })
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setUploading(true);
        setUploadStatus('Uploading...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            handleConfigChange('filename', file.name);
            handleConfigChange('fileId', response.data.file_id);
            setUploadStatus('✓ Upload successful!');
            setTimeout(() => setUploadStatus(''), 3000);
        } catch (error) {
            console.error('Upload failed', error);
            setUploadStatus('✗ Upload failed');
            setTimeout(() => setUploadStatus(''), 3000);
        } finally {
            setUploading(false);
        }
    };

    const renderUserQueryConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">User Query</label>
                <textarea
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    value={config.query || ''}
                    onChange={(e) => handleConfigChange('query', e.target.value)}
                    placeholder="Enter your question here..."
                />
                <p className="text-xs text-slate-500 mt-2">This is the initial input that will be processed through your workflow.</p>
            </div>
        </div>
    );

    const renderKnowledgeBaseConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload PDF Document</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                        disabled={uploading}
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        {config.filename ? (
                            <div>
                                <p className="text-sm font-medium text-green-600">{config.filename}</p>
                                <p className="text-xs text-slate-500 mt-1">Click to upload a different file</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm font-medium text-slate-700">Click to upload PDF</p>
                                <p className="text-xs text-slate-500 mt-1">Support for .pdf files</p>
                            </div>
                        )}
                        {uploadStatus && (
                            <p className={`text-xs mt-2 font-medium ${uploadStatus.includes('✓') ? 'text-green-600' : uploadStatus.includes('✗') ? 'text-red-600' : 'text-blue-600'}`}>
                                {uploadStatus}
                            </p>
                        )}
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Embedding Model</label>
                <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.embeddingModel || 'text-embedding-3-large'}
                    onChange={(e) => handleConfigChange('embeddingModel', e.target.value)}
                >
                    <option value="text-embedding-3-large">text-embedding-3-large</option>
                    <option value="gemini-embedding-001">gemini-embedding-001</option>
                    <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Model used to convert text into vector embeddings</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">API Key (Gemini)</label>
                <input
                    type="password"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.apiKey || ''}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    placeholder="Enter your Gemini API key..."
                />
                <p className="text-xs text-slate-500 mt-2">Your API key for Google Gemini (get it from <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>)</p>
            </div>
        </div>
    );

    const renderLLMConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.model || 'GPT-4o-Mini'}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                >
                    <option value="GPT-4o-Mini">GPT-4o-Mini</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">API Key (Gemini)</label>
                <input
                    type="password"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.apiKey || ''}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    placeholder="Enter your Gemini API key..."
                />
                <p className="text-xs text-slate-500 mt-2">Required for LLM inference</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">System Prompt</label>
                <textarea
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    rows={6}
                    value={config.prompt || 'You are a helpful PDF assistant. Use web search if the PDF lacks context.\n\nCONTEXT: {context}\nUser Query: {query}'}
                    onChange={(e) => handleConfigChange('prompt', e.target.value)}
                    placeholder="System instructions for the LLM..."
                />
                <p className="text-xs text-slate-500 mt-2">Use {'{'}'context'{'}'} and {'{'}'query'{'}'} as placeholders for dynamic data</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Temperature: {config.temperature || '0.75'}</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    className="w-full"
                    value={config.temperature || 0.75}
                    onChange={(e) => handleConfigChange('temperature', e.target.value)}
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Precise (0)</span>
                    <span>Creative (1)</span>
                </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">Web Search Tool</label>
                        <p className="text-xs text-slate-500">Enable external web search capabilities</p>
                    </div>
                    <button
                        onClick={() => handleConfigChange('useWebSearch', !config.useWebSearch)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config.useWebSearch ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                config.useWebSearch ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {config.useWebSearch && (
                    <div className="mt-3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">SERP API Key</label>
                        <input
                            type="password"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={config.serpApiKey || ''}
                            onChange={(e) => handleConfigChange('serpApiKey', e.target.value)}
                            placeholder="Enter your SerpAPI key..."
                        />
                        <p className="text-xs text-slate-500 mt-2">Get API key from <a href="https://serpapi.com/" target="_blank" className="text-blue-600 underline">serpapi.com</a></p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderOutputConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Output Preview</label>
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 min-h-[120px] max-h-[300px] overflow-y-auto">
                    {config.outputText ? (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{config.outputText}</p>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No output yet. Run the workflow to see results.</p>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2">This shows the final result from your workflow execution</p>
            </div>
        </div>
    );

    const renderConfig = () => {
        if (!selectedNode) return null;

        switch (selectedNode.type) {
            case 'user_query':
                return renderUserQueryConfig();
            case 'knowledge_base':
                return renderKnowledgeBaseConfig();
            case 'llm_engine':
                return renderLLMConfig();
            case 'output':
                return renderOutputConfig();
            default:
                return <p className="text-sm text-slate-500">No configuration available for this node type.</p>;
        }
    };

    const getNodeTitle = () => {
        if (!selectedNode) return 'Configure Node';
        
        const titles: { [key: string]: string } = {
            user_query: 'User Input',
            knowledge_base: 'Knowledge Base',
            llm_engine: 'LLM Engine (Gemini)',
            output: 'Output'
        };
        return titles[selectedNode.type] || 'Configure Node';
    };

    if (!selectedNode) {
        return null;
    }

    return (
        <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 flex items-center justify-between border-b border-slate-600">
                <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <h2 className="text-lg font-bold">{getNodeTitle()}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 max-h-[600px] overflow-y-auto">
                {renderConfig()}
            </div>

            <div className="bg-gradient-to-t from-white via-white to-transparent p-4 border-t border-slate-200">
                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default ConfigPanel;
