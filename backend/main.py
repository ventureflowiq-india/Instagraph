# backend/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import tempfile
import shutil
from file_processor import FileProcessor
from supabase import create_client, Client
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Instagraph File Processing API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import configuration
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY

if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    raise ValueError("Missing required environment variables. Please check your .env file.")

# Initialize services
file_processor = FileProcessor(OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def clean_for_json(obj):
    """Recursively clean objects for JSON serialization"""
    if isinstance(obj, dict):
        return {key: clean_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(item) for item in obj]
    elif hasattr(obj, 'isoformat'):  # datetime objects
        return obj.isoformat()
    elif hasattr(obj, 'item'):  # numpy scalars
        return obj.item()
    elif hasattr(obj, 'tolist'):  # numpy arrays
        return obj.tolist()
    elif hasattr(obj, '__dict__'):  # custom objects
        return str(obj)
    else:
        return obj

# Pydantic models
class ProcessFileRequest(BaseModel):
    file_id: str
    user_id: str
    file_path: str
    file_type: str

class ProcessFileResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    return {"message": "Instagraph File Processing API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "file-processor"}

@app.post("/process-file", response_model=ProcessFileResponse)
async def process_file(request: ProcessFileRequest, background_tasks: BackgroundTasks):
    """
    Process an uploaded file and update the database with insights
    """
    try:
        logger.info(f"Processing file request for file_id: {request.file_id}")
        
        # Download file from Supabase storage
        file_content = await download_file_from_storage(request.file_path)
        if not file_content:
            raise HTTPException(status_code=404, detail="File not found in storage")
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{request.file_type}") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Process the file
            processing_result = file_processor.process_file(temp_file_path, request.file_type)
            
            # Update database with processing results
            await update_file_processing_results(request.file_id, processing_result)
            
            return ProcessFileResponse(
                success=True,
                message="File processed successfully",
                data=processing_result
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        logger.error(f"Error processing file {request.file_id}: {str(e)}")
        
        # Update database with error status
        await update_file_processing_results(request.file_id, {
            "processing_status": "error",
            "error_message": str(e),
            "processed_at": None
        })
        
        return ProcessFileResponse(
            success=False,
            message=f"Error processing file: {str(e)}",
            data=None
        )

@app.post("/process-file-async", response_model=ProcessFileResponse)
async def process_file_async(request: ProcessFileRequest, background_tasks: BackgroundTasks):
    """
    Process file asynchronously in the background
    """
    try:
        # Add to background tasks
        background_tasks.add_task(process_file_background, request)
        
        return ProcessFileResponse(
            success=True,
            message="File processing started in background",
            data=None
        )
        
    except Exception as e:
        logger.error(f"Error starting background processing for file {request.file_id}: {str(e)}")
        return ProcessFileResponse(
            success=False,
            message=f"Error starting processing: {str(e)}",
            data=None
        )

async def process_file_background(request: ProcessFileRequest):
    """
    Background task to process file
    """
    try:
        logger.info(f"Starting background processing for file_id: {request.file_id}")
        
        # Download file from Supabase storage
        file_content = await download_file_from_storage(request.file_path)
        if not file_content:
            logger.error(f"File not found in storage: {request.file_path}")
            return
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{request.file_type}") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Process the file
            processing_result = file_processor.process_file(temp_file_path, request.file_type)
            
            # Update database with processing results
            await update_file_processing_results(request.file_id, processing_result)
            
            logger.info(f"Successfully processed file {request.file_id}")
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        logger.error(f"Error in background processing for file {request.file_id}: {str(e)}")
        
        # Update database with error status
        await update_file_processing_results(request.file_id, {
            "processing_status": "error",
            "error_message": str(e),
            "processed_at": None
        })

async def download_file_from_storage(file_path: str) -> Optional[bytes]:
    """
    Download file from Supabase storage
    """
    try:
        response = supabase.storage.from_('user-uploads').download(file_path)
        return response
    except Exception as e:
        logger.error(f"Error downloading file from storage: {str(e)}")
        return None

async def update_file_processing_results(file_id: str, processing_result: Dict[str, Any]):
    """
    Update the uploaded_files table with processing results
    """
    try:
        # Set processed_at to current time in proper format
        processed_at = datetime.utcnow().isoformat() + '+00:00'
            
        update_data = {
            "row_count": processing_result.get("row_count", 0),
            "column_count": processing_result.get("column_count", 0),
            "data_preview": clean_for_json(processing_result.get("data_preview", {})),
            "metadata": clean_for_json({
                **processing_result.get("metadata", {}),
                "ai_insights": processing_result.get("ai_insights", {}),
                "data_types": processing_result.get("data_types", {}),
                "missing_values": processing_result.get("missing_values", {}),
                "numeric_summary": processing_result.get("numeric_summary", {}),
                "processing_status": processing_result.get("processing_status", "completed")
            }),
            "processed_at": processed_at
        }
        
        # Update the database
        result = supabase.table('uploaded_files').update(update_data).eq('id', file_id).execute()
        
        if result.data:
            logger.info(f"Successfully updated file {file_id} with processing results")
        else:
            logger.error(f"Failed to update file {file_id} in database")
            
    except Exception as e:
        logger.error(f"Error updating file processing results for {file_id}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)