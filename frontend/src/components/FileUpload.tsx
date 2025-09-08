// src/components/FileUpload.tsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useUploadedFiles } from '../hooks/useUploadedFiles'
import { fileProcessingService } from '../services/fileProcessingService'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onUploadComplete?: (file: any) => void
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { user } = useAuth()
  const { addFile } = useUploadedFiles()
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Supported file types
  const supportedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-excel.sheet.binary', // .xlsb
    'text/csv', // .csv
  ]

  const supportedExtensions = ['.xlsx', '.xls', '.xlsb', '.csv']

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!supportedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload Excel (.xlsx, .xls, .xlsb) or CSV files.')
      return false
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('File size too large. Please upload files smaller than 10MB.')
      return false
    }

    return true
  }

  const getFileTypeFromMime = (mimeType: string): string => {
    switch (mimeType) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'xlsx'
      case 'application/vnd.ms-excel':
        return 'xls'
      case 'application/vnd.ms-excel.sheet.binary':
        return 'xlsb'
      case 'text/csv':
        return 'csv'
      default:
        return 'unknown'
    }
  }

  const uploadFile = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload files')
      return
    }

    if (!validateFile(file)) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName)

      // Save file metadata to database with complete record matching your schema
      const mappedFileType = getFileTypeFromMime(file.type)
      console.log('Original MIME type:', file.type)
      console.log('Mapped file type:', mappedFileType)
      
      const fileRecord = {
        user_id: user.id,
        file_name: fileName, // Use the generated filename
        original_file_name: file.name, // Keep original name
        file_size_mb: Math.round((file.size / (1024 * 1024)) * 100) / 100, // Convert to MB
        file_type: mappedFileType, // Convert MIME type to simple type
        storage_path: fileName, // Path in storage bucket
        upload_status: 'uploaded',
        // Note: processed_at, row_count, column_count, data_preview will be null initially
        metadata: {
          file_url: urlData.publicUrl,
          file_extension: fileExt,
          mime_type: file.type, // Store original MIME type in metadata
          upload_timestamp: new Date().toISOString()
        }
      }

      const { data: insertedFile, error: dbError } = await supabase
        .from('uploaded_files')
        .insert(fileRecord)
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        toast.error('File uploaded but failed to save metadata')
        return
      }

      setUploadProgress(100)
      toast.success('File uploaded successfully!')
      
      // Add to the uploaded files list with the complete record from database
      if (insertedFile) {
        const uploadedFile = insertedFile
        addFile(uploadedFile)
        
        // Start file processing in the background
        toast.loading('Processing file...', { id: 'processing' })
        
        try {
          console.log('Starting file processing for:', uploadedFile.id)
          const processingResult = await fileProcessingService.processFileAsync({
            file_id: uploadedFile.id,
            user_id: user.id,
            file_path: uploadedFile.storage_path,
            file_type: uploadedFile.file_type
          })
          
          console.log('Processing result:', processingResult)
          
          if (processingResult.success) {
            toast.success('File processed successfully!', { id: 'processing' })
            // Navigate to DataViewer to show the processed data
            navigate(`/data/${uploadedFile.id}`)
          } else {
            toast.error(`Processing failed: ${processingResult.message}`, { id: 'processing' })
          }
        } catch (error) {
          console.error('Error processing file:', error)
          toast.error('Error processing file - make sure backend is running', { id: 'processing' })
        }
        
        if (onUploadComplete) {
          onUploadComplete(uploadedFile)
        }
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    uploadFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedExtensions.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {isUploading ? 'Uploading...' : 'Drop your files here'}
          </h4>
          
          <p className="text-gray-500 mb-4">
            {isUploading ? 'Please wait while we upload your file' : 'or click to browse'}
          </p>
          
          {!isUploading && (
            <button 
              type="button"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Choose Files
            </button>
          )}
          
          {isUploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          <p className="text-xs text-gray-400 mt-4">
            Supports .xlsx, .xls, .xlsb, .csv files up to 10MB
          </p>
        </div>
      </div>
    </div>
  )
}