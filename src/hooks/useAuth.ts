import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial session...')
        setError(null)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setError(`Authentication error: ${error.message}`)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        console.log('Initial session:', session?.user?.email || 'No user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch profile and handle any errors
          try {
            await fetchUserProfile(session.user.id)
          } catch (profileError) {
            console.error('Error fetching profile during session init:', profileError)
            // Don't set error state here as user is still authenticated
          }
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
        
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setError(`Failed to initialize authentication: ${error instanceof Error ? error.message : 'Unknown error'}`)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.email || 'No user')

        try {
          setError(null)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Fetch profile but handle errors gracefully
            try {
              await fetchUserProfile(session.user.id)
            } catch (profileError) {
              console.error('Error fetching profile during auth change:', profileError)
              // Don't set error state here as user is still authenticated
            }
          } else {
            setUserProfile(null)
          }
          
          setLoading(false)
          
        } catch (error) {
          console.error('Error handling auth state change:', error)
          if (mounted) {
            setError(`Authentication state error: ${error instanceof Error ? error.message : 'Unknown error'}`)
            setUserProfile(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Supabase connection test failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
        throw new Error(`Failed to fetch user profile: ${error.message}`)
      }

      // If no profile exists, create one
      if (!data) {
        console.log('No user profile found, creating basic profile for user:', userId)
        
        try {
          const { data: user } = await supabase.auth.getUser()
          if (!user.user?.email) {
            throw new Error('No email found for user')
          }

          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: user.user.email
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            throw new Error(`Failed to create user profile: ${insertError.message}`)
          }

          console.log('Created new profile:', newProfile)
          setUserProfile(newProfile)
        } catch (insertError) {
          console.error('Error creating user profile:', insertError)
          throw insertError
        }
        return
      }

      console.log('User profile loaded:', data)
      setUserProfile(data)
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      setUserProfile(null)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      setError(null)
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
      setError(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    user,
    userProfile,
    loading,
    error,
    signOut,
  }
}