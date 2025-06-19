import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getTextExtractor } from 'npm:office-text-extractor@3.0.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { file_content_base64, file_type, file_name, chat_id, user_id } = await req.json()

    if (!file_content_base64 || !file_type || !file_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file_content_base64, file_type, file_name' }),
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

    try {
      // Decode base64 to binary data
      const binaryData = Uint8Array.from(atob(file_content_base64), c => c.charCodeAt(0))
      
      let extractedText = ''

      // Extract text based on file type
      if (file_type === 'text/plain') {
        // Handle .txt files
        const textDecoder = new TextDecoder('utf-8')
        extractedText = textDecoder.decode(binaryData)
        
      } else if (file_type === 'application/pdf') {
        // Handle .pdf files using pdf-parse library
        try {
          console.log('Extracting text from PDF using pdf-parse library...')
          
          // Import pdf-parse library
          const pdfParse = (await import('npm:pdf-parse@1.1.1')).default
          
          // Extract text from PDF
          const pdfData = await pdfParse(binaryData)
          extractedText = pdfData.text
          
          console.log(`Successfully extracted ${extractedText.length} characters from PDF`)
          
          // If no meaningful text extracted, provide a helpful message
          if (!extractedText || extractedText.trim().length < 20) {
            extractedText = `PDF file "${file_name}" was processed but appears to contain mostly images or non-text content. Please ensure the PDF contains selectable text or try converting it to a text-based format.`
          }
          
        } catch (pdfError) {
          console.error('PDF parsing error with pdf-parse:', pdfError)
          
          // Fallback to basic extraction method
          try {
            console.log('Falling back to basic PDF text extraction...')
            const textDecoder = new TextDecoder('utf-8', { fatal: false })
            const pdfText = textDecoder.decode(binaryData)
            
            // Extract readable text patterns from PDF
            const textMatches = pdfText.match(/[A-Za-z\s\.\,\;\:\!\?\-\(\)]{20,}/g)
            if (textMatches && textMatches.length > 0) {
              extractedText = textMatches
                .filter(match => match.trim().length > 10)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim()
            }
            
            if (!extractedText || extractedText.length < 50) {
              extractedText = `PDF file "${file_name}" could not be parsed with available methods. This may be a scanned PDF or contain complex formatting. Please try converting to text format or copy-paste the content manually.`
            }
            
          } catch (fallbackError) {
            console.error('Fallback PDF extraction also failed:', fallbackError)
            extractedText = `PDF file "${file_name}" could not be processed. Please convert to .txt format or copy-paste the job description manually.`
          }
        }
        
      } else if (file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle .docx files using office-text-extractor
        try {
          console.log('Extracting text from DOCX using office-text-extractor...')
          
          const extractor = getTextExtractor()
          const text = await extractor.extractText({ input: binaryData, type: 'buffer' })
          extractedText = text
          
          console.log(`Successfully extracted ${extractedText.length} characters from DOCX`)
          
          // If no meaningful text extracted, provide a helpful message
          if (!extractedText || extractedText.trim().length < 20) {
            extractedText = `DOCX file "${file_name}" was processed but appears to contain minimal text content. Please check the document or try a different format.`
          }
          
        } catch (docxError) {
          console.error('DOCX parsing error with office-text-extractor:', docxError)
          
          // Fallback to basic DOCX extraction
          try {
            console.log('Falling back to basic DOCX text extraction...')
            const textDecoder = new TextDecoder('utf-8', { fatal: false })
            const docxText = textDecoder.decode(binaryData)
            
            // Look for text content patterns in DOCX XML
            const xmlTextMatches = docxText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)
            if (xmlTextMatches && xmlTextMatches.length > 0) {
              extractedText = xmlTextMatches
                .map(match => match.replace(/<[^>]+>/g, ''))
                .filter(text => text.trim().length > 0)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim()
            }
            
            if (!extractedText || extractedText.length < 50) {
              extractedText = `DOCX file "${file_name}" could not be parsed with available methods. Please try converting to .txt format or copy-paste the content manually.`
            }
            
          } catch (fallbackError) {
            console.error('Fallback DOCX extraction also failed:', fallbackError)
            extractedText = `DOCX file "${file_name}" could not be processed. Please convert to .txt format or copy-paste the job description manually.`
          }
        }
        
      } else {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Unsupported file type. Please upload .pdf, .txt, or .docx files.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Clean up the extracted text
      if (extractedText) {
        // Remove excessive whitespace and normalize line breaks
        extractedText = extractedText
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim()
      }

      // Ensure we have some extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'No text could be extracted from the file. Please check the file content and try again.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Limit text length to prevent overwhelming the system
      const maxLength = 10000
      if (extractedText.length > maxLength) {
        extractedText = extractedText.substring(0, maxLength) + '...[truncated]'
      }

      // Log successful extraction
      console.log(`Successfully extracted ${extractedText.length} characters from ${file_name} (${file_type})`)

      return new Response(
        JSON.stringify({ 
          success: true,
          extracted_text: extractedText,
          file_name: file_name,
          file_type: file_type,
          text_length: extractedText.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (processingError) {
      console.error('File processing error:', processingError)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Unable to process the file. Please check the content and try again.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in job-description-extractor function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error while processing the file.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})