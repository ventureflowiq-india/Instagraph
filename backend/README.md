# Instagraph File Processing Backend

This is the backend service for Instagraph that handles file processing, data analysis, and AI-powered insights generation.

## Features

- **File Processing**: Supports Excel (.xlsx, .xls, .xlsb) and CSV files
- **Data Analysis**: Extracts row/column counts, data types, and statistics
- **AI Insights**: Uses OpenAI GPT-4 to generate intelligent data insights
- **Data Preview**: Creates sample data previews for visualization
- **Quality Scoring**: Calculates data quality scores
- **Chart Suggestions**: Recommends appropriate chart types

## Setup

1. **Activate Virtual Environment**:
   ```bash
   cd backend
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   - The `.env` file is automatically created with your API keys
   - Update if needed with your actual keys

4. **Start the Server**:
   ```bash
   python start.py
   ```

   Or manually:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Health Check
- `GET /` - API status
- `GET /health` - Health check

### File Processing
- `POST /process-file` - Process file synchronously
- `POST /process-file-async` - Process file in background

## File Processing Pipeline

1. **File Upload** → Supabase Storage
2. **File Download** → Temporary local file
3. **Data Extraction** → Pandas DataFrame
4. **Basic Analysis** → Row/column counts, data types, statistics
5. **AI Analysis** → OpenAI GPT-4 insights and recommendations
6. **Database Update** → Store results in `uploaded_files` table

## AI Features

- **Data Summary**: Intelligent description of the dataset
- **Pattern Recognition**: Identifies trends and patterns
- **Quality Assessment**: Evaluates data completeness and quality
- **Chart Recommendations**: Suggests appropriate visualizations
- **Key Insights**: Extracts actionable insights

## Dependencies

- **FastAPI**: Web framework
- **Pandas**: Data manipulation
- **OpenAI**: AI analysis
- **Supabase**: Database and storage
- **OpenPyXL**: Excel file support
- **PyXLSB**: Excel Binary support

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
API_HOST=0.0.0.0
API_PORT=8000
```

## Error Handling

The service includes comprehensive error handling:
- File format validation
- Processing error recovery
- Database update failures
- AI service timeouts
- Storage access issues

## Logging

All operations are logged with appropriate levels:
- INFO: Normal operations
- ERROR: Processing failures
- DEBUG: Detailed debugging information
