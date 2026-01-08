import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions
from app.core.config import settings

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

client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
embedding_fn = GeminiEmbeddingFunction()
collection = client.get_or_create_collection(name="knowledge_base", embedding_function=embedding_fn)

def add_document(text: str, filename: str):
    # Chunking logic could go here. For now, simple text.
    collection.add(
        documents=[text],
        metadatas=[{"source": filename}],
        ids=[filename] # Simple ID for now
    )

def query_documents(query: str, n_results: int = 3) -> str:
    # Need to switch task_type for query if using strict API, but generic works
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    if results['documents']:
        return "\n".join(results['documents'][0])
    return ""
