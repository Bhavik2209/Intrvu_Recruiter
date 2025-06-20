import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        console.log('Initial session:', session?.user?.email || 'No user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch profile and then set loading to false
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        // Always set loading to false after initial session check
        setLoading(false)
        
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
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
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Fetch profile but don't wait for it to complete
            fetchUserProfile(session.user.id)
          } else {
            setUserProfile(null)
          }
          
          // Set loading to false immediately after auth state change
          setLoading(false)
          
        } catch (error) {
          console.error('Error handling auth state change:', error)
          if (mounted) {
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
        setUserProfile(null)
        return
      }

      // If no profile exists, create one
      if (!data) {
        console.log('No user profile found, creating basic profile for user:', userId)
        
        try {
          const { data: user } = await supabase.auth.getUser()
          const userName = user.user?.user_metadata?.name || ''
          
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: user.user?.email || '',
              name: userName
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            setUserProfile(null)
          } else {
            console.log('Created new profile:', newProfile)
            setUserProfile(newProfile)
          }
        } catch (insertError) {
          console.error('Error creating user profile:', insertError)
          setUserProfile(null)
        }
        return
      }

      console.log('User profile loaded:', data)
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      
      // Clear local state immediately
      setUser(null)
      setUserProfile(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        // Even if there's an error, we've cleared local state
        // The auth state change listener will handle the rest
      } else {
        console.log('Successfully signed out')
      }
      
      // Force redirect to sign in page
      window.location.href = '/signin'
      
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force redirect even if there's an error
      window.location.href = '/signin'
    }
  }

  return {
    user,
    userProfile,
    loading,
    signOut,
  }
}