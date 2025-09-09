// src/components/UploadedFilesList.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUploadedFiles, UploadedFile } from '../hooks/useUploadedFiles'
// Using native JavaScript date formatting instead of date-fns

interface UploadedFilesListProps {
  limit?: number
  showViewMore?: boolean
}

export default function UploadedFilesList({ limit, showViewMore = false }: UploadedFilesListProps) {
  const { files, loading, error, deleteFile, fetchFiles } = useUploadedFiles()
  const navigate = useNavigate()
  
  // Refresh files every 5 seconds to show processing updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [fetchFiles])

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`
    }
    return `${sizeInMB.toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string) => {
    if (['xlsx', 'xls', 'xlsb'].includes(fileType)) {
      return (
        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
          </svg>
        </div>
      )
    }
    if (fileType === 'csv') {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'processed':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading files: {error}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
        <p className="text-gray-500">Upload your first Excel or CSV file to get started</p>
      </div>
    )
  }

  const displayFiles = limit ? files.slice(0, limit) : files
  const hasMoreFiles = limit && files.length > limit

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Files ({files.length})
      </h3>
      
      <div className="space-y-3">
        {displayFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => navigate(`/data/${file.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.original_file_name}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.file_size_mb)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(file.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    {file.row_count ? (
                      <span className="text-xs text-gray-500">
                        {file.row_count.toLocaleString()} rows
                      </span>
                    ) : file.upload_status === 'uploaded' ? (
                      <span className="text-xs text-yellow-600">
                        Processing...
                      </span>
                    ) : null}
                    {file.column_count && (
                      <span className="text-xs text-gray-500">
                        {file.column_count} columns
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.upload_status)}`}>
                  {file.upload_status}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file.id)
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMoreFiles && showViewMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/files')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View More ({files.length - limit} more)
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
