import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://nhattlsxliahryrnjqmn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYXR0bHN4bGlhaHJ5cm5qcW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzIxOTUsImV4cCI6MjA2NTMwODE5NX0.DnwD2x7ik8ldk1N1MEvRfzx881FQvN1JlMrPmy3FKIc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)