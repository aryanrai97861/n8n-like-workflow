from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.workflow import ExecutionRequest, ExecutionResponse
from app.services.workflow import execute_workflow
from app.services.vector_store import add_document
import fitz # PyMuPDF
import shutil
import os

router = APIRouter()

@router.post("/execute", response_model=ExecutionResponse)
async def execute_workflow_endpoint(request: ExecutionRequest):
    return await execute_workflow(request.workflow, request.user_query)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract text
        text = ""
        doc = fitz.open(temp_path)
        for page in doc:
            text += page.get_text()
            
        # Embed and Store
        add_document(text, file.filename)
        
        # Cleanup
        os.remove(temp_path)
        
        return {"message": f"Document {file.filename} processed successfully", "text_length": len(text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
