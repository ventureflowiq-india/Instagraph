// src/components/ProfileSetup.tsx
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ProfileSetup() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const createProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        subscription_tier: 'free',
        is_active: true,
        storage_used_mb: 0,
        monthly_uploads: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('Profile created successfully!')
      window.location.reload() // Refresh to update the auth state
    } catch (error: any) {
      console.error('Error creating profile:', error)
      toast.error('Error creating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (userProfile) {
    return null // Profile already exists
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Instagraph!
          </h2>
          <p className="text-gray-600 text-sm">
            We need to set up your profile to get started.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-2">Account Details:</h3>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Name:</strong> {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Not provided'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Provider:</strong> {user?.app_metadata?.provider || 'email'}
          </p>
        </div>

        <button
          onClick={createProfile}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Setting up your profile...
            </div>
          ) : (
            'Complete Profile Setup'
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          This will create your user profile and set up your subscription tier.
        </p>
      </div>
    </div>
  )
}