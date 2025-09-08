// src/services/fileProcessingService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

export interface ProcessFileRequest {
  file_id: string
  user_id: string
  file_path: string
  file_type: string
}

export interface ProcessFileResponse {
  success: boolean
  message: string
  data?: any
}

export interface ProcessingResult {
  row_count: number
  column_count: number
  data_preview: any
  ai_insights: {
    summary: string
    suggested_charts: string[]
    data_quality_score: number
    key_insights: string[]
  }
  processing_status: string
  processed_at?: string
  error_message?: string
}

class FileProcessingService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  async processFile(request: ProcessFileRequest): Promise<ProcessFileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/process-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error processing file:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async processFileAsync(request: ProcessFileRequest): Promise<ProcessFileResponse> {
    try {
      console.log('Sending processing request:', request)
      
      const response = await fetch(`${this.baseUrl}/process-file-async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      console.log('Processing response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Processing error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log('Processing response data:', data)
      return data
    } catch (error) {
      console.error('Error starting file processing:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async checkProcessingStatus(fileId: string): Promise<ProcessingResult | null> {
    try {
      // This would typically be a separate endpoint to check status
      // For now, we'll return null and let the frontend handle it
      return null
    } catch (error) {
      console.error('Error checking processing status:', error)
      return null
    }
  }
}

export const fileProcessingService = new FileProcessingService()
