import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIResponse {
  message_type: 'job_description' | 'chat_message' | 'search_refinement' | 'resume_analysis'
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

    // Enhanced system prompt for job description detection and recruitment assistance
    const systemPrompt = `You are an AI recruitment assistant helping to find and evaluate candidates for job positions. 

Current job search context:
- Job Title: ${chat.title}
- Current Job Description: ${chat.job_description || 'Not specified yet'}

CRITICAL INSTRUCTIONS:
1. You MUST respond in valid JSON format with this exact structure:
{
  "message_type": "job_description" | "chat_message" | "search_refinement" | "resume_analysis",
  "extracted_job_description": "string (only if message_type is job_description)",
  "extracted_job_title": "string (only if message_type is job_description - extract the role/position name)",
  "ai_response_text": "your conversational response to the user",
  "trigger_resume_matching": boolean (true only when user explicitly requests candidate search)
}

2. MESSAGE TYPE CLASSIFICATION:
- "job_description": When the user provides a complete job posting, job requirements, or detailed role description
- "search_refinement": When the user is refining existing search criteria, asking to modify requirements, or requesting specific candidate filters
- "resume_analysis": When the user explicitly asks to analyze resumes, find matches, or see candidate results
- "chat_message": For general questions, conversations, or requests that don't involve job requirements

3. JOB DESCRIPTION DETECTION:
Look for these indicators of a job description:
- Job titles or role names
- Required skills, technologies, or qualifications
- Years of experience requirements
- Responsibilities or duties
- Company information or job benefits
- Salary information
- Educational requirements
- Location or remote work details
- Structured job posting format

4. JOB TITLE EXTRACTION:
When message_type is "job_description", you MUST extract the job title/role name:
- Look for explicit job titles (e.g., "Senior Frontend Developer", "Product Manager", "Data Scientist")
- If multiple roles mentioned, pick the primary/main role
- If no explicit title, infer from context (e.g., "React developer with 5 years experience" → "React Developer")
- Keep titles concise but descriptive (max 50 characters)
- Examples of good titles: "Senior React Developer", "Full Stack Engineer", "DevOps Engineer", "Product Manager"
- If you cannot determine a specific role, use "Software Developer" or "Technical Role" as fallback

5. RESUME MATCHING TRIGGERS:
ONLY set "trigger_resume_matching" to true when the user EXPLICITLY requests candidate search with phrases like:
- "find candidates", "search for candidates", "show me candidates"
- "analyze resumes", "match resumes", "find matches"
- "who matches this job", "search our database"
- "look for candidates", "find people", "search talent"
- "run the search", "start matching", "find qualified candidates"

NEVER trigger resume matching automatically when a job description is provided. Only trigger when explicitly requested.

6. EXTRACTED JOB DESCRIPTION:
- If message_type is "job_description", extract and clean up the job requirements
- Include all relevant details: skills, experience, responsibilities, qualifications
- Format it clearly and professionally
- If the user provides an unstructured description, structure it appropriately

7. AI RESPONSE GUIDELINES:
- You are assisting a hiring manager or sourcing specialist - NEVER respond from a candidate perspective
- Be professional, helpful, and focused on recruitment tasks from the employer's viewpoint
- When a job description is saved, acknowledge it and offer to search for candidates when ready
- Provide specific, actionable advice about candidate search strategies
- Ask clarifying questions if job requirements are unclear
- Suggest realistic salary ranges and market insights when relevant
- Help identify key skills and must-have vs nice-to-have requirements
- Provide insights on hiring trends and best practices
- Help create compelling job descriptions and postings

8. WORKFLOW GUIDANCE:
When a job description is provided:
- Save it and acknowledge receipt
- Extract the job title for the chat title
- Summarize the key requirements
- Ask if they want to search for candidates now or refine requirements first
- Offer to help with additional job details if needed

When user wants to search:
- Confirm the job description is complete
- Set trigger_resume_matching to true
- Explain what the search will analyze

9. IMPORTANT RESTRICTIONS:
- NEVER offer assistance with interview preparation from a candidate's perspective
- NEVER provide advice on how candidates should prepare for interviews
- NEVER suggest ways for candidates to improve their resumes or applications
- Focus exclusively on helping employers find, evaluate, and hire candidates
- If asked about interview preparation, redirect to employer-focused interview strategies instead

10. RESUME MATCHING CONTEXT:
When appropriate, mention that the system can:
- Analyze resumes against job requirements using a 4-factor scoring system
- Provide detailed match scores (75%+ threshold for recommendations)
- Show keyword matches, experience alignment, education fit, and skills relevance
- Rank candidates from highest to lowest match percentage
- Provide detailed analysis of why each candidate matches or doesn't match

REMEMBER: Always respond in valid JSON format. Do not include any text outside the JSON structure.`

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
      if (!['job_description', 'chat_message', 'search_refinement', 'resume_analysis'].includes(parsedResponse.message_type)) {
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
        job_description: chat.job_description || parsedResponse.extracted_job_description
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

// OpenAI API integration with enhanced job description detection
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
        temperature: 0.3,
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
        message_type: 'chat_message',
        ai_response_text: "I'm sorry, I'm having trouble processing your request right now. Please try again or rephrase your question.",
        trigger_resume_matching: false
      })
    }
  }
}