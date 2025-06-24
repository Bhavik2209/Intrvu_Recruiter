import jsPDF from 'jspdf'
import { MatchingResults } from '../hooks/useResumeMatching'

export const exportMatchingResultsToPDF = (
  matchingResults: MatchingResults,
  jobTitle: string = 'Job Search'
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = margin

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize)
    return doc.splitTextToSize(text, maxWidth)
  }

  // Helper function to add section header
  const addSectionHeader = (title: string, fontSize: number = 12) => {
    checkPageBreak(15)
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, yPosition)
    yPosition += 8
  }

  // Helper function to add regular text
  const addText = (text: string, fontSize: number = 10, style: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', style)
    const wrappedText = wrapText(text, contentWidth, fontSize)
    doc.text(wrappedText, margin, yPosition)
    yPosition += (wrappedText.length * (fontSize * 0.4)) + 3
  }

  // Helper function to add bullet points
  const addBulletList = (items: string[], indent: number = 5) => {
    items.forEach(item => {
      checkPageBreak(8)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const wrappedText = wrapText(`• ${item}`, contentWidth - indent, 9)
      doc.text(wrappedText, margin + indent, yPosition)
      yPosition += (wrappedText.length * 3.6) + 2
    })
  }

  // Helper function to add score box
  const addScoreBox = (label: string, score: number, maxScore: number, x: number, width: number) => {
    const percentage = Math.round((score / maxScore) * 100)
    
    // Draw box
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(245, 245, 245)
    doc.rect(x, yPosition - 8, width, 12, 'FD')
    
    // Add label and score
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(label, x + 2, yPosition - 2)
    doc.text(`${score}/${maxScore} (${percentage}%)`, x + 2, yPosition + 2)
  }

  // Title Page
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Candidate Matching Report', pageWidth / 2, 40, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`Job Position: ${jobTitle}`, pageWidth / 2, 55, { align: 'center' })

  doc.setFontSize(10)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 70, { align: 'center' })

  // Summary Section
  yPosition = 90
  addSectionHeader('Executive Summary', 14)
  addText(`Total candidates analyzed: ${matchingResults.total_candidates_analyzed}`)
  addText(`Qualifying matches found: ${matchingResults.qualifying_matches} (50%+ match score)`)
  addText(`Top candidates presented: ${matchingResults.matches.length}`)

  if (matchingResults.matches.length === 0) {
    yPosition += 10
    addText('No candidates met the minimum 50% match threshold for this position.', 10, 'bold')
    
    // Save the PDF
    doc.save(`Candidate_Matching_Report_${jobTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    return
  }

  // Add new page for candidates
  doc.addPage()
  yPosition = margin

  addSectionHeader('Candidate Rankings', 16)
  addText('Candidates are ranked by overall match score, with detailed analysis for each.')

  // Process each candidate
  matchingResults.matches.forEach((candidate, index) => {
    // Check if we need a new page for this candidate
    checkPageBreak(60)

    // Candidate Header
    yPosition += 5
    addSectionHeader(`#${index + 1} - ${candidate.candidate_name}`, 14)
    
    // Contact info and overall score
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Email: ${candidate.candidate_email}`, margin, yPosition)
    yPosition += 6

    // Overall match score (prominent)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const scoreColor = candidate.match_score >= 90 ? [34, 197, 94] : 
                      candidate.match_score >= 75 ? [59, 130, 246] : 
                      candidate.match_score >= 60 ? [234, 179, 8] : [249, 115, 22]
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.text(`Overall Match: ${candidate.match_score}%`, margin, yPosition)
    doc.setTextColor(0, 0, 0) // Reset to black
    yPosition += 10

    // Score breakdown boxes
    checkPageBreak(20)
    const boxWidth = (contentWidth - 15) / 4
    addScoreBox('Keywords', candidate.keyword_score, 25, margin, boxWidth)
    addScoreBox('Experience', candidate.experience_score, 35, margin + boxWidth + 5, boxWidth)
    addScoreBox('Education', candidate.education_score, 20, margin + (boxWidth + 5) * 2, boxWidth)
    addScoreBox('Skills', candidate.skills_score, 20, margin + (boxWidth + 5) * 3, boxWidth)
    yPosition += 15

    // Analysis Summary
    checkPageBreak(20)
    addSectionHeader('Match Analysis', 11)
    addText(candidate.analysis.summary)

    // Strong Matches Section
    if (candidate.analysis.keyword_analysis.strong_matches.length > 0) {
      checkPageBreak(15)
      addSectionHeader('✅ Strong Keyword Matches', 10)
      addBulletList(candidate.analysis.keyword_analysis.strong_matches)
    }

    // Technical Skills
    if (candidate.analysis.skills_analysis.matching_technical_skills.length > 0) {
      checkPageBreak(15)
      addSectionHeader('🔧 Matching Technical Skills', 10)
      addBulletList(candidate.analysis.skills_analysis.matching_technical_skills)
    }

    // Tools & Platforms
    if (candidate.analysis.skills_analysis.matching_tools.length > 0) {
      checkPageBreak(15)
      addSectionHeader('🛠️ Matching Tools & Platforms', 10)
      addBulletList(candidate.analysis.skills_analysis.matching_tools)
    }

    // Relevant Experience
    if (candidate.analysis.experience_analysis.strong_match_experience.length > 0) {
      checkPageBreak(15)
      addSectionHeader('💼 Relevant Experience', 10)
      addBulletList(candidate.analysis.experience_analysis.strong_match_experience)
    }

    // Education & Certifications
    if (candidate.analysis.education_analysis.matching_qualifications.length > 0) {
      checkPageBreak(15)
      addSectionHeader('🎓 Education & Certifications', 10)
      addBulletList(candidate.analysis.education_analysis.matching_qualifications)
    }

    // Areas for Development (if any)
    const hasGaps = candidate.analysis.skills_analysis.missing_critical_skills.length > 0 ||
                   candidate.analysis.experience_analysis.missing_experience.length > 0

    if (hasGaps) {
      checkPageBreak(15)
      addSectionHeader('⚠️ Areas for Development', 10)
      
      if (candidate.analysis.skills_analysis.missing_critical_skills.length > 0) {
        addText('Missing Critical Skills:', 9, 'bold')
        addBulletList(candidate.analysis.skills_analysis.missing_critical_skills)
      }
      
      if (candidate.analysis.experience_analysis.missing_experience.length > 0) {
        addText('Experience Gaps:', 9, 'bold')
        addBulletList(candidate.analysis.experience_analysis.missing_experience)
      }
    }

    // Add separator line between candidates (except for the last one)
    if (index < matchingResults.matches.length - 1) {
      yPosition += 5
      checkPageBreak(10)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }
  })

  // Footer on last page
  checkPageBreak(30)
  yPosition += 10
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('This report was generated by IntrvuRecruiter AI-powered candidate matching system.', 
           pageWidth / 2, yPosition, { align: 'center' })

  // Add page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' })
  }

  // Save the PDF
  const fileName = `Candidate_Matching_Report_${jobTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}