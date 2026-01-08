import React from 'react';
import {
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './components/Sidebar';
import WorkflowBuilder from './components/WorkflowBuilder';

const App = () => {
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white overflow-hidden">
      <ReactFlowProvider>
        <Sidebar />
        <WorkflowBuilder />
      </ReactFlowProvider>
    </div>
  );
};

export default App;
