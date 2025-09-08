// src/hooks/useAuth.tsx
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Memoize the createUserProfile function
  const createUserProfile = useCallback(async (user: User, fullName?: string) => {
    try {
      console.log('Creating profile for user:', user.id)
      
      // First check if profile already exists with a quick timeout
      const { data: existingProfile } = await Promise.race([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        new Promise((resolve) => setTimeout(() => resolve({ data: null }), 1000))
      ]) as any
      
      if (existingProfile) {
        console.log('Profile already exists, using existing profile:', existingProfile)
        setUserProfile(existingProfile)
        return existingProfile
      }
      
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: fullName || user.user_metadata?.full_name || user.user_metadata?.name || null,
        subscription_tier: 'free' as const,
        is_active: true,
        storage_used_mb: 0,
        monthly_uploads: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating new profile...')
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        
        // Handle duplicate key error
        if (error.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (existingProfile) {
            setUserProfile(existingProfile)
            return existingProfile
          }
        }
        
        return null
      }

      console.log('User profile created successfully:', data)
      setUserProfile(data)
      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  }, [])

  // Create fallback profile function
  const createFallbackProfile = useCallback((user: User): UserProfile => {
    return {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      subscription_tier: 'free' as const,
      company_name: null,
      is_active: true,
      storage_used_mb: 0,
      monthly_uploads: 0,
      last_login: null,
      subscription_start_date: null,
      subscription_end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }, [])

  // Separate profile fetching function that doesn't block auth
  const fetchUserProfileAsync = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await Promise.race([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 1500) // Further reduced timeout
        )
      ]) as any

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will try to create one in background')
          return null
        }
        console.warn('Profile fetch error:', error)
        return null
      }

      console.log('Profile fetched successfully:', data)
      setUserProfile(data)
      return data
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.log('Profile fetch timed out, using fallback profile')
      } else {
        console.warn('Profile fetch failed (using fallback):', error)
      }
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        
        console.log('Session retrieved:', session ? 'Found user' : 'No session')
        setSession(session)
        setUser(session?.user ?? null)
        
        // Set loading to false immediately after auth is complete
        setLoading(false)
        
        // Fetch profile asynchronously after auth is complete
        if (session?.user) {
          fetchUserProfileAsync(session.user.id).then(profile => {
            if (!profile && mounted) {
              // Create fallback profile if database fetch fails
              const fallback = createFallbackProfile(session.user)
              setUserProfile(fallback)
              
              // Try to create real profile in background
              createUserProfile(session.user).then(createdProfile => {
                if (createdProfile) {
                  console.log('Profile created successfully in background')
                  setUserProfile(createdProfile)
                }
              }).catch(error => {
                if (error.code === '23505' || error.message?.includes('duplicate key')) {
                  console.log('Profile already exists, using fallback')
                } else {
                  console.error('Profile creation failed:', error)
                }
              })
            }
          })
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, setting up profile...')
          
          // Set fallback profile immediately
          const fallback = createFallbackProfile(session.user)
          setUserProfile(fallback)
          
          // Try to fetch real profile in background
          fetchUserProfileAsync(session.user.id).then(profile => {
            if (profile) {
              console.log('Real profile fetched successfully')
            } else {
              // Try to create profile if it doesn't exist
              createUserProfile(session.user).then(createdProfile => {
                if (createdProfile) {
                  console.log('Profile created successfully')
                  setUserProfile(createdProfile)
                }
              }).catch(error => {
                if (error.code === '23505' || error.message?.includes('duplicate key')) {
                  console.log('Profile already exists, using fallback')
                } else {
                  console.error('Profile creation failed:', error)
                }
              })
            }
          }).catch(error => {
            console.log('Profile fetch failed, using fallback:', error.message)
          })
          
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setUserProfile(null)
        }
        
        // Always reset loading state after auth changes
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Removed dependencies to prevent infinite loops

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message || 'Error signing in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user && !data.session) {
        toast.success('Check your email to confirm your account!')
      } else if (data.user && data.session) {
        // Set fallback profile immediately
        const fallback = createFallbackProfile(data.user)
        setUserProfile(fallback)
        
        // Create real profile in background
        createUserProfile(data.user, fullName).catch(console.error)
        toast.success('Account created successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error signing up')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      toast.error(error.message || 'Error signing in with Google')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Error signing out')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sent!')
    } catch (error: any) {
      toast.error(error.message || 'Error sending reset email')
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile')
      throw error
    }
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}