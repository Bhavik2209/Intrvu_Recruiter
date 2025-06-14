import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { chatId, message, userId } = await req.json()

    if (!chatId || !message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get chat history for context
    const { data: messages, error: messagesError } = await supabaseClient
      .from('chat_messages')
      .select('content, type, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch chat history' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get chat details for job description context
    const { data: chat, error: chatError } = await supabaseClient
      .from('chats')
      .select('title, job_description')
      .eq('id', chatId)
      .single()

    if (chatError) {
      console.error('Error fetching chat:', chatError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch chat details' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare conversation context
    const conversationHistory = messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message
    })

    // System prompt for recruitment assistant
    const systemPrompt = `You are an AI recruitment assistant helping to find and evaluate candidates. 
    
Current job search context:
- Job Title: ${chat.title}
- Job Description: ${chat.job_description || 'Not specified'}

Your role is to:
1. Help analyze job requirements
2. Suggest candidate search strategies
3. Evaluate candidate profiles
4. Provide recruitment insights
5. Answer questions about candidates and hiring

Be helpful, professional, and focused on recruitment tasks. Provide specific, actionable advice.`

    // Make OpenAI API call (using a mock response for now)
    // In production, you would use the actual OpenAI API
    const aiResponse = await generateAIResponse(systemPrompt, conversationHistory)

    // Store AI response in database
    const { data: aiMessage, error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        content: aiResponse,
        type: 'ai'
      })
      .select()
      .single()

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError)
      return new Response(
        JSON.stringify({ error: 'Failed to store AI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in chat-ai function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Mock AI response function - replace with actual OpenAI API call
async function generateAIResponse(systemPrompt: string, conversationHistory: any[]): Promise<string> {
  // This is a mock implementation
  // In production, you would call the OpenAI API here
  
  const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || ''
  
  // Simple mock responses based on keywords
  if (lastMessage.toLowerCase().includes('react') || lastMessage.toLowerCase().includes('developer')) {
    return `I understand you're looking for React developers. Based on your requirements, I can help you find candidates with the right skills. 

Here are some key areas to focus on:
- React experience (hooks, state management)
- TypeScript proficiency
- Testing frameworks (Jest, React Testing Library)
- Modern development practices

Would you like me to search our candidate database for profiles matching these criteria?`
  }
  
  if (lastMessage.toLowerCase().includes('candidate') || lastMessage.toLowerCase().includes('profile')) {
    return `I can help you evaluate candidates based on your job requirements. Let me analyze the available profiles and provide you with the best matches.

I'll consider factors like:
- Technical skills alignment
- Experience level
- Previous project relevance
- Cultural fit indicators

Would you like me to show you the top matching candidates?`
  }
  
  if (lastMessage.toLowerCase().includes('salary') || lastMessage.toLowerCase().includes('budget')) {
    return `Salary expectations are an important factor in recruitment. Based on current market data:

- Senior React developers typically range from $120k-$180k
- Location significantly impacts compensation
- Remote work options can expand your candidate pool
- Consider total compensation including benefits

What's your budget range for this position?`
  }
  
  // Default response
  return `Thank you for your message. I'm here to help you with your recruitment needs. I can assist with:

- Analyzing job requirements
- Finding matching candidates
- Evaluating candidate profiles
- Providing market insights
- Answering hiring questions

How can I help you find the perfect candidate for your role?`
}