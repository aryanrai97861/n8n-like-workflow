# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React Frontend (Port 5173)                     │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │ │
│  │  │  Dashboard  │  │    Editor    │  │  Chat Interface │   │ │
│  │  │   (List)    │  │ (React Flow) │  │  (Execution)    │   │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘   │ │
│  │                                                              │ │
│  │  Components: Sidebar │ WorkflowBuilder │ ConfigPanel       │ │
│  │  Nodes: UserQuery │ KnowledgeBase │ LLM │ Output           │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Layer                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │             FastAPI Backend (Port 8000)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │Workflows │  │ Execute  │  │  Upload  │  │  Health  │   │ │
│  │  │ CRUD API │  │ Workflow │  │   PDF    │  │  Check   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  │                                                              │ │
│  │  Middleware: CORS │ Error Handling │ Logging                │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────┬──────────────────┬──────────────────┬───────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Service    │  │   Service    │  │     Service      │
│    Layer     │  │    Layer     │  │      Layer       │
├──────────────┤  ├──────────────┤  ├──────────────────┤
│  Workflow    │  │     LLM      │  │  Vector Store    │
│  Execution   │  │   Service    │  │    Service       │
│              │  │              │  │                  │
│• Topological │  │• Gemini Pro  │  │• ChromaDB Ops    │
│• Node Graph  │  │• Context     │  │• Embeddings      │
│• Data Flow   │  │• Prompts     │  │• Similarity      │
│• Validation  │  │• Web Search  │  │• Retrieval       │
└──────────────┘  └──────┬───────┘  └────────┬─────────┘
                         │                   │
                         ▼                   ▼
                ┌─────────────────┐  ┌──────────────┐
                │  External APIs  │  │ Vector DB    │
                ├─────────────────┤  ├──────────────┤
                │ Google Gemini   │  │  ChromaDB    │
                │ • gemini-pro    │  │  Persistent  │
                │ • embedding-001 │  │   Storage    │
                │                 │  │              │
                │ SerpAPI (Opt)   │  │ • Documents  │
                │ • Web Search    │  │ • Embeddings │
                └─────────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database (Neon)                   │   │
│  │                                                            │   │
│  │  Tables:                                                   │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │ workflows                                         │    │   │
│  │  │ • id (PK)                                         │    │   │
│  │  │ • name                                            │    │   │
│  │  │ • description                                     │    │   │
│  │  │ • definition (JSON: nodes, edges)                │    │   │
│  │  │ • created_at                                      │    │   │
│  │  │ • updated_at                                      │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Execution Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. User Creates Workflow (Visual Canvas)                        │
│                                                                   │
│     ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐         │
│     │ User │─────►│  KB  │─────►│ LLM  │─────►│ Out  │         │
│     │Query │      │ Base │      │Engine│      │ put  │         │
│     └──────┘      └──────┘      └──────┘      └──────┘         │
│                                                                   │
│  2. Workflow Saved to PostgreSQL                                 │
│     {nodes: [...], edges: [...]}                                 │
│                                                                   │
│  3. User Opens Chat & Asks Question                              │
│     "What is quantum computing?"                                 │
│                                                                   │
│  4. Backend Receives: {workflow, user_query}                     │
│                                                                   │
│  5. Topological Sort & Execution:                                │
│                                                                   │
│     Step 1: User Query Node                                      │
│     ┌─────────────────────────────────────┐                     │
│     │ Input: "What is quantum computing?" │                     │
│     │ Output: "What is quantum computing?"│                     │
│     └─────────────────────────────────────┘                     │
│                      │                                            │
│                      ▼                                            │
│     Step 2: Knowledge Base Node (Optional)                       │
│     ┌──────────────────────────────────────────┐                │
│     │ 1. Query ChromaDB with user question     │                │
│     │ 2. Get top 3 similar documents           │                │
│     │ 3. Return: "CONTEXT: ... QUERY: ..."    │                │
│     └──────────────────────────────────────────┘                │
│                      │                                            │
│                      ▼                                            │
│     Step 3: LLM Engine Node                                      │
│     ┌──────────────────────────────────────────┐                │
│     │ 1. Extract context & query               │                │
│     │ 2. (Optional) Fetch web search results   │                │
│     │ 3. Build prompt with system message      │                │
│     │ 4. Call Gemini API                       │                │
│     │ 5. Return: Generated response            │                │
│     └──────────────────────────────────────────┘                │
│                      │                                            │
│                      ▼                                            │
│     Step 4: Output Node                                          │
│     ┌──────────────────────────────────────────┐                │
│     │ Final response displayed in chat         │                │
│     └──────────────────────────────────────────┘                │
│                                                                   │
│  6. Response Returned to Frontend                                │
│     {result: "...", logs: [...]}                                 │
└──────────────────────────────────────────────────────────────────┘
```

## Component Details

### User Query Node
- **Purpose**: Entry point for user input
- **Input**: None (in-degree = 0)
- **Output**: User's question
- **Configuration**: None required

### Knowledge Base Node
- **Purpose**: Retrieve relevant context from documents
- **Input**: User query
- **Processing**:
  1. Accept PDF uploads via API
  2. Extract text using PyMuPDF
  3. Generate embeddings using Gemini Embedding Model
  4. Store in ChromaDB vector database
  5. On query: similarity search for top matches
- **Output**: Retrieved context + original query
- **Configuration**:
  - File upload
  - Embedding model (Gemini-001)

### LLM Engine Node
- **Purpose**: Generate intelligent responses
- **Input**: Query + optional context
- **Processing**:
  1. Parse input (query/context)
  2. Optionally fetch web search results (SerpAPI)
  3. Build final prompt with system message
  4. Call Gemini Pro API
  5. Return generated text
- **Output**: AI-generated response
- **Configuration**:
  - Custom API key (optional)
  - System prompt
  - Web search toggle

### Output Node
- **Purpose**: Display final result
- **Input**: Response from LLM
- **Output**: Rendered in chat interface
- **Configuration**: None required

## Data Models

### Workflow Schema (Pydantic)
```python
class NodeData(BaseModel):
    label: Optional[str]
    config: Dict[str, Any]

class Node(BaseModel):
    id: str
    type: str  # user_query, knowledge_base, llm_engine, output
    position: Dict[str, float]
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
```

### Database Model (SQLAlchemy)
```python
class WorkflowModel(Base):
    id: Integer (PK)
    name: String
    description: String
    definition: JSON  # Stores Workflow schema
    created_at: DateTime
    updated_at: DateTime
```

## Technology Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI framework |
| | TypeScript | Type safety |
| | Vite | Build tool & dev server |
| | React Flow | Workflow canvas |
| | Tailwind CSS | Styling |
| | Axios | HTTP client |
| **Backend** | FastAPI | REST API framework |
| | Python 3.11 | Runtime |
| | Pydantic | Data validation |
| | SQLAlchemy | ORM |
| | AsyncPG | Async PostgreSQL driver |
| **AI/ML** | Google Gemini Pro | LLM for responses |
| | Gemini Embeddings | Vector embeddings |
| | ChromaDB | Vector database |
| | SerpAPI (Optional) | Web search |
| **Storage** | PostgreSQL (Neon) | Relational DB |
| | ChromaDB Persistent | Vector storage |
| **DevOps** | Docker | Containerization |
| | Docker Compose | Orchestration |

## Security Considerations

1. **API Keys**: Stored in environment variables, never in code
2. **CORS**: Configured to allow specific frontend origins only
3. **Database**: Uses connection pooling and async operations
4. **Input Validation**: Pydantic schemas validate all inputs
5. **Error Handling**: Graceful degradation with informative messages

## Performance Optimizations

1. **Async Operations**: All I/O operations are async
2. **Connection Pooling**: Database connections are pooled
3. **Vector Search**: ChromaDB provides fast similarity search
4. **Frontend**: React Flow optimized for large graphs
5. **Caching**: LLM responses could be cached (future enhancement)

## Scalability Path

1. **Horizontal Scaling**: Backend can be replicated behind load balancer
2. **Database**: Neon provides auto-scaling PostgreSQL
3. **Vector Store**: Can migrate to ChromaDB server mode
4. **Queue System**: Add Celery for long-running workflows (future)
5. **CDN**: Static frontend assets can be served via CDN
