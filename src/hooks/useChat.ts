import { useState, useEffect, useCallback } from 'react'
import { supabase, chatOperations, messageOperations, Chat, ChatMessage } from '../lib/supabase'
import { useResumeMatching } from './useResumeMatching'

export const useChat = (userId: string | undefined) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [parsingFile, setParsingFile] = useState(false)
  const [hasAnnouncedMatches, setHasAnnouncedMatches] = useState(false)
  
  const { analyzeResumes, results: matchingResults, loading: matchingLoading } = useResumeMatching()

  // Reset match announcement state when active chat changes
  useEffect(() => {
    setHasAnnouncedMatches(false)
  }, [activeChatId])

  // Handle post-matching announcements
  useEffect(() => {
    const announceMatches = async () => {
      if (!activeChatId || !userId || hasAnnouncedMatches) return
      
      if (matchingResults && 
          matchingResults.matches && 
          matchingResults.matches.length > 0) {
        
        try {
          // Add the announcement messages
          await messageOperations.addMessage(
            activeChatId,
            userId,
            "We have found some candidates that are best match to your job posting.",
            'ai'
          )
          
          await messageOperations.addMessage(
            activeChatId,
            userId,
            "I can further help with refining the candidate search.",
            'ai'
          )
          
          setHasAnnouncedMatches(true)
        } catch (error) {
          console.error('Error adding match announcement messages:', error)
        }
      }
    }

    announceMatches()
  }, [matchingResults, activeChatId, userId, hasAnnouncedMatches])

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const userChats = await chatOperations.getUserChats(userId)
      setChats(userChats)
      
      // If no chats exist, automatically create one for new users
      if (userChats.length === 0) {
        console.log('No chats found for user, creating initial chat...')
        const newChat = await chatOperations.createChat(userId, 'New Job Search')
        setChats([newChat])
        setActiveChatId(newChat.id)
      } else {
        // If chats exist but no active chat, select the first one
        if (!activeChatId) {
          setActiveChatId(userChats[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, activeChatId])

  // Load messages for active chat
  const loadMessages = useCallback(async () => {
    if (!activeChatId) {
      setMessages([])
      return
    }

    try {
      const chatMessages = await messageOperations.getChatMessages(activeChatId)
      setMessages(chatMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [activeChatId])

  // Create new chat
  const createNewChat = useCallback(async (title: string = 'New Job Search') => {
    if (!userId) return null

    try {
      const newChat = await chatOperations.createChat(userId, title)
      setChats(prev => [newChat, ...prev])
      setActiveChatId(newChat.id)
      return newChat
    } catch (error) {
      console.error('Error creating chat:', error)
      return null
    }
  }, [userId])

  // Update chat title
  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    try {
      const updatedChat = await chatOperations.updateChat(chatId, { title })
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ))
    } catch (error) {
      console.error('Error updating chat title:', error)
    }
  }, [])

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await chatOperations.deleteChat(chatId)
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      
      // If deleted chat was active, select another one or create a new one
      if (activeChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId)
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id)
        } else {
          // If no chats remain, create a new one automatically
          const newChat = await createNewChat('New Job Search')
          if (newChat) {
            setActiveChatId(newChat.id)
          } else {
            setActiveChatId(null)
          }
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }, [activeChatId, chats, createNewChat])

  // Upload and process job description file
  const uploadJobDescriptionFile = useCallback(async (file: File): Promise<{ success: boolean; error?: string }> => {
    if (!activeChatId || !userId) {
      return { success: false, error: 'No active chat or user session' }
    }

    setUploadingFile(true)
    
    try {
      // Convert file to base64 using FileReader to avoid call stack overflow
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Extract base64 part from data URL (remove "data:type;base64," prefix)
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      // Call the text extraction Edge Function
      setParsingFile(true)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/job-description-extractor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          file_content_base64: base64String,
          file_type: file.type,
          file_name: file.name,
          chat_id: activeChatId,
          user_id: userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract text from file')
      }

      // Send the extracted text as a user message
      const extractedText = result.extracted_text
      if (extractedText && extractedText.trim()) {
        await sendMessage(`Job Description from ${file.name}:\n\n${extractedText}`)
      } else {
        throw new Error('No text could be extracted from the file')
      }

      return { success: true }

    } catch (error) {
      console.error('Error uploading job description file:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process file'
      }
    } finally {
      setUploadingFile(false)
      setParsingFile(false)
    }
  }, [activeChatId, userId])

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeChatId || !userId || !content.trim()) return

    setSendingMessage(true)
    
    try {
      // Add user message to database
      const userMessage = await messageOperations.addMessage(
        activeChatId,
        userId,
        content.trim(),
        'user'
      )

      // Add to local state immediately
      setMessages(prev => [...prev, userMessage])

      // Call AI function to generate response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          chatId: activeChatId,
          message: content.trim(),
          userId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const { 
        message: aiMessage, 
        trigger_resume_matching, 
        job_description,
        title_updated,
        new_title,
        is_first_job_description
      } = await response.json()
      
      // Add AI message to local state
      setMessages(prev => [...prev, aiMessage])

      // Update chat title in local state if it was updated
      if (title_updated && new_title) {
        setChats(prev => prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, title: new_title }
            : chat
        ))
      }

      // Trigger resume matching if requested
      if (trigger_resume_matching && job_description) {
        console.log('Triggering resume matching with job description:', job_description)
        await analyzeResumes(job_description, activeChatId)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      // You might want to show an error message to the user here
    } finally {
      setSendingMessage(false)
    }
  }, [activeChatId, userId, analyzeResumes])

  // Set up real-time subscription for active chat
  useEffect(() => {
    if (!activeChatId) return

    const subscription = messageOperations.subscribeToChat(activeChatId, (newMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [activeChatId])

  // Load chats when userId changes
  useEffect(() => {
    loadChats()
  }, [loadChats])

  // Load messages when active chat changes
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    loading,
    sendingMessage,
    uploadingFile,
    parsingFile,
    createNewChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    uploadJobDescriptionFile,
    matchingResults,
    matchingLoading,
  }
}