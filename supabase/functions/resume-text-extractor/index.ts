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
      console.log(`Starting resume processing for candidate ${candidate_id}`)
      console.log(`Resume URL: ${resume_url}`)

      // Fetch the resume file
      const response = await fetch(resume_url)
      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.status} ${response.statusText}`)
      }

      const fileBuffer = await response.arrayBuffer()
      const binaryData = new Uint8Array(fileBuffer)
      
      console.log(`Downloaded resume file, size: ${binaryData.length} bytes`)

      let extractedText = ''
      let extractionMethod = 'unknown'

      // Determine file type from URL or content
      const fileExtension = resume_url.toLowerCase().split('.').pop()
      console.log(`Detected file extension: ${fileExtension}`)

      if (fileExtension === 'pdf') {
        // Handle PDF files using pdf-parse library
        try {
          console.log('Extracting text from PDF using pdf-parse library...')
          
          // Import pdf-parse library
          const pdfParse = (await import('npm:pdf-parse@1.1.1')).default
          
          // Extract text from PDF
          const pdfData = await pdfParse(binaryData)
          extractedText = pdfData.text
          extractionMethod = 'pdf-parse'
          
          console.log(`Successfully extracted ${extractedText.length} characters from PDF`)
          
          // If no meaningful text extracted, provide a helpful message
          if (!extractedText || extractedText.trim().length < 20) {
            extractedText = `PDF resume for candidate ${candidate_id} was processed but appears to contain mostly images or non-text content. Manual review may be required.`
            extractionMethod = 'pdf-parse-minimal'
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
              extractionMethod = 'basic-pdf-fallback'
            }
            
            if (!extractedText || extractedText.length < 50) {
              extractedText = `PDF resume for candidate ${candidate_id} could not be parsed with available methods. This may be a scanned PDF or contain complex formatting. Manual processing required.`
              extractionMethod = 'pdf-extraction-failed'
            }
            
          } catch (fallbackError) {
            console.error('Fallback PDF extraction also failed:', fallbackError)
            extractedText = `PDF resume for candidate ${candidate_id} could not be processed. Manual processing required.`
            extractionMethod = 'pdf-extraction-error'
          }
        }
        
      } else if (fileExtension === 'txt') {
        // Handle plain text files
        try {
          const textDecoder = new TextDecoder('utf-8')
          extractedText = textDecoder.decode(binaryData)
          extractionMethod = 'text-decoder'
          console.log(`Successfully extracted ${extractedText.length} characters from TXT file`)
        } catch (textError) {
          console.error('Text file parsing error:', textError)
          extractedText = `Text resume for candidate ${candidate_id} could not be decoded. File may be corrupted.`
          extractionMethod = 'text-extraction-error'
        }
        
      } else if (fileExtension === 'docx') {
        // Handle DOCX files using mammoth library
        try {
          console.log('Extracting text from DOCX using mammoth library...')
          
          // Try mammoth library first (best for DOCX)
          const mammoth = await import('npm:mammoth@1.6.0')
          const result = await mammoth.extractRawText({ buffer: binaryData })
          extractedText = result.value
          extractionMethod = 'mammoth'
          
          console.log(`Successfully extracted ${extractedText.length} characters from DOCX using mammoth`)
          
          // If no meaningful text extracted, try alternative method
          if (!extractedText || extractedText.trim().length < 20) {
            throw new Error('Mammoth extraction yielded insufficient text')
          }
          
        } catch (mammothError) {
          console.error('DOCX parsing error with mammoth:', mammothError)
          
          // Try pizzip + docxtemplater approach
          try {
            console.log('Trying alternative DOCX extraction with pizzip...')
            
            const PizZip = (await import('npm:pizzip@3.1.6')).default
            
            // Load the docx file as a zip
            const zip = new PizZip(binaryData)
            
            // Extract document.xml which contains the main text content
            const documentXml = zip.file('word/document.xml')?.asText()
            
            if (documentXml) {
              // Parse XML to extract text content
              const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)
              if (textMatches && textMatches.length > 0) {
                extractedText = textMatches
                  .map(match => {
                    // Extract text between tags and decode XML entities
                    const text = match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1')
                    return text
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&amp;/g, '&')
                      .replace(/&quot;/g, '"')
                      .replace(/&apos;/g, "'")
                  })
                  .filter(text => text.trim().length > 0)
                  .join(' ')
                
                extractionMethod = 'pizzip-xml'
                console.log(`Successfully extracted ${extractedText.length} characters from DOCX using pizzip`)
              }
            }
            
            if (!extractedText || extractedText.trim().length < 20) {
              throw new Error('PizZip extraction yielded insufficient text')
            }
            
          } catch (pizzipError) {
            console.error('DOCX parsing error with pizzip:', pizzipError)
            extractedText = `DOCX resume for candidate ${candidate_id} could not be parsed with available methods. Manual processing required.`
            extractionMethod = 'docx-extraction-failed'
          }
        }
        
      } else {
        // Unsupported file type
        extractedText = `Resume file for candidate ${candidate_id} has unsupported format (${fileExtension}). Supported formats: PDF, TXT, DOCX.`
        extractionMethod = 'unsupported-format'
      }

      // Clean up the extracted text
      if (extractedText && extractionMethod !== 'unsupported-format' && !extractionMethod.includes('failed') && !extractionMethod.includes('error')) {
        // Remove excessive whitespace and normalize line breaks
        extractedText = extractedText
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim()
        
        // Remove common document artifacts
        extractedText = extractedText
          .replace(/\u0001/g, '') // Remove control characters
          .replace(/\u0002/g, '')
          .replace(/\u0003/g, '')
          .replace(/\u0004/g, '')
          .replace(/\u0005/g, '')
          .replace(/\u0006/g, '')
          .replace(/\u0007/g, '')
          .replace(/\u0008/g, '')
          .replace(/\u000B/g, '')
          .replace(/\u000C/g, '')
          .replace(/\u000E/g, '')
          .replace(/\u000F/g, '')
          .replace(/\u0010/g, '')
          .replace(/\u0011/g, '')
          .replace(/\u0012/g, '')
          .replace(/\u0013/g, '')
          .replace(/\u0014/g, '')
          .replace(/\u0015/g, '')
          .replace(/\u0016/g, '')
          .replace(/\u0017/g, '')
          .replace(/\u0018/g, '')
          .replace(/\u0019/g, '')
          .replace(/\u001A/g, '')
          .replace(/\u001B/g, '')
          .replace(/\u001C/g, '')
          .replace(/\u001D/g, '')
          .replace(/\u001E/g, '')
          .replace(/\u001F/g, '')
      }

      // Limit text length to prevent overwhelming the system
      const maxLength = 15000
      if (extractedText.length > maxLength) {
        extractedText = extractedText.substring(0, maxLength) + '...[truncated]'
      }

      // Store the extracted text
      const extractedData = {
        text: extractedText,
        extracted_at: new Date().toISOString(),
        source_url: resume_url,
        extraction_method: extractionMethod,
        file_type: fileExtension || 'unknown',
        original_length: extractedText.length,
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

      console.log(`Successfully processed resume for candidate ${candidate_id}`)
      console.log(`Extraction method: ${extractionMethod}`)
      console.log(`Text length: ${extractedText.length} characters`)

      return new Response(
        JSON.stringify({ 
          success: true,
          extracted_text: extractedText,
          candidate_id: candidate_id,
          extraction_method: extractionMethod,
          text_length: extractedText.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (processingError) {
      console.error('Processing error:', processingError)
      
      // Update candidate status to failed with error details
      const errorData = {
        text: `Resume processing failed: ${processingError.message}`,
        extracted_at: new Date().toISOString(),
        source_url: resume_url,
        extraction_method: 'error',
        error: processingError.message,
        status: 'failed'
      }

      await supabaseClient
        .from('candidates')
        .update({ 
          extracted_data: errorData,
          status: 'failed' 
        })
        .eq('id', candidate_id)

      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to process resume: ${processingError.message}`,
          candidate_id: candidate_id
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in resume-text-extractor function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error while processing resume' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})