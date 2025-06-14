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

    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase Edge Function secrets.' }),
        { 
          status: 500, 
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
    const systemPrompt = `You are an AI recruitment assistant helping to find and evaluate candidates for job positions. 
    
Current job search context:
- Job Title: ${chat.title}
- Job Description: ${chat.job_description || 'Not specified yet'}

Your role is to:
1. Help analyze and refine job requirements
2. Suggest candidate search strategies and criteria
3. Evaluate candidate profiles and provide matching scores
4. Provide recruitment insights and market data
5. Answer questions about candidates, hiring processes, and best practices
6. Help create compelling job descriptions
7. Suggest interview questions and evaluation criteria

Guidelines:
- Be professional, helpful, and focused on recruitment tasks
- Provide specific, actionable advice
- When discussing candidates, be objective and focus on qualifications
- Suggest realistic salary ranges based on market data
- Help identify key skills and requirements for roles
- Provide insights on hiring trends and best practices
- If job requirements are unclear, ask clarifying questions

Always maintain a helpful and professional tone while providing valuable recruitment assistance.`

    // Generate AI response using OpenAI API
    const aiResponse = await generateOpenAIResponse(openaiApiKey, systemPrompt, conversationHistory)

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

// OpenAI API integration
async function generateOpenAIResponse(apiKey: string, systemPrompt: string, conversationHistory: any[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the more cost-effective model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversationHistory
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', response.status, errorData)
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY configuration.')
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.')
      } else if (response.status === 500) {
        throw new Error('OpenAI API is currently unavailable. Please try again later.')
      } else {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API')
    }

    return data.choices[0].message.content.trim()

  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    
    // Fallback to a helpful error message for users
    if (error.message.includes('API key')) {
      return "I'm sorry, but the OpenAI API is not properly configured. Please contact your administrator to set up the API key."
    } else if (error.message.includes('rate limit')) {
      return "I'm currently experiencing high demand. Please try again in a few moments."
    } else if (error.message.includes('unavailable')) {
      return "I'm temporarily unavailable due to API issues. Please try again later."
    } else {
      return "I'm sorry, I'm having trouble processing your request right now. Please try again or rephrase your question."
    }
  }
}