import { useState, useEffect, useCallback } from 'react'
import { supabase, chatOperations, messageOperations, Chat, ChatMessage } from '../lib/supabase'
import { useResumeMatching } from './useResumeMatching'

export const useChat = (userId: string | undefined) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  
  const { analyzeResumes, results: matchingResults, loading: matchingLoading } = useResumeMatching()

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const userChats = await chatOperations.getUserChats(userId)
      setChats(userChats)
      
      // If no active chat and chats exist, select the first one
      if (!activeChatId && userChats.length > 0) {
        setActiveChatId(userChats[0].id)
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
      
      // If deleted chat was active, select another one
      if (activeChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId)
        setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null)
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }, [activeChatId, chats])

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
        new_title
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
    createNewChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    matchingResults,
    matchingLoading,
  }
}