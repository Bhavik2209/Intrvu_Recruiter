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
        // Handle .docx files with multiple extraction methods
        try {
          console.log('Extracting text from DOCX using mammoth library...')
          
          // Try mammoth library first (best for DOCX)
          const mammoth = await import('npm:mammoth@1.6.0')
          const result = await mammoth.extractRawText({ buffer: binaryData })
          extractedText = result.value
          
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
                
                console.log(`Successfully extracted ${extractedText.length} characters from DOCX using pizzip`)
              }
            }
            
            if (!extractedText || extractedText.trim().length < 20) {
              throw new Error('PizZip extraction yielded insufficient text')
            }
            
          } catch (pizzipError) {
            console.error('DOCX parsing error with pizzip:', pizzipError)
            
            // Final fallback to basic XML parsing
            try {
              console.log('Falling back to basic DOCX XML parsing...')
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
              
              // Also try to find paragraph content
              const paragraphMatches = docxText.match(/<w:p[^>]*>.*?<\/w:p>/gs)
              if (paragraphMatches && paragraphMatches.length > 0) {
                const paragraphText = paragraphMatches
                  .map(para => {
                    const textInPara = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)
                    return textInPara ? textInPara.map(t => t.replace(/<[^>]+>/g, '')).join(' ') : ''
                  })
                  .filter(text => text.trim().length > 0)
                  .join('\n')
                
                if (paragraphText.length > extractedText.length) {
                  extractedText = paragraphText
                }
              }
              
              if (!extractedText || extractedText.length < 50) {
                extractedText = `DOCX file "${file_name}" could not be parsed with available methods. The document may have complex formatting or be password protected. Please try converting to .txt format or copy-paste the content manually.`
              } else {
                console.log(`Successfully extracted ${extractedText.length} characters from DOCX using fallback method`)
              }
              
            } catch (fallbackError) {
              console.error('Fallback DOCX extraction also failed:', fallbackError)
              extractedText = `DOCX file "${file_name}" could not be processed with any available method. Please convert to .txt format or copy-paste the job description manually.`
            }
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
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim()
        
        // Remove common DOCX artifacts
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