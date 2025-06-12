import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setUserProfile(null);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (mounted) {
            setUserProfile(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows gracefully

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
        return;
      }

      // If no profile exists, create a basic one
      if (!data) {
        console.warn('No user profile found, creating basic profile for user:', userId);
        
        try {
          const { data: user } = await supabase.auth.getUser();
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: user.user?.email || '',
              role: 'recruiter'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            setUserProfile(null);
          } else {
            setUserProfile(newProfile);
          }
        } catch (insertError) {
          console.error('Error creating user profile:', insertError);
          setUserProfile(null);
        }
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    userProfile,
    loading,
    signOut,
  };
};