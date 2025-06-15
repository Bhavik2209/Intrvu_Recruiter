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
    const { resume_url, candidate_id } = await req.json()

    if (!resume_url || !candidate_id) {
      return new Response(
        JSON.stringify({ error: 'Resume URL and candidate ID are required' }),
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

    // Update candidate status to processing
    await supabaseClient
      .from('candidates')
      .update({ status: 'processing' })
      .eq('id', candidate_id)

    try {
      // Fetch the PDF file
      const response = await fetch(resume_url)
      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.status}`)
      }

      const pdfBuffer = await response.arrayBuffer()
      
      // For now, we'll use a simple text extraction approach
      // In a production environment, you'd want to use a proper PDF parsing library
      // Since we're in Deno, we'll use a basic approach or call an external service
      
      let extractedText = ''
      
      try {
        // Try to extract text using a simple approach
        // This is a placeholder - you'd want to use a proper PDF parser
        const textDecoder = new TextDecoder()
        const pdfText = textDecoder.decode(pdfBuffer)
        
        // Basic text extraction (this is very limited)
        // Look for readable text patterns
        const textMatches = pdfText.match(/[A-Za-z\s]{10,}/g)
        if (textMatches) {
          extractedText = textMatches.join(' ').substring(0, 10000) // Limit to 10k chars
        }
        
        // If no text found, create a placeholder
        if (!extractedText.trim()) {
          extractedText = `Resume content for candidate ${candidate_id}. PDF processing requires additional setup.`
        }
        
      } catch (extractError) {
        console.error('Text extraction error:', extractError)
        extractedText = `Resume content for candidate ${candidate_id}. Text extraction failed - manual processing required.`
      }

      // Store the extracted text
      const extractedData = {
        text: extractedText,
        extracted_at: new Date().toISOString(),
        source_url: resume_url,
        extraction_method: 'basic_text_extraction',
        status: 'extracted'
      }

      // Update candidate with extracted data
      const { error: updateError } = await supabaseClient
        .from('candidates')
        .update({ 
          extracted_data: extractedData,
          status: 'completed'
        })
        .eq('id', candidate_id)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          extracted_text: extractedText,
          candidate_id: candidate_id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (processingError) {
      console.error('Processing error:', processingError)
      
      // Update candidate status to failed
      await supabaseClient
        .from('candidates')
        .update({ status: 'failed' })
        .eq('id', candidate_id)

      throw processingError
    }

  } catch (error) {
    console.error('Error in resume-text-extractor function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to extract resume text' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})