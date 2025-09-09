import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: ''
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || user?.email || '',
        company_name: userProfile.company_name || ''
      })
    }
  }, [userProfile, user])

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      toast.success('Profile updated successfully!')
      setEditing(false)
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getTierConfig = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'free':
        return {
          color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
          icon: '🆓',
          features: ['5 monthly uploads', '100MB storage', 'Basic insights']
        }
      case 'premium':
        return {
          color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
          icon: '⭐',
          features: ['100 monthly uploads', '10GB storage', 'Advanced AI insights', 'Priority support']
        }
      case 'enterprise':
        return {
          color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800',
          icon: '🏢',
          features: ['Unlimited uploads', 'Unlimited storage', 'Custom AI models', '24/7 support']
        }
      default:
        return {
          color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
          icon: '🆓',
          features: ['5 monthly uploads', '100MB storage', 'Basic insights']
        }
    }
  }

  const getTierDisplayName = (tier: string) => {
    return tier?.charAt(0).toUpperCase() + tier?.slice(1).toLowerCase() || 'Free'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    navigate('/signin')
    return null
  }

  const tierConfig = getTierConfig(userProfile?.subscription_tier || 'free')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600 mr-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${tierConfig.color}`}>
                <span className="mr-2">{tierConfig.icon}</span>
                {getTierDisplayName(userProfile?.subscription_tier || 'free')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile & Subscription */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {getInitials(userProfile?.full_name || user?.email || 'U')}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {userProfile?.full_name || 'Welcome'}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{userProfile?.email || user?.email}</p>
              
              {userProfile?.company_name && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 mb-4">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clipRule="evenodd" />
                  </svg>
                  {userProfile.company_name}
                </div>
              )}
              
              <p className="text-xs text-gray-400">
                Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </p>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">{tierConfig.icon}</span>
                {getTierDisplayName(userProfile?.subscription_tier || 'free')} Plan
              </h4>
              <div className="space-y-3">
                {tierConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              {userProfile?.subscription_tier === 'free' && (
                <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Settings & Stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      editing 
                        ? 'text-gray-600 border border-gray-300 hover:bg-gray-50' 
                        : 'text-blue-600 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {userProfile?.full_name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-500 relative">
                      {userProfile?.email || user?.email}
                      <span className="absolute right-3 top-3 text-xs bg-gray-200 px-2 py-1 rounded">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your company name (optional)"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {userProfile?.company_name || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userProfile?.storage_used_mb?.toFixed(1) || '0.0'}
                      <span className="text-sm font-normal text-gray-500 ml-1">MB</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userProfile?.monthly_uploads || 0}
                      <span className="text-sm font-normal text-gray-500 ml-1">uploads</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-2xl font-bold text-green-600">
                      {userProfile?.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your account security and data</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                      <p className="text-sm text-gray-500">Update your account password for security</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                      <p className="text-sm text-gray-500">Download all your data and uploaded files</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-600">Sign Out</h4>
                      <p className="text-sm text-gray-500">Sign out from your current session</p>
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}