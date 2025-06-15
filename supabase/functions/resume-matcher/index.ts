import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchResult {
  candidate_id: string
  candidate_name: string
  candidate_email: string
  match_score: number
  keyword_score: number
  experience_score: number
  education_score: number
  skills_score: number
  analysis: {
    keyword_analysis: {
      strong_matches: string[]
      partial_matches: string[]
      missing_keywords: string[]
    }
    experience_analysis: {
      strong_match_experience: string[]
      partial_match_experience: string[]
      missing_experience: string[]
    }
    education_analysis: {
      matching_qualifications: string[]
      additional_qualifications: string[]
      gaps: string[]
    }
    skills_analysis: {
      matching_technical_skills: string[]
      matching_soft_skills: string[]
      matching_tools: string[]
      missing_critical_skills: string[]
    }
    summary: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_description, chat_id } = await req.json()

    if (!job_description) {
      return new Response(
        JSON.stringify({ error: 'Job description is required' }),
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

    // Get all candidates with their extracted data
    const { data: candidates, error: candidatesError } = await supabaseClient
      .from('candidates')
      .select('id, name, email, extracted_data, status')
      .eq('status', 'completed')
      .not('extracted_data', 'is', null)

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch candidates' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ 
          matches: [],
          message: 'No candidates with processed resumes found in the database.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Analyze each candidate against the job description
    const matchResults: MatchResult[] = []

    for (const candidate of candidates) {
      try {
        const resumeText = extractResumeText(candidate.extracted_data)
        if (!resumeText) {
          console.log(`Skipping candidate ${candidate.name} - no resume text found`)
          continue
        }

        const analysis = await analyzeCandidate(openaiApiKey, job_description, resumeText, candidate)
        if (analysis && analysis.match_score >= 75) {
          matchResults.push(analysis)
        }
      } catch (error) {
        console.error(`Error analyzing candidate ${candidate.name}:`, error)
        // Continue with other candidates
      }
    }

    // Sort by match score (highest first)
    matchResults.sort((a, b) => b.match_score - a.match_score)

    return new Response(
      JSON.stringify({ 
        matches: matchResults,
        total_candidates_analyzed: candidates.length,
        qualifying_matches: matchResults.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in resume-matcher function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function extractResumeText(extractedData: any): string {
  if (!extractedData) return ''
  
  // Handle different possible formats of extracted data
  if (typeof extractedData === 'string') {
    return extractedData
  }
  
  if (extractedData.text) {
    return extractedData.text
  }
  
  if (extractedData.content) {
    return extractedData.content
  }
  
  if (extractedData.resume_text) {
    return extractedData.resume_text
  }
  
  // If it's an object, try to extract text from common fields
  const textFields = ['summary', 'experience', 'education', 'skills', 'description']
  let combinedText = ''
  
  for (const field of textFields) {
    if (extractedData[field]) {
      if (typeof extractedData[field] === 'string') {
        combinedText += extractedData[field] + ' '
      } else if (Array.isArray(extractedData[field])) {
        combinedText += extractedData[field].join(' ') + ' '
      }
    }
  }
  
  return combinedText.trim()
}

async function analyzeCandidate(
  apiKey: string, 
  jobDescription: string, 
  resumeText: string, 
  candidate: any
): Promise<MatchResult | null> {
  try {
    const systemPrompt = `You are an expert resume matching system. Analyze the provided resume against the job description using the following scoring framework:

SCORING FRAMEWORK (Total: 100 points):
1. Keyword & Contextual Match (25 points)
2. Experience Alignment (35 points) 
3. Education & Certifications (20 points)
4. Skills & Tools Relevance (20 points)

IMPORTANT: Only recommend candidates with 75% or higher match scores.

You must respond in valid JSON format with this exact structure:
{
  "match_score": number (0-100),
  "keyword_score": number (0-25),
  "experience_score": number (0-35),
  "education_score": number (0-20),
  "skills_score": number (0-20),
  "analysis": {
    "keyword_analysis": {
      "strong_matches": ["list of exact keyword matches with context"],
      "partial_matches": ["list of synonym/related matches"],
      "missing_keywords": ["list of critical missing keywords"]
    },
    "experience_analysis": {
      "strong_match_experience": ["directly relevant roles and achievements"],
      "partial_match_experience": ["transferable experience"],
      "missing_experience": ["experience gaps"]
    },
    "education_analysis": {
      "matching_qualifications": ["relevant degrees, certifications"],
      "additional_qualifications": ["bonus credentials"],
      "gaps": ["missing educational requirements"]
    },
    "skills_analysis": {
      "matching_technical_skills": ["list of matching technical skills"],
      "matching_soft_skills": ["list of matching soft skills"],
      "matching_tools": ["list of matching tools/platforms"],
      "missing_critical_skills": ["list of missing critical skills"]
    },
    "summary": "2-3 sentence overview of candidate's fit and key strengths/gaps"
  }
}

Analyze thoroughly but be realistic in scoring. Focus on quality matches over quantity.`

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
          {
            role: 'user',
            content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return null
    }

    const data = await response.json()
    const analysisResult = JSON.parse(data.choices[0].message.content)

    return {
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      match_score: analysisResult.match_score,
      keyword_score: analysisResult.keyword_score,
      experience_score: analysisResult.experience_score,
      education_score: analysisResult.education_score,
      skills_score: analysisResult.skills_score,
      analysis: analysisResult.analysis
    }

  } catch (error) {
    console.error('Error analyzing candidate:', error)
    return null
  }
}