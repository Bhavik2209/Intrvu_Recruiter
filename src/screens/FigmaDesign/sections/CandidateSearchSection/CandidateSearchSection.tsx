import React from "react";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { MatchResult } from "../../../../hooks/useResumeMatching";

interface CandidateSearchSectionProps {
  matchResults?: MatchResult[];
  loading?: boolean;
}

export const CandidateSearchSection = ({ 
  matchResults, 
  loading = false 
}: CandidateSearchSectionProps): JSX.Element => {
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-yellow-800 mb-2">No Matching Candidates Found</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>This could be because:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>No candidates in database have processed resumes</li>
              <li>No candidates meet the 75% match threshold</li>
              <li>Resume data needs to be extracted and processed</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">To get real matching results:</h4>
          <div className="text-xs text-blue-700 space-y-2 text-left">
            <div className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>Upload candidate resumes to the candidates table</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>Process resumes to extract text into the extracted_data field</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>Set candidate status to 'completed' after processing</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>Provide a detailed job description for accurate matching</span>
            </div>
          </div>
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
              {matchResults.length} candidates found with 75%+ match
            </p>
            <p className="text-xs text-green-600">Ranked by compatibility score</p>
          </div>
        </div>
      </div>
      
      {matchResults.map((result, index) => (
        <Card key={result.candidate_id} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Rank */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-medium">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{result.candidate_name}</h3>
                  <p className="text-xs text-gray-600">{result.candidate_email}</p>
                </div>
              </div>
              <Badge className={`${
                result.match_score >= 90 ? 'bg-green-500' : 
                result.match_score >= 85 ? 'bg-blue-500' : 
                result.match_score >= 80 ? 'bg-yellow-500' : 
                'bg-orange-500'
              } text-white text-xs px-2 py-1`}>
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

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs flex-1">
                View Full Resume
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Contact Candidate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};