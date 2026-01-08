import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions
from app.core.config import settings
import os

# Get the absolute path for ChromaDB - bypass settings to avoid Git Bash path mangling
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(os.path.dirname(_current_dir))
CHROMA_DB_PATH = os.path.join(_backend_dir, "chroma_db")

# Initialize Gemini Embeddings
# Note: ChromaDB's default Google support might differ, so we can wrap it or use a custom function.
# For simplicity, we'll manually embed using genai and pass to Chroma.

genai.configure(api_key=settings.GOOGLE_API_KEY)

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        # gemini-embedding-001 or models/embedding-001
        model = 'models/embedding-001'
        embeddings = []
        for text in input:
             result = genai.embed_content(model=model, content=text, task_type="retrieval_document")
             embeddings.append(result['embedding'])
        return embeddings

# Lazy initialization to avoid path issues on Windows
_client = None
_collection = None

def get_collection():
    global _client, _collection
    if _collection is None:
        # Use our computed absolute path
        print(f"ChromaDB Path: {CHROMA_DB_PATH}")
        os.makedirs(CHROMA_DB_PATH, exist_ok=True)
        _client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        embedding_fn = GeminiEmbeddingFunction()
        _collection = _client.get_or_create_collection(name="knowledge_base", embedding_function=embedding_fn)
    return _collection

def add_document(text: str, filename: str):
    """Add a document to the vector store with chunking support"""
    try:
        collection = get_collection()
        # Simple chunking - split into smaller parts for better retrieval
        chunk_size = 1000
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        
        # Add each chunk with unique ID
        for i, chunk in enumerate(chunks):
            doc_id = f"{filename}_{i}"
            collection.add(
                documents=[chunk],
                metadatas=[{"source": filename, "chunk": i}],
                ids=[doc_id]
            )
        
        print(f"Added {len(chunks)} chunks from {filename}")
        return filename
    except Exception as e:
        print(f"Error adding document: {e}")
        raise e

def query_documents(query: str, n_results: int = 3) -> str:
    collection = get_collection()
    # Need to switch task_type for query if using strict API, but generic works
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    if results['documents']:
        return "\n".join(results['documents'][0])
    return ""
