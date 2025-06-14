import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
}

// Create client with additional options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

// Test connection on initialization
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.warn('Supabase connection test failed:', error.message)
    } else {
      console.log('Supabase connection successful')
    }
  } catch (error) {
    console.warn('Supabase connection test error:', error)
  }
}

// Test connection but don't block initialization
testConnection()

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  resume_url?: string
  resume_filename?: string
  extracted_data?: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  job_description?: string
  status: 'active' | 'archived' | 'completed'
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  chat_id: string
  user_id: string
  content: string
  type: 'user' | 'ai'
  created_at: string
  updated_at: string
}

// Helper functions for chat operations
export const chatOperations = {
  // Create a new chat
  async createChat(userId: string, title: string, jobDescription?: string): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        title,
        job_description: jobDescription,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all chats for a user
  async getUserChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get a specific chat
  async getChat(chatId: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Update chat title or job description
  async updateChat(chatId: string, updates: Partial<Pick<Chat, 'title' | 'job_description' | 'status'>>): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .update(updates)
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a chat (and all its messages due to CASCADE)
  async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (error) throw error
  },
}

// Helper functions for chat message operations
export const messageOperations = {
  // Add a message to a chat
  async addMessage(chatId: string, userId: string, content: string, type: 'user' | 'ai' = 'user'): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        content,
        type,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all messages for a chat
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Update a message
  async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content })
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  },

  // Subscribe to real-time message updates for a chat
  subscribeToChat(chatId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage)
        }
      )
      .subscribe()
  },
}