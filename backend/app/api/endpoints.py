from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db, Base, engine
from app.models.workflow import WorkflowModel
from app.schemas.workflow import WorkflowCreate, WorkflowDB, ExecutionRequest, ExecutionResponse
from app.services.workflow import execute_workflow
from app.services.vector_store import add_document
from fastapi import UploadFile, File
import fitz
import shutil
import os

# Create Tables (Simple migration)
Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.post("/execute", response_model=ExecutionResponse)
async def execute_workflow_endpoint(request: ExecutionRequest):
    return await execute_workflow(request.workflow, request.user_query)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        text = ""
        doc = fitz.open(temp_path)
        for page in doc:
            text += page.get_text()
            
        add_document(text, file.filename)
        os.remove(temp_path)
        
        return {"message": f"Document {file.filename} processed successfully", "text_length": len(text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CRUD Endpoints

@router.post("/workflows", response_model=WorkflowDB)
def create_workflow(workflow: WorkflowCreate, db: Session = Depends(get_db)):
    db_workflow = WorkflowModel(
        name=workflow.name, 
        description=workflow.description,
        definition=workflow.definition.model_dump()
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.get("/workflows", response_model=List[WorkflowDB])
def read_workflows(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    workflows = db.query(WorkflowModel).offset(skip).limit(limit).all()
    return workflows

@router.get("/workflows/{workflow_id}", response_model=WorkflowDB)
def read_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/workflows/{workflow_id}", response_model=WorkflowDB)
def update_workflow(workflow_id: int, workflow: WorkflowCreate, db: Session = Depends(get_db)):
    db_workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    db_workflow.name = workflow.name
    db_workflow.description = workflow.description
    db_workflow.definition = workflow.definition.model_dump()
    
    db.commit()
    db.refresh(db_workflow)
    return db_workflow
