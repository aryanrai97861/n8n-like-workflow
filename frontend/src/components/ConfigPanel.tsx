import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import type { Node } from 'reactflow';

interface ConfigPanelProps {
    selectedNode: Node | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ selectedNode, setNodes }) => {
    const [config, setConfig] = useState<any>({});
    const [uploading, setUploading] = useState(false);

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

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await axios.post(`${apiUrl}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            handleConfigChange('filename', file.name);
            handleConfigChange('uploaded', true);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (!selectedNode) {
        return (
            <div className="absolute right-4 top-4 w-64 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-slate-400 text-sm">
                Select a node to configure it.
            </div>
        );
    }

    return (
        <div className="absolute right-4 top-20 w-80 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-lg text-white border-b border-slate-700 pb-2">
                Configure {selectedNode.data.label}
            </h3>

            {selectedNode.type === 'user_query' && (
                <div className="text-sm text-slate-400">
                    This node accepts the initial user input. No configuration needed.
                </div>
            )}

            {selectedNode.type === 'knowledge_base' && (
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-slate-300">Upload Document (PDF)</label>
                    <div className="flex items-center gap-2">
                        <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-800 transition-all">
                            <Upload className={`w-6 h-6 mb-2 ${uploading ? 'animate-bounce text-blue-500' : 'text-slate-400'}`} />
                            <span className="text-xs text-slate-500">
                                {config.filename || "Click to upload"}
                            </span>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>
            )}

            {selectedNode.type === 'llm_engine' && (
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-slate-300">Custom Prompt System</label>
                    <textarea
                        className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="You are a helpful assistant..."
                        value={config.prompt || ''}
                        onChange={(e) => handleConfigChange('prompt', e.target.value)}
                    />
                </div>
            )}

            {selectedNode.type === 'output' && (
                <div className="text-sm text-slate-400">
                    Displays the final result. No configuration needed.
                </div>
            )}
        </div>
    );
};

export default ConfigPanel;
