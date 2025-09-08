// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

// Debug environment variables
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl)
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
} else {
  console.log('Supabase URL value:', supabaseUrl)
  console.log('Supabase Anon Key value:', supabaseAnonKey.substring(0, 20) + '...')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types matching your actual schema
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  subscription_tier: string // Changed from union type to string to match schema
  company_name: string | null
  created_at: string
  updated_at: string
  last_login: string | null
  is_active: boolean
  storage_used_mb: number
  monthly_uploads: number
  subscription_start_date: string | null
  subscription_end_date: string | null
}

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
  metadata: Record<string, any>
  row_count: number | null
  column_count: number | null
  data_preview: Record<string, any>
}

export interface Dashboard {
  id: string
  user_id: string
  file_id: string
  title: string
  description: string | null
  dashboard_config: Record<string, any>
  chart_types: string[]
  insights: Record<string, any>
  is_public: boolean
  share_token: string | null
  created_at: string
  updated_at: string
  last_viewed: string | null
  view_count: number
}

export interface ProcessingLog {
  id: string
  file_id: string
  user_id: string
  processing_step: string
  status: string
  message: string | null
  processing_time_seconds: number | null
  created_at: string
  metadata: Record<string, any>
}

export interface SubscriptionLimit {
  tier: string
  max_file_size_mb: number
  max_monthly_uploads: number
  max_storage_mb: number
  max_dashboards: number
  ai_insights_enabled: boolean
  export_formats: string[]
  collaboration_enabled: boolean
  api_access: boolean
  priority_support: boolean
}

export interface UserActivityLog {
  id: string
  user_id: string
  activity_type: string
  activity_details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Storage bucket names based on your folder structure
export const STORAGE_BUCKETS = {
  USER_UPLOADS: 'user-uploads',
  PROCESSED_DATA: 'processed-data', 
  EXPORTS: 'exports'
} as const