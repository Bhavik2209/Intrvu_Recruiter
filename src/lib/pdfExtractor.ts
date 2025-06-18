import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

export interface PDFExtractionResult {
  text: string
  pageCount: number
  success: boolean
  error?: string
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
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
          .map((item: any) => {
            // Handle different types of text items
            if ('str' in item) {
              return item.str
            }
            return ''
          })
          .join(' ')
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n'
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError)
        // Continue with other pages
      }
    }
    
    // Clean up the extracted text
    const cleanedText = cleanExtractedText(fullText)
    
    return {
      text: cleanedText,
      pageCount: pdf.numPages,
      success: true
    }
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
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

// Validate if a file is a PDF
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

// Get file size in a readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}