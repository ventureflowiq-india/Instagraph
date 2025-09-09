// src/pages/YourFiles.tsx
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import UserProfileDropdown from '../components/UserProfileDropdown'
import UploadedFilesList from '../components/UploadedFilesList'

export default function YourFiles() {
  const { user, userProfile } = useAuth()

  // Create fallback profile if user exists but no profile
  const fallbackProfile = user && !userProfile ? {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    subscription_tier: 'free' as const,
    is_active: true,
    storage_used_mb: 0,
    monthly_uploads: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null
  } : null

  // Use fallback profile if no real profile exists
  const displayProfile = userProfile || fallbackProfile

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a 
                href="/" 
                className="cursor-pointer"
              >
                <img 
                  src="/InstagraphLogo.png" 
                  alt="Instagraph Logo" 
                  className="w-30 h-auto"
                  style={{ width: '120px', height: 'auto' }}
                />
              </a>
            </div>
            <div className="flex items-center">
              <UserProfileDropdown 
                userEmail={displayProfile?.full_name || user?.email || ''} 
                subscriptionTier={displayProfile?.subscription_tier || 'free'} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Files
              </h1>
              <p className="text-lg text-gray-600">
                Manage and view all your uploaded files
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">
              {displayProfile?.monthly_uploads || 0}
            </div>
            <div className="text-sm text-gray-600">Total Uploads</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {displayProfile?.storage_used_mb || 0} MB
            </div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Dashboards Created</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">
              {displayProfile?.subscription_tier?.toUpperCase() || 'FREE'}
            </div>
            <div className="text-sm text-gray-600">Subscription Tier</div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              All Files
            </h2>
            <p className="text-gray-600">
              View, manage, and analyze your uploaded data files
            </p>
          </div>
          
          <UploadedFilesList />
        </div>
      </main>
    </div>
  )
}
