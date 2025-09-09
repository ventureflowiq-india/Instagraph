# backend/file_processor.py
import pandas as pd
import openpyxl
import xlrd
import json
import os
from typing import Dict, Any, Optional, Tuple
from openai import OpenAI
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileProcessor:
    def __init__(self, openai_api_key: str):
        self.openai_client = OpenAI(api_key=openai_api_key)
        
    def process_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """
        Process uploaded file and extract data insights
        """
        try:
            logger.info(f"Processing file: {file_path} of type: {file_type}")
            
            # Read the file based on type
            df = self._read_file(file_path, file_type)
            
            if df is None or df.empty:
                return self._create_error_result("File is empty or could not be read")
            
            # Extract basic statistics
            stats = self._extract_basic_stats(df)
            
            # Generate data preview
            data_preview = self._generate_data_preview(df)
            
            # Generate AI insights
            ai_insights = self._generate_ai_insights(df, file_type)
            
            # Combine all results
            result = {
                **stats,
                "data_preview": data_preview,
                "ai_insights": ai_insights,
            "processing_status": "completed",
            "processed_at": datetime.utcnow().isoformat() + "Z" + "Z"
            }
            
            logger.info(f"Successfully processed file: {file_path}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            return self._create_error_result(f"Processing failed: {str(e)}")
    
    def _read_file(self, file_path: str, file_type: str) -> Optional[pd.DataFrame]:
        """Read file based on its type"""
        try:
            if file_type == 'csv':
                return pd.read_csv(file_path)
            elif file_type == 'xlsx':
                return pd.read_excel(file_path, engine='openpyxl')
            elif file_type == 'xls':
                return pd.read_excel(file_path, engine='xlrd')
            elif file_type == 'xlsb':
                return pd.read_excel(file_path, engine='pyxlsb')
            else:
                logger.error(f"Unsupported file type: {file_type}")
                return None
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {str(e)}")
            return None
    
    def _extract_basic_stats(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract basic statistics from the dataframe"""
        try:
            stats = {
                "row_count": len(df),
                "column_count": len(df.columns),
                "file_size_mb": 0,  # Will be updated by caller
                "data_types": df.dtypes.astype(str).to_dict(),
                "missing_values": df.isnull().sum().to_dict(),
                "numeric_columns": df.select_dtypes(include=['number']).columns.tolist(),
                "text_columns": df.select_dtypes(include=['object']).columns.tolist(),
                "date_columns": df.select_dtypes(include=['datetime']).columns.tolist()
            }
            
            # Add summary statistics for numeric columns
            if stats["numeric_columns"]:
                stats["numeric_summary"] = df[stats["numeric_columns"]].describe().to_dict()
            
            return stats
        except Exception as e:
            logger.error(f"Error extracting basic stats: {str(e)}")
            return {"row_count": 0, "column_count": 0}
    
    def _generate_data_preview(self, df: pd.DataFrame, max_rows: int = 5) -> Dict[str, Any]:
        """Generate a preview of the data"""
        try:
            # Create a copy of the dataframe for formatting
            df_formatted = df.copy()
            
            # Format datetime columns to replace 'T' with '/'
            for col in df_formatted.columns:
                if df_formatted[col].dtype.name.startswith('datetime'):
                    df_formatted[col] = df_formatted[col].dt.strftime('%Y-%m-%d/%H:%M:%S')
            
            # Get first few rows with formatted data
            preview_data = df_formatted.head(max_rows).to_dict('records')
            
            # Get column information
            columns_info = []
            for col in df.columns:
                # Format sample values for datetime columns
                sample_values = df[col].dropna().head(3).tolist()
                if df[col].dtype.name.startswith('datetime'):
                    sample_values = [pd.to_datetime(val).strftime('%Y-%m-%d/%H:%M:%S') for val in sample_values]
                
                col_info = {
                    "name": col,
                    "type": str(df[col].dtype),
                    "sample_values": sample_values,
                    "null_count": df[col].isnull().sum(),
                    "unique_count": df[col].nunique(),
                    "unique_values": df[col].dropna().unique().tolist()  # Add all unique values for filtering
                }
                columns_info.append(col_info)
            
            return {
                "preview_data": preview_data,
                "columns_info": columns_info,
                "total_rows": len(df),
                "total_columns": len(df.columns)
            }
        except Exception as e:
            logger.error(f"Error generating data preview: {str(e)}")
            return {"preview_data": [], "columns_info": []}
    
    def _generate_ai_insights(self, df: pd.DataFrame, file_type: str) -> Dict[str, Any]:
        """Generate AI-powered insights about the data"""
        try:
            # Prepare data summary for AI
            data_summary = self._prepare_data_summary_for_ai(df)
            
            # Create AI prompt
            prompt = self._create_ai_prompt(data_summary, file_type)
            
            # Get AI response
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a data analyst expert. Analyze the provided data and give insights about patterns, trends, and recommendations for visualization."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            
            # Parse AI response and structure it
            insights = {
                "summary": ai_response,
                "suggested_charts": self._extract_chart_suggestions(ai_response),
                "data_quality_score": self._calculate_data_quality_score(df),
                "key_insights": self._extract_key_insights(ai_response)
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {str(e)}")
            return {
                "summary": "AI analysis temporarily unavailable",
                "suggested_charts": [],
                "data_quality_score": 0,
                "key_insights": []
            }
    
    def _prepare_data_summary_for_ai(self, df: pd.DataFrame) -> str:
        """Prepare a summary of the data for AI analysis"""
        summary = f"""
        Dataset Overview:
        - Rows: {len(df)}
        - Columns: {len(df.columns)}
        - Column names: {list(df.columns)}
        - Data types: {df.dtypes.astype(str).to_dict()}
        - Missing values: {df.isnull().sum().to_dict()}
        """
        
        # Add sample data
        if len(df) > 0:
            summary += f"\nSample data (first 3 rows):\n{df.head(3).to_string()}"
        
        # Add numeric column statistics
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            summary += f"\nNumeric column statistics:\n{df[numeric_cols].describe().to_string()}"
        
        return summary
    
    def _create_ai_prompt(self, data_summary: str, file_type: str) -> str:
        """Create prompt for AI analysis"""
        return f"""
        Please analyze this {file_type.upper()} dataset and provide insights:
        
        {data_summary}
        
        Please provide:
        1. A brief summary of what this data represents and its business context
        2. Key patterns, trends, or anomalies you notice
        3. Data quality assessment and potential issues
        4. Recommended chart types for visualization based on the data structure
        5. Business insights and actionable recommendations
        6. Identify if this appears to be HR, Operations, Product, Inventory, Sales, or other business data
        
        Consider the business context and provide domain-specific insights where applicable.
        Keep the response concise and actionable.
        """
    
    def _extract_chart_suggestions(self, ai_response: str) -> list:
        """Extract chart suggestions from AI response"""
        chart_types = []
        response_lower = ai_response.lower()
        
        if 'bar' in response_lower or 'column' in response_lower:
            chart_types.append('bar')
        if 'line' in response_lower or 'trend' in response_lower:
            chart_types.append('line')
        if 'pie' in response_lower or 'donut' in response_lower:
            chart_types.append('pie')
        if 'scatter' in response_lower or 'correlation' in response_lower:
            chart_types.append('scatter')
        if 'histogram' in response_lower or 'distribution' in response_lower:
            chart_types.append('histogram')
        if 'heatmap' in response_lower or 'matrix' in response_lower:
            chart_types.append('heatmap')
        
        return chart_types if chart_types else ['bar', 'line']
    
    def _calculate_data_quality_score(self, df: pd.DataFrame) -> float:
        """Calculate a data quality score (0-100)"""
        try:
            total_cells = len(df) * len(df.columns)
            null_cells = df.isnull().sum().sum()
            
            # Base score
            completeness_score = ((total_cells - null_cells) / total_cells) * 100
            
            # Bonus for having numeric columns
            numeric_bonus = min(len(df.select_dtypes(include=['number']).columns) * 5, 20)
            
            # Penalty for too many duplicates
            duplicate_penalty = min(len(df[df.duplicated()]) * 2, 20)
            
            final_score = max(0, min(100, completeness_score + numeric_bonus - duplicate_penalty))
            return round(final_score, 1)
            
        except Exception as e:
            logger.error(f"Error calculating data quality score: {str(e)}")
            return 50.0
    
    def _extract_key_insights(self, ai_response: str) -> list:
        """Extract key insights from AI response"""
        # Simple extraction - look for bullet points or numbered lists
        lines = ai_response.split('\n')
        insights = []
        
        for line in lines:
            line = line.strip()
            if line.startswith(('•', '-', '*', '1.', '2.', '3.', '4.', '5.')):
                insight = line.lstrip('•-*123456789. ').strip()
                if insight:
                    insights.append(insight)
        
        return insights[:5]  # Return top 5 insights
    
    def _create_error_result(self, error_message: str) -> Dict[str, Any]:
        """Create error result"""
        return {
            "row_count": 0,
            "column_count": 0,
            "data_preview": {},
            "ai_insights": {
                "summary": f"Error: {error_message}",
                "suggested_charts": [],
                "data_quality_score": 0,
                "key_insights": []
            },
            "processing_status": "error",
            "error_message": error_message,
            "processed_at": datetime.utcnow().isoformat() + "Z"
        }
