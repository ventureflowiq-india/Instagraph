// src/hooks/useUploadedFiles.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface UploadedFile {
  id: string
  user_id: string
  file_name: string
  original_file_name: string
  file_size_mb: number
  file_type: string
  storage_path: string
  upload_status: string
  created_at: string
  processed_at: string | null
  metadata: any
  row_count: number | null
  column_count: number | null
  data_preview: any
}

export function useUploadedFiles() {
  const { user } = useAuth()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    if (!user) {
      setFiles([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setFiles(data || [])
    } catch (err: any) {
      console.error('Error fetching uploaded files:', err)
      setError(err.message || 'Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  const addFile = (file: UploadedFile) => {
    setFiles(prev => [file, ...prev])
  }

  const updateFile = (fileId: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    )
  }

  const deleteFile = async (fileId: string) => {
    if (!user) return

    try {
      // Get file info first
      const file = files.find(f => f.id === fileId)
      if (!file) return

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-uploads')
        .remove([file.storage_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id)

      if (dbError) {
        throw dbError
      }

      // Update local state
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (err: any) {
      console.error('Error deleting file:', err)
      setError(err.message || 'Failed to delete file')
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [user])

  return {
    files,
    loading,
    error,
    fetchFiles,
    addFile,
    updateFile,
    deleteFile
  }
}
