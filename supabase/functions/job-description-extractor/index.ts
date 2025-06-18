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
        // Handle .pdf files using PDF.js
        try {
          extractedText = await extractPDFText(binaryData)
          
          // If no meaningful text extracted, provide a helpful message
          if (!extractedText || extractedText.trim().length < 10) {
            extractedText = `PDF file "${file_name}" was uploaded but appears to contain no readable text. This might be a scanned document or image-based PDF. Please try uploading a text-based PDF or copy and paste the content manually.`
          }
          
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError)
          extractedText = `PDF file "${file_name}" was uploaded but could not be parsed: ${pdfError.message}. Please try a different PDF file or copy and paste the content manually.`
        }
        
      } else if (file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle .docx files
        try {
          extractedText = await extractDOCXText(binaryData)
          
          // If no meaningful text extracted, provide a helpful message
          if (!extractedText || extractedText.trim().length < 10) {
            extractedText = `DOCX file "${file_name}" was uploaded but appears to contain no readable text. Please try a different file or copy and paste the content manually.`
          }
          
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError)
          extractedText = `DOCX file "${file_name}" was uploaded but could not be parsed: ${docxError.message}. Please try a different file or copy and paste the content manually.`
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

      // Clean up the extracted text
      extractedText = cleanExtractedText(extractedText)

      // Limit text length to prevent overwhelming the system
      const maxLength = 15000
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

// PDF text extraction using PDF.js
async function extractPDFText(pdfData: Uint8Array): Promise<string> {
  try {
    // Import PDF.js library
    const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs')
    
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      verbosity: 0 // Reduce console output
    })
    
    const pdf = await loadingTask.promise
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Combine text items from the page
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n'
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError)
        // Continue with other pages
      }
    }
    
    return fullText.trim()
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

// DOCX text extraction
async function extractDOCXText(docxData: Uint8Array): Promise<string> {
  try {
    // Import JSZip for handling DOCX files (which are ZIP archives)
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default
    
    // Load the DOCX file as a ZIP archive
    const zip = await JSZip.loadAsync(docxData)
    
    // Get the main document content
    const documentXml = await zip.file('word/document.xml')?.async('text')
    
    if (!documentXml) {
      throw new Error('Could not find document.xml in DOCX file')
    }
    
    // Extract text from XML using regex patterns
    let extractedText = ''
    
    // Match text content within <w:t> tags
    const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)
    
    if (textMatches) {
      extractedText = textMatches
        .map(match => {
          // Extract text content from the tag
          const textContent = match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1')
          return textContent
        })
        .filter(text => text.trim().length > 0)
        .join(' ')
    }
    
    // Also try to extract from paragraph breaks
    const paragraphMatches = documentXml.match(/<w:p[^>]*>.*?<\/w:p>/gs)
    
    if (paragraphMatches && !extractedText) {
      const paragraphTexts = paragraphMatches
        .map(para => {
          const textInPara = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)
          return textInPara ? textInPara.map(t => t.replace(/<[^>]+>/g, '')).join(' ') : ''
        })
        .filter(text => text.trim().length > 0)
      
      extractedText = paragraphTexts.join('\n\n')
    }
    
    if (!extractedText.trim()) {
      throw new Error('No readable text found in DOCX file')
    }
    
    return extractedText.trim()
    
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error(`Failed to extract text from DOCX: ${error.message}`)
  }
}

// Clean and format extracted text
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove multiple consecutive newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace from start and end
    .trim()
    // Ensure proper spacing after periods
    .replace(/\.([A-Z])/g, '. $1')
    // Remove any remaining control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}