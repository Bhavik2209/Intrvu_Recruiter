import { useState } from 'react'

export interface MatchResult {
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

export interface MatchingResults {
  matches: MatchResult[]
  total_candidates_analyzed: number
  qualifying_matches: number
}

export const useResumeMatching = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<MatchingResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeResumes = async (jobDescription: string, chatId?: string) => {
    if (!jobDescription.trim()) {
      setError('Job description is required')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-matcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          job_description: jobDescription,
          chat_id: chatId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Error analyzing resumes:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze resumes')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults(null)
    setError(null)
  }

  return {
    loading,
    results,
    error,
    analyzeResumes,
    clearResults,
  }
}