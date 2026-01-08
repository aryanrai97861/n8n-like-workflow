import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Layout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Workflow {
    id: number;
    name: string;
    description: string;
    updated_at: string;
}

const Dashboard = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const res = await axios.get(`${apiUrl}/api/workflows`);
                setWorkflows(res.data);
            } catch (error) {
                console.error("Failed to fetch workflows", error);
            }
        };
        fetchWorkflows();
    }, []);

    const createNewStack = async () => {
        const name = prompt("Enter Stack Name:");
        if (!name) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await axios.post(`${apiUrl}/api/workflows`, {
                name: name,
                description: "New AI Workflow",
                definition: { nodes: [], edges: [] }
            });
            navigate(`/editor/${res.data.id}`);
        } catch (error) {
            alert("Failed to create stack");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">ai</div>
                    <span className="font-semibold text-lg">GenAI Stack</span>
                </div>
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold">S</div>
            </header>

            {/* Main Content */}
            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">My Stacks</h1>
                    <button
                        onClick={createNewStack}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Stack
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {workflows.map((wf) => (
                        <div key={wf.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-48">
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-1">{wf.name}</h3>
                                <p className="text-slate-500 text-sm">{wf.description}</p>
                            </div>
                            <div className="mt-auto flex justify-end">
                                <Link
                                    to={`/editor/${wf.id}`}
                                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium text-sm border px-3 py-1 rounded-md"
                                >
                                    Edit Stack
                                    <Layout className="w-3 h-3 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {workflows.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            <p className="text-lg">No stacks found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
