from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class NodeData(BaseModel):
    label: Optional[str] = None
    config: Dict[str, Any] = {}

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class ExecutionRequest(BaseModel):
    workflow: Workflow
    user_query: str

class ExecutionResponse(BaseModel):
    result: str
    logs: List[str] = []

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    definition: Workflow

class WorkflowDB(WorkflowCreate):
    id: int
    created_at: Any # datetime
    updated_at: Optional[Any] # datetime

    class Config:
        from_attributes = True
