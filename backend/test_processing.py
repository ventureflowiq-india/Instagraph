#!/usr/bin/env python3
# backend/test_processing.py
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from file_processor import FileProcessor
import pandas as pd

def test_file_processor():
    """Test the file processor with sample data"""
    
    # Create sample CSV data
    sample_data = {
        'Name': ['John', 'Jane', 'Bob', 'Alice', 'Charlie'],
        'Age': [25, 30, 35, 28, 32],
        'Salary': [50000, 60000, 70000, 55000, 65000],
        'Department': ['IT', 'HR', 'IT', 'Finance', 'IT']
    }
    
    df = pd.DataFrame(sample_data)
    
    # Save to temporary CSV file
    temp_file = backend_dir / "test_sample.csv"
    df.to_csv(temp_file, index=False)
    
    try:
        # Initialize processor (you'll need to set your OpenAI API key)
        openai_key = os.getenv("OPENAI_API_KEY", "test-key")
        processor = FileProcessor(openai_key)
        
        # Process the file
        result = processor.process_file(str(temp_file), "csv")
        
        print("Processing Result:")
        print(f"Row Count: {result.get('row_count', 0)}")
        print(f"Column Count: {result.get('column_count', 0)}")
        print(f"Processing Status: {result.get('processing_status', 'unknown')}")
        
        if 'data_preview' in result:
            print(f"Data Preview: {result['data_preview']}")
        
        if 'ai_insights' in result:
            print(f"AI Insights: {result['ai_insights']}")
            
    except Exception as e:
        print(f"Error testing processor: {e}")
    finally:
        # Clean up
        if temp_file.exists():
            temp_file.unlink()

if __name__ == "__main__":
    test_file_processor()
