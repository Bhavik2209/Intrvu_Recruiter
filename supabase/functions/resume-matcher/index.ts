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
          total_candidates_analyzed: 0,
          qualifying_matches: 0,
          message: 'No candidates with processed resumes found in the database.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Starting analysis of ${candidates.length} candidates`)
    const startTime = Date.now()

    // Step 1: Extract keywords from job description for preliminary filtering
    const jobKeywords = extractKeywords(job_description)
    console.log(`Extracted ${jobKeywords.length} keywords from job description`)

    // Step 2: Preliminary keyword filtering
    const filteredCandidates = candidates.filter(candidate => {
      const resumeText = extractResumeText(candidate.extracted_data)
      if (!resumeText) return false
      
      const keywordScore = calculateKeywordScore(resumeText, jobKeywords)
      // Only proceed with candidates that have at least 15% keyword match (lowered from 20%)
      return keywordScore >= 0.15
    })

    console.log(`Filtered to ${filteredCandidates.length} candidates after keyword screening`)

    if (filteredCandidates.length === 0) {
      return new Response(
        JSON.stringify({ 
          matches: [],
          total_candidates_analyzed: candidates.length,
          qualifying_matches: 0,
          message: 'No candidates passed the initial keyword screening.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 3: Parallel AI analysis with concurrency control
    const BATCH_SIZE = 5 // Process 5 candidates at a time to avoid rate limits
    const matchResults: MatchResult[] = []

    for (let i = 0; i < filteredCandidates.length; i += BATCH_SIZE) {
      const batch = filteredCandidates.slice(i, i + BATCH_SIZE)
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filteredCandidates.length / BATCH_SIZE)}`)
      
      // Process batch in parallel
      const batchPromises = batch.map(candidate => 
        analyzeCandidateWithRetry(openaiApiKey, job_description, candidate, 2)
      )
      
      const batchResults = await Promise.allSettled(batchPromises)
      
      // Collect successful results - Changed threshold from 75% to 50%
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value && result.value.match_score >= 50) {
          matchResults.push(result.value)
        } else if (result.status === 'rejected') {
          console.error(`Failed to analyze candidate ${batch[index].name}:`, result.reason)
        }
      })

      // Small delay between batches to be respectful to API limits
      if (i + BATCH_SIZE < filteredCandidates.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Sort by match score (highest first)
    matchResults.sort((a, b) => b.match_score - a.match_score)

    const endTime = Date.now()
    const processingTime = (endTime - startTime) / 1000

    console.log(`Analysis completed in ${processingTime}s. Found ${matchResults.length} qualifying matches.`)

    return new Response(
      JSON.stringify({ 
        matches: matchResults,
        total_candidates_analyzed: candidates.length,
        candidates_after_filtering: filteredCandidates.length,
        qualifying_matches: matchResults.length,
        processing_time_seconds: processingTime
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

function extractKeywords(jobDescription: string): string[] {
  // Convert to lowercase for case-insensitive matching
  const text = jobDescription.toLowerCase()
  
  // Common technical skills and keywords to look for
  const technicalKeywords = [
    // Programming languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    // Frontend technologies
    'react', 'vue', 'angular', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
    // Backend technologies
    'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
    // Databases
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sql',
    // Cloud platforms
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
    // Tools and frameworks
    'git', 'jenkins', 'webpack', 'vite', 'babel', 'jest', 'cypress',
    // Methodologies
    'agile', 'scrum', 'devops', 'ci/cd', 'tdd', 'microservices'
  ]
  
  // Extract years of experience
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/gi,
    /(\d+)\+?\s*yrs?\s*(of\s*)?(experience|exp)/gi,
    /(senior|lead|principal|staff)/gi,
    /(junior|entry.level|graduate)/gi
  ]
  
  const foundKeywords = new Set<string>()
  
  // Find technical keywords
  technicalKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      foundKeywords.add(keyword)
    }
  })
  
  // Extract experience-related terms
  experiencePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => foundKeywords.add(match.toLowerCase()))
    }
  })
  
  // Extract other important words (nouns, adjectives)
  const words = text.match(/\b[a-z]{3,}\b/g) || []
  const importantWords = words.filter(word => 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
  )
  
  // Add most frequent important words
  const wordFreq = new Map<string, number>()
  importantWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })
  
  // Add words that appear more than once
  Array.from(wordFreq.entries())
    .filter(([_, count]) => count > 1)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 20) // Top 20 most frequent words
    .forEach(([word, _]) => foundKeywords.add(word))
  
  return Array.from(foundKeywords)
}

function calculateKeywordScore(resumeText: string, keywords: string[]): number {
  if (keywords.length === 0) return 0
  
  const resumeLower = resumeText.toLowerCase()
  let matchCount = 0
  
  keywords.forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matchCount++
    }
  })
  
  return matchCount / keywords.length
}

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

async function analyzeCandidateWithRetry(
  apiKey: string, 
  jobDescription: string, 
  candidate: any,
  maxRetries: number = 2
): Promise<MatchResult | null> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await analyzeCandidate(apiKey, jobDescription, candidate)
      if (result) return result
    } catch (error) {
      lastError = error as Error
      console.warn(`Attempt ${attempt + 1} failed for candidate ${candidate.name}:`, error)
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  console.error(`Failed to analyze candidate ${candidate.name} after ${maxRetries + 1} attempts:`, lastError)
  return null
}

async function analyzeCandidate(
  apiKey: string, 
  jobDescription: string, 
  candidate: any
): Promise<MatchResult | null> {
  try {
    const resumeText = extractResumeText(candidate.extracted_data)
    if (!resumeText) {
      console.log(`Skipping candidate ${candidate.name} - no resume text found`)
      return null
    }

    // Truncate very long resumes to optimize processing time
    const maxResumeLength = 8000 // characters
    const truncatedResumeText = resumeText.length > maxResumeLength 
      ? resumeText.substring(0, maxResumeLength) + '...[truncated]'
      : resumeText

    const systemPrompt = `You are an expert resume matching system. Analyze the provided resume against the job description using the following scoring framework:

SCORING FRAMEWORK (Total: 100 points):
1. Keyword & Contextual Match (25 points)
2. Experience Alignment (35 points) 
3. Education & Certifications (20 points)
4. Skills & Tools Relevance (20 points)

IMPORTANT: Only recommend candidates with 50% or higher match scores.

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
            content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${truncatedResumeText}`
          }
        ],
        max_tokens: 1500, // Reduced from 2000 for faster processing
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
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
    throw error // Re-throw to be handled by retry logic
  }
}