import axios from 'axios';

const API_base_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_base_URL,
});

export interface WorkflowDefinition {
    nodes: any[];
    edges: any[];
}

export interface ExecutionRequest {
    workflow: WorkflowDefinition;
    user_query: string;
}

export const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Explicitly set Content-Type header to multipart/form-data
    const response = await api.post('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const executeWorkflow = async (workflow: WorkflowDefinition, userQuery: string) => {
    const payload: ExecutionRequest = {
        workflow,
        user_query: userQuery,
    };
    const response = await api.post('/api/execute', payload);
    return response.data;
};

export const getWorkflows = async (skip = 0, limit = 100) => {
    const response = await api.get(`/api/workflows?skip=${skip}&limit=${limit}`);
    return response.data;
};

export const getWorkflow = async (id: number | string) => {
    const response = await api.get(`/api/workflows/${id}`);
    return response.data;
};

export const saveWorkflow = async (id: number | string, data: any) => {
     const response = await api.put(`/api/workflows/${id}`, data);
     return response.data;
};

export const createWorkflow = async (data: any) => {
    const response = await api.post('/api/workflows', data);
    return response.data;
};

export default api;
