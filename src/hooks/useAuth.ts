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
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
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

        console.log('Auth state changed:', event, session?.user?.email)

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
        console.warn('No user profile found, creating basic profile for user:', userId)
        
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
            setUserProfile(newProfile)
          }
        } catch (insertError) {
          console.error('Error creating user profile:', insertError)
          setUserProfile(null)
        }
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
    }
  }

  const signOut = async () => {
    try {
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