# No-Code Intelligent Workflow Builder 🚀

A powerful no-code/low-code web application for building intelligent AI workflows with drag-and-drop interface. Built with React Flow, FastAPI, Google Gemini, and ChromaDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Visual Workflow Builder**: Drag-and-drop interface powered by React Flow
- **4 Core Components**:
  - 🎯 **User Query**: Entry point for user input
  - 📚 **Knowledge Base**: PDF upload, text extraction, and vector search
  - 🤖 **LLM Engine**: Google Gemini integration with custom prompts
  - 📤 **Output**: Display results in chat interface
- **Intelligent Knowledge Retrieval**: ChromaDB vector store with Gemini embeddings
- **Interactive Chat**: Real-time workflow execution with conversation history
- **Workflow Persistence**: Save and load workflows from PostgreSQL (Neon)
- **Modern UI**: Clean, responsive design with Tailwind CSS

## 🛠 Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (Build tool)
- React Flow (Workflow builder)
- Tailwind CSS (Styling)
- Axios (API calls)
- Lucide React (Icons)

### Backend
- FastAPI (Python web framework)
- Google Gemini (LLM & Embeddings)
- ChromaDB (Vector store)
- SQLAlchemy (ORM)
- AsyncPG (Async PostgreSQL driver)
- PyMuPDF (PDF text extraction)

### Database & Infrastructure
- PostgreSQL (Neon)
- Docker & Docker Compose
- ChromaDB Persistent Storage

## 📦 Prerequisites

Before you begin, ensure you have:

- **Docker** (v20.10+) & **Docker Compose** (v2.0+)
- **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **Neon PostgreSQL Database** - [Sign up here](https://neon.tech)
- **(Optional)** SerpAPI Key for web search - [Get it here](https://serpapi.com)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Full Stack Engineering Assignment"
```

### 2. Configure Environment Variables

#### Backend Configuration

Create `backend/.env`:

```env
# Database (Get from Neon: https://neon.tech)
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname

# Google Gemini API (Get from: https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: SerpAPI for web search
SERPAPI_API_KEY=your_serpapi_key_here

# Vector Store Path
CHROMA_DB_PATH=/app/chroma_db
```

#### Frontend Configuration

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Launch with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Environment Setup

### Development (Without Docker)

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see above)

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (see above)

# Run development server
npm run dev
```

## 🏗 Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │      │   FastAPI    │      │  PostgreSQL │
│  Frontend   │◄────►│   Backend    │◄────►│    (Neon)   │
│  (Vite)     │      │              │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├──────────►┌─────────────┐
                            │           │  ChromaDB   │
                            │           │ (Vectors)   │
                            │           └─────────────┘
                            │
                            ├──────────►┌─────────────┐
                            │           │   Gemini    │
                            │           │ (LLM & EMB) │
                            └──────────►└─────────────┘
```

### Workflow Execution Flow

1. **User builds workflow** visually in React Flow
2. **User clicks "Build & Run"** → Opens chat interface
3. **User asks question** → Sent to backend with workflow definition
4. **Backend executes workflow**:
   - User Query node captures input
   - Knowledge Base (optional) retrieves context from ChromaDB
   - LLM Engine sends query + context to Gemini
   - Output node returns response
5. **Frontend displays result** in chat

## 📁 Project Structure

```
Full Stack Engineering Assignment/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py          # API routes
│   │   ├── core/
│   │   │   ├── config.py             # Settings
│   │   │   └── database.py           # DB connection
│   │   ├── models/
│   │   │   └── workflow.py           # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── workflow.py           # Pydantic schemas
│   │   ├── services/
│   │   │   ├── llm.py                # Gemini integration
│   │   │   ├── vector_store.py       # ChromaDB operations
│   │   │   └── workflow.py           # Workflow execution engine
│   │   └── main.py                   # FastAPI app
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowBuilder.tsx   # Main canvas
│   │   │   ├── ChatInterface.tsx     # Chat UI
│   │   │   ├── ConfigPanel.tsx       # Node configuration
│   │   │   └── Sidebar.tsx           # Component library
│   │   ├── nodes/
│   │   │   └── CustomNodes.tsx       # Node definitions
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Workflow list
│   │   │   └── Editor.tsx            # Workflow editor
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 📚 API Documentation

### Endpoints

#### Workflow Management

- `POST /api/workflows` - Create new workflow
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/{id}` - Get workflow by ID
- `PUT /api/workflows/{id}` - Update workflow

#### Workflow Execution

- `POST /api/execute` - Execute workflow with user query
  ```json
  {
    "workflow": {
      "nodes": [...],
      "edges": [...]
    },
    "user_query": "What is AI?"
  }
  ```

#### Document Management

- `POST /api/upload` - Upload PDF document
  - Extracts text using PyMuPDF
  - Generates embeddings with Gemini
  - Stores in ChromaDB

## 📖 Usage Guide

### Creating Your First Workflow

1. **Open Dashboard** (http://localhost:5173)
2. **Click "New Stack"** → Enter name
3. **Drag components** from left sidebar:
   - Start with User Query
   - Add Knowledge Base (optional)
   - Add LLM Engine
   - End with Output
4. **Connect nodes** by dragging from output handle to input handle
5. **Configure nodes**:
   - Knowledge Base: Upload PDF
   - LLM Engine: Add custom prompt (optional)
6. **Click "Save"** to persist
7. **Click "Build & Run"** to test

### Example Workflows

#### Simple Q&A
```
User Query → LLM Engine → Output
```

#### Knowledge-Enhanced Q&A
```
User Query → Knowledge Base → LLM Engine → Output
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Verify DATABASE_URL format
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname

# Test connection
docker-compose logs backend
```

**2. Gemini API Error**
```bash
# Check API key
echo $GOOGLE_API_KEY

# Verify quota at: https://makersuite.google.com
```

**3. ChromaDB Permission Error**
```bash
# Fix volume permissions
docker-compose down
docker volume rm $(docker volume ls -q | grep chroma)
docker-compose up --build
```

**4. Frontend Can't Connect**
```bash
# Check CORS settings in backend/app/main.py
# Verify VITE_API_URL in frontend/.env
```

### Logs

```bash
# View all logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement workflow templates
- [ ] Add more node types (Web Search, API calls)
- [ ] Export/Import workflows
- [ ] Real-time collaboration
- [ ] Workflow analytics

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with ❤️ using React, FastAPI, and Google Gemini
```