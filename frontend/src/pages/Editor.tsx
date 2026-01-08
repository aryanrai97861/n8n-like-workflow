import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import WorkflowBuilder from '../components/WorkflowBuilder';
import Sidebar from '../components/Sidebar';
import { ReactFlowProvider } from 'reactflow';
import axios from 'axios';
import { ChevronLeft, Play, Save } from 'lucide-react';

const Editor = () => {
    const { id } = useParams();
    const [workflowName, setWorkflowName] = useState("Untitled Stack");
    const [initialData, setInitialData] = useState(null);

    const handleRun = () => {
        if ((window as any).runWorkflow) {
            (window as any).runWorkflow();
        }
    };

    const handleSave = () => {
        if ((window as any).saveWorkflow) {
            (window as any).saveWorkflow();
        }
    };

    useEffect(() => {
        if (id) {
            const fetchWorkflow = async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                    const res = await axios.get(`${apiUrl}/api/workflows/${id}`);
                    setWorkflowName(res.data.name);
                    setInitialData(res.data.definition);
                } catch (error) {
                    console.error("Failed to load workflow", error);
                }
            };
            fetchWorkflow();
        }
    }, [id]);

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden">
            {/* Editor Header */}
            <div className="h-14 border-b border-slate-200 bg-white flex items-center px-4 justify-between shadow-sm flex-none">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-900">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-xs font-bold text-white">ai</div>
                        <span className="font-medium">{workflowName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Auto-saved</span>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm font-medium transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                    <button 
                        onClick={handleRun}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-green-600/30"
                    >
                        <Play className="w-4 h-4" />
                        Run Workflow
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Share</button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <ReactFlowProvider>
                    <Sidebar />
                    {/* Key forces remount when initialData loads to ensure React Flow gets it */}
                    {initialData !== undefined && (
                        <WorkflowBuilder workflowId={id} initialData={initialData} />
                    )}
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default Editor;
