// src/hooks/useAuth.ts - FIXED VERSION
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
          return
        }

        console.log('Initial session:', session?.user?.email || 'No user')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setUser(null)
          setUserProfile(null)
        }
      } finally {
        // CRITICAL: Always set loading to false
        if (mounted) {
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
            await fetchUserProfile(session.user.id)
          } else {
            setUserProfile(null)
          }
          
        } catch (error) {
          console.error('Error handling auth state change:', error)
          if (mounted) {
            setUserProfile(null)
          }
        } finally {
          // CRITICAL: Always set loading to false after auth state change
          if (mounted) {
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
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: user.user?.email || ''
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
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    userProfile,
    loading,
    signOut,
  }
}