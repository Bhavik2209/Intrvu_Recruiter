import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIResponse {
  message_type: 'job_description' | 'chat_message' | 'search_refinement' | 'resume_analysis' | 'restricted'
  extracted_job_description?: string
  extracted_job_title?: string
  ai_response_text: string
  trigger_resume_matching?: boolean
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
      .limit(20)

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

    // Enhanced system prompt with strict restrictions
    const systemPrompt = `You are IntrvuRecruiter AI, a specialized recruitment assistant designed EXCLUSIVELY for candidate search and hiring-related tasks. You MUST only assist with recruitment activities from an employer's perspective.

Current job search context:
- Job Title: ${chat.title}
- Current Job Description: ${chat.job_description || 'Not specified yet'}

CRITICAL RESTRICTIONS - YOU MUST REFUSE ALL NON-RECRUITMENT REQUESTS:
❌ NEVER provide general programming help, coding tutorials, or technical assistance unrelated to hiring
❌ NEVER help with personal projects, homework, or non-recruitment tasks
❌ NEVER provide career advice from a candidate's perspective (resume writing, interview prep for candidates)
❌ NEVER assist with general business questions unrelated to hiring
❌ NEVER help with data analysis, research, or tasks outside recruitment scope
❌ NEVER provide information about topics unrelated to candidate search and hiring

✅ ONLY ASSIST WITH:
- Job description creation and analysis
- Candidate search requirements definition
- Resume matching and evaluation
- Hiring process optimization
- Recruitment strategy and best practices
- Candidate assessment criteria
- Talent acquisition insights

RESPONSE FORMAT - You MUST respond in valid JSON format:
{
  "message_type": "job_description" | "chat_message" | "search_refinement" | "resume_analysis" | "restricted",
  "extracted_job_description": "string (only if message_type is job_description)",
  "extracted_job_title": "string (only if message_type is job_description)",
  "ai_response_text": "your response to the user",
  "trigger_resume_matching": boolean (true only when user explicitly requests candidate search)
}

MESSAGE TYPE CLASSIFICATION:
- "restricted": Use this for ANY request that is not directly related to candidate search, hiring, or recruitment
- "job_description": When user provides complete job posting or role requirements
- "search_refinement": When user refines existing search criteria or job requirements
- "resume_analysis": When user explicitly asks to analyze resumes or find candidates
- "chat_message": For valid recruitment-related conversations only

RESTRICTION RESPONSES:
If the user asks about anything outside recruitment scope, use message_type "restricted" and respond with:
"I'm IntrvuRecruiter AI, specialized exclusively in candidate search and hiring. I can only assist with:

• Creating and analyzing job descriptions
• Finding and evaluating candidates
• Recruitment strategy and best practices
• Candidate assessment criteria

Please ask me about your hiring needs, job requirements, or candidate search instead."

JOB DESCRIPTION DETECTION:
Look for these recruitment indicators:
- Job titles, role names, position requirements
- Required skills, technologies, qualifications
- Years of experience requirements
- Job responsibilities and duties
- Educational requirements
- Salary ranges and benefits
- Company information for hiring

JOB TITLE EXTRACTION:
When message_type is "job_description", extract the primary role:
- Look for explicit job titles (e.g., "Senior Frontend Developer", "Product Manager")
- Infer from context if no explicit title
- Keep titles concise but descriptive (max 50 characters)
- Use "Software Developer" as fallback if unclear

RESUME MATCHING TRIGGERS:
ONLY set "trigger_resume_matching" to true for explicit candidate search requests:
- "find candidates", "search for candidates", "show me candidates"
- "analyze resumes", "match resumes", "find matches"
- "who matches this job", "search our database"
- "look for candidates", "find people", "search talent"

RECRUITMENT-FOCUSED RESPONSES:
- Always maintain employer perspective
- Provide actionable hiring insights
- Suggest realistic requirements and expectations
- Help optimize job descriptions for better candidate attraction
- Offer market insights on skills and salary ranges
- Guide users through effective candidate evaluation

REMEMBER: 
1. ALWAYS respond in valid JSON format
2. REFUSE all non-recruitment requests with message_type "restricted"
3. Focus exclusively on helping employers find and hire candidates
4. Never assist with candidate-side activities (resume writing, interview prep for job seekers)
5. Only trigger resume matching when explicitly requested`

    // Generate AI response using OpenAI API
    const aiResponseData = await generateOpenAIResponse(openaiApiKey, systemPrompt, conversationHistory)

    // Parse the AI response to extract structured data
    let parsedResponse: AIResponse
    try {
      parsedResponse = JSON.parse(aiResponseData)
      
      // Validate the response structure
      if (!parsedResponse.message_type || !parsedResponse.ai_response_text) {
        throw new Error('Invalid response structure')
      }
      
      // Validate message_type
      if (!['job_description', 'chat_message', 'search_refinement', 'resume_analysis', 'restricted'].includes(parsedResponse.message_type)) {
        throw new Error('Invalid message_type')
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw AI response:', aiResponseData)
      
      // Fallback to treating as regular chat message
      parsedResponse = {
        message_type: 'chat_message',
        ai_response_text: aiResponseData || "I'm sorry, I had trouble processing your request. Could you please rephrase it?",
        trigger_resume_matching: false
      }
    }

    // Update job description and title in chat if detected
    let titleUpdated = false
    if (parsedResponse.message_type === 'job_description') {
      try {
        const updateData: any = {
          updated_at: new Date().toISOString()
        }

        // Update job description if provided
        if (parsedResponse.extracted_job_description) {
          updateData.job_description = parsedResponse.extracted_job_description
        }

        // Update title if job title was extracted
        if (parsedResponse.extracted_job_title) {
          updateData.title = parsedResponse.extracted_job_title
          titleUpdated = true
        }

        const { error: updateError } = await supabaseClient
          .from('chats')
          .update(updateData)
          .eq('id', chatId)

        if (updateError) {
          console.error('Error updating chat:', updateError)
        } else {
          console.log('Successfully updated chat for:', chatId)
          if (titleUpdated) {
            console.log('Updated title to:', parsedResponse.extracted_job_title)
          }
        }
      } catch (updateError) {
        console.error('Error updating chat:', updateError)
      }
    }

    // Store AI response in database
    const { data: aiMessage, error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        content: parsedResponse.ai_response_text,
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
      JSON.stringify({ 
        message: aiMessage,
        job_description_updated: parsedResponse.message_type === 'job_description' && parsedResponse.extracted_job_description ? true : false,
        title_updated: titleUpdated,
        new_title: parsedResponse.extracted_job_title || null,
        trigger_resume_matching: parsedResponse.trigger_resume_matching || false,
        job_description: chat.job_description || parsedResponse.extracted_job_description,
        message_type: parsedResponse.message_type
      }),
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

// OpenAI API integration with enhanced restrictions
async function generateOpenAIResponse(apiKey: string, systemPrompt: string, conversationHistory: any[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversationHistory
        ],
        max_tokens: 1500,
        temperature: 0.2, // Lower temperature for more consistent restriction enforcement
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { type: "json_object" }
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
    
    // Fallback responses based on error type
    if (error.message.includes('API key')) {
      return JSON.stringify({
        message_type: 'chat_message',
        ai_response_text: "I'm sorry, but the OpenAI API is not properly configured. Please contact your administrator to set up the API key.",
        trigger_resume_matching: false
      })
    } else if (error.message.includes('rate limit')) {
      return JSON.stringify({
        message_type: 'chat_message',
        ai_response_text: "I'm currently experiencing high demand. Please try again in a few moments.",
        trigger_resume_matching: false
      })
    } else if (error.message.includes('unavailable')) {
      return JSON.stringify({
        message_type: 'chat_message',
        ai_response_text: "I'm temporarily unavailable due to API issues. Please try again later.",
        trigger_resume_matching: false
      })
    } else {
      return JSON.stringify({
        message_type: 'restricted',
        ai_response_text: "I'm IntrvuRecruiter AI, specialized exclusively in candidate search and hiring. I can only assist with:\n\n• Creating and analyzing job descriptions\n• Finding and evaluating candidates\n• Recruitment strategy and best practices\n• Candidate assessment criteria\n\nPlease ask me about your hiring needs, job requirements, or candidate search instead.",
        trigger_resume_matching: false
      })
    }
  }
}