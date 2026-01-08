from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Workflow Builder API")

# Configure CORS - Allow frontend access
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative frontend port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Add environment variable for custom origins
if custom_origin := os.getenv("FRONTEND_URL"):
    origins.append(custom_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.endpoints import router
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Workflow Builder API is running", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
