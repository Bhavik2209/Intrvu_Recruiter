import React from "react";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { MatchResult } from "../../../../hooks/useResumeMatching";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";

interface CandidateSearchSectionProps {
  matchResults?: MatchResult[];
  loading?: boolean;
}

export const CandidateSearchSection = ({ 
  matchResults, 
  loading = false 
}: CandidateSearchSectionProps): JSX.Element => {
  const handleDownloadResume = async (candidateId: string, candidateName: string) => {
    try {
      // Get candidate data from Supabase to fetch the resume_url
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const { data: candidate, error } = await supabase
        .from('candidates')
        .select('resume_url, resume_filename')
        .eq('id', candidateId)
        .single();

      if (error) {
        console.error('Error fetching candidate data:', error);
        alert('Failed to fetch resume information. Please try again.');
        return;
      }

      if (!candidate?.resume_url) {
        alert('Resume file not available for this candidate.');
        return;
      }

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = candidate.resume_url;
      
      // Set the download filename
      const filename = candidate.resume_filename || `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
      link.download = filename;
      
      // For external URLs, we need to handle CORS by opening in new tab
      // Check if it's an external URL
      const isExternalUrl = candidate.resume_url.startsWith('http') && 
                           !candidate.resume_url.includes(window.location.hostname);
      
      if (isExternalUrl) {
        // For external URLs, open in new tab (browser will handle download)
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Resume download initiated for ${candidateName}`);
      
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Analyzing resumes...</p>
          <p className="text-xs text-gray-400 mt-1">Matching candidates against job requirements</p>
        </div>
      </div>
    );
  }

  if (!matchResults || matchResults.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-yellow-800 mb-2">No Matching Candidates Found</h3>
        </div>
      </div>
    );
  }

  // Render real matching results
  return (
    <div className="p-4 space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">
              {matchResults.length} candidates found with 50%+ match
            </p>
            <p className="text-xs text-green-600">Ranked by compatibility score</p>
          </div>
        </div>
      </div>
      
      {matchResults.map((result, index) => (
        <Card key={result.candidate_id} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Rank and Match Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {/* Numbered Avatar */}
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  #{index + 1}
                </div>
                
                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 mb-1">{result.candidate_name}</h3>
                  {result.candidate_title && (
                    <p className="text-sm text-gray-600 mb-1">{result.candidate_title}</p>
                  )}
                  
                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 mb-2">
                    <div>
                      <span className="font-medium text-gray-700">Email</span>
                      <p className="text-gray-600">{result.candidate_email}</p>
                    </div>
                    
                    {result.linkedin_url && (
                      <div>
                        <span className="font-medium text-gray-700">LinkedIn</span>
                        <a 
                          href={result.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                        >
                          <span className="truncate">{result.linkedin_url.replace('https://', '').replace('http://', '')}</span>
                          <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Actively Looking Badge */}
                  <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1 mb-2">
                    Actively looking
                  </Badge>
                </div>
              </div>
              
              {/* Match Score Badge */}
              <Badge className={`${
                result.match_score >= 90 ? 'bg-green-500' : 
                result.match_score >= 75 ? 'bg-blue-500' : 
                result.match_score >= 60 ? 'bg-yellow-500' : 
                'bg-orange-500'
              } text-white text-xs px-2 py-1 flex-shrink-0`}>
                {result.match_score}% Match
              </Badge>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 mb-1">Keywords & Context</p>
                <p className="text-gray-800 font-medium">{result.keyword_score}/25 points</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 mb-1">Experience</p>
                <p className="text-gray-800 font-medium">{result.experience_score}/35 points</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 mb-1">Education</p>
                <p className="text-gray-800 font-medium">{result.education_score}/20 points</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 mb-1">Skills & Tools</p>
                <p className="text-gray-800 font-medium">{result.skills_score}/20 points</p>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <h4 className="text-blue-700 text-xs font-medium mb-2">Match Analysis</h4>
              <p className="text-blue-700 text-xs leading-relaxed">{result.analysis.summary}</p>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-3">
              {/* Strong Keyword Matches */}
              {result.analysis.keyword_analysis.strong_matches.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">✅ Strong Keyword Matches</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.keyword_analysis.strong_matches.map((match, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                        {match}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Technical Skills */}
              {result.analysis.skills_analysis.matching_technical_skills.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">🔧 Technical Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.skills_analysis.matching_technical_skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Tools */}
              {result.analysis.skills_analysis.matching_tools.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">🛠️ Tools & Platforms</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.skills_analysis.matching_tools.map((tool, idx) => (
                      <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strong Experience Matches */}
              {result.analysis.experience_analysis.strong_match_experience.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">💼 Relevant Experience</h4>
                  <div className="bg-gray-50 rounded p-2">
                    <ul className="text-xs text-gray-700 space-y-1">
                      {result.analysis.experience_analysis.strong_match_experience.map((exp, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-1">•</span>
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Missing Critical Skills */}
              {result.analysis.skills_analysis.missing_critical_skills.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">⚠️ Missing Critical Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.skills_analysis.missing_critical_skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Matches */}
              {result.analysis.education_analysis.matching_qualifications.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">🎓 Education & Certifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.education_analysis.matching_qualifications.map((qual, idx) => (
                      <Badge key={idx} variant="outline" className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5">
                        {qual}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button - Only Download Resume */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Button 
                size="sm" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs flex items-center justify-center gap-2"
                onClick={() => handleDownloadResume(result.candidate_id, result.candidate_name)}
              >
                <DownloadIcon className="h-3 w-3" />
                Download Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};