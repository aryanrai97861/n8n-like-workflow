# No-Code Intelligent Workflow Builder

A no-code/low-code web application for building intelligent workflows with React Flow, FastAPI, Gemini, and ChromaDB.

## 🚀 One-Click Setup (Docker)

This project is fully dockerized for easy deployment.

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key
- Neon (PostgreSQL) connection string (or any Postgres DB)
- SerpAPI Key (optional, for web search)

### Running the App

1. **Clone the repository** (if not already done).

2. **Configure Environment Variables**:
   Edit `backend/.env` with your API keys:
   ```env
   DATABASE_URL=postgresql://user:password@host/dbname
   GOOGLE_API_KEY=your_gemini_key
   SERPAPI_API_KEY=your_serpapi_key
   CHROMA_DB_PATH=/app/chroma_db
   ```
   (Alternatively, pass them to `docker-compose` environment)

3. **Start the Stack**:
   ```bash
   docker-compose up --build
   ```

4. **Access the Application**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🏗 Architecture

- **Frontend**: React + Vite + TailwindCSS. Uses **React Flow** for the drag-and-drop builder.
- **Backend**: FastAPI. Handles workflow execution, LLM interaction (Gemini), and Vector Search (ChromaDB).
- **Database**: PostgreSQL (Neon) for potential persistence (configured via SQLAlchemy).
- **Vector Store**: ChromaDB (Embedded/Persistent) for document embeddings.

## ✨ Features

- **Drag & Drop Builder**: Visually design flows with User Query, Knowledge Base, LLM Engine, and Output nodes.
- **Intelligent Knowledge Base**: Upload PDFs, extract text using PyMuPDF, and embed with Gemini for retrieval.
- **LLM Integration**: Seamlessly connect user queries and retrieved context to Gemini Pro.
- **Chat Interface**: interactive chat that executes the defined workflow.

## 🛠 Project Structure

```
/
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # Endpoints
│   │   ├── core/       # Config & DB
│   │   ├── schemas/    # Pydantic Models
│   │   └── services/   # Business Logic (LLM, Workflow, Vectors)
│   └── Dockerfile
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Builder, Chat, Sidebar
│   │   └── nodes/      # Custom Nodes (future)
│   └── Dockerfile
└── docker-compose.yml  # Orchestration
```
