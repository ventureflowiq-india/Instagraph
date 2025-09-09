// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import ProfileSetup from '../components/ProfileSetup'
import FileUpload from '../components/FileUpload'
import UserProfileDropdown from '../components/UserProfileDropdown'
import UploadedFilesList from '../components/UploadedFilesList'

export default function Dashboard() {
  const { user, userProfile, signOut, loading } = useAuth()
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  console.log('Dashboard render:', { loading, hasUser: !!user, hasProfile: !!userProfile })

  // Set timeout after 3 seconds of loading (reduced from 5s)
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true)
      }, 3000)
      
      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
      return undefined
    }
  }, [loading])

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
    last_login: null // Add the missing property
  } : null

  // Use fallback profile if no real profile exists
  const displayProfile = userProfile || fallbackProfile

  // Show loading while auth is initializing (with timeout handling)
  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-xs text-gray-400 mt-2">
            User: {user ? 'Found' : 'Loading...'} | Profile: {userProfile ? 'Found' : 'Loading...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This should only take a moment...
          </p>
        </div>
      </div>
    )
  }

  // Show timeout message if loading takes too long
  if (loading && loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-5xl mb-4">⏱️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Taking longer than expected</h2>
          <p className="text-gray-600 mb-6">
            The service might be slow. Let's proceed with what we have.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoadingTimeout(false)
                // Force proceed with current state
                if (user) {
                  const fallback = {
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
                  }
                  // This will be handled by the component logic
                }
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Debug: User: {user ? 'Found' : 'Not found'} | Profile: {userProfile ? 'Found' : 'Not found'}
          </p>
        </div>
      </div>
    )
  }

  // If no user at all, this shouldn't happen due to ProtectedRoute, but just in case
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No user found</h2>
          <p className="text-gray-600">Please sign in again.</p>
        </div>
      </div>
    )
  }

  // Show profile setup if user exists but no profile in database
  if (!displayProfile) {
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
                  userEmail={user.email || ''} 
                  subscriptionTier={'free'} 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              AI-Powered Dashboards from Your Data in Seconds.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Using temporary profile. Your data will be saved once the database connection is restored.
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Monthly Uploads</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-green-600">0 MB</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Dashboards Created</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-2xl font-bold text-orange-600">FREE</div>
              <div className="text-sm text-gray-600">Subscription Tier</div>
            </div>
          </div>

          {/* Side by Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Upload File Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Upload Your Data
                </h3>
                <p className="text-gray-600 mb-8">
                  Upload Excel (.xlsx, .xls, .xlsb) or CSV files to create AI-powered dashboards
                </p>
                
                <FileUpload onUploadComplete={(file) => {
                  console.log('File uploaded successfully:', file)
                  // File will automatically redirect to DataViewer after processing
                }} />
              </div>
            </div>

            {/* Your Files Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your Files
                </h3>
                <p className="text-gray-600">
                  Manage and view your uploaded files
                </p>
              </div>
              
              {/* Uploaded Files List */}
              <div className="mb-6">
                <UploadedFilesList limit={3} showViewMore={true} />
              </div>
            </div>
          </div>

        </main>
      </div>
    )
  }

  // Show dashboard if everything is ready
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI-Powered Dashboards from Your Data in Seconds.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">
              {displayProfile?.monthly_uploads || 0}
            </div>
            <div className="text-sm text-gray-600">Monthly Uploads</div>
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

        {/* Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload File Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Your Data
              </h3>
              <p className="text-gray-600 mb-8">
                Upload Excel (.xlsx, .xls, .xlsb) or CSV files to create AI-powered dashboards
              </p>
              
              <FileUpload onUploadComplete={(file) => {
                console.log('File uploaded successfully:', file)
                // File will automatically redirect to DataViewer after processing
              }} />
            </div>
          </div>

          {/* Your Files Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Your Files
              </h3>
              <p className="text-gray-600">
                Manage and view your uploaded files
              </p>
            </div>
            
            {/* Uploaded Files List */}
            <div className="mb-6">
              <UploadedFilesList limit={3} showViewMore={true} />
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}