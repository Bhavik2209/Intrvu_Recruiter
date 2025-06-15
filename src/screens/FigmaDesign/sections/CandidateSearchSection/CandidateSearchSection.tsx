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
        </div>
      </div>
    );
  }

  if (!matchResults || matchResults.length === 0) {
    // Show mock data when no real results
    const mockCandidates = [
      {
        id: 1,
        name: "Michael Chen",
        position: "Senior Frontend Developer",
        avatar: "/image-1.png",
        match: 92,
        matchColor: "bg-green-500",
        email: "michael.chen@email.com",
        phone: "+1(555)123-4567",
        education: "BS Computer Science, Stanford",
        location: "San Francisco, CA",
        experience: "7 years experience",
        linkedin: "in/michael-chen-dev",
        status: "Actively looking",
        statusColor: "bg-green-100",
        statusTextColor: "text-green-700",
        matchReason:
          "Michael has 7 years of experience with React, including extensive work with hooks, Redux, and TypeScript. He has built and maintained large-scale applications at Airbnb using Next.js and has strong testing experience with Jest and React Testing Library.",
        resumeSummary:
          "Experienced Senior Frontend Developer with expertise in building scalable web applications. Led development of high-traffic e-commerce platforms serving 1M+ users. Strong advocate for clean code, testing, and modern development practices. Has mentored junior developers and contributed to open-source projects.",
        matchingSkills: [
          { name: "React (7 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Redux (6 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "TypeScript (5 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Next.js (4 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Jest (5 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "React Testing Library (4 yrs)", color: "bg-green-100", textColor: "text-green-700" },
        ],
        missingSkills: [
          { name: "GraphQL (limited)", color: "bg-orange-100", textColor: "text-orange-700" },
        ],
      },
      {
        id: 2,
        name: "David Rodriguez",
        position: "Frontend Tech Lead",
        avatar: "/image.png",
        match: 76,
        matchColor: "bg-yellow-500",
        email: "david.rodriguez@email.com",
        phone: "+1(555)987-6543",
        education: "MS Computer Science, UC Berkeley",
        location: "San Francisco, CA",
        experience: "8 years experience",
        linkedin: "in/david-rodriguez-tech",
        status: "Open for opportunities",
        statusColor: "bg-orange-100",
        statusTextColor: "text-orange-700",
        matchReason:
          "David has 8 years of experience with React and strong leadership skills. He has led frontend teams and has experience with large-scale applications. His TypeScript and testing experience align well with your requirements, though his GraphQL experience is more limited.",
        resumeSummary:
          "Experienced Frontend Tech Lead with expertise in building scalable web applications and leading development teams. Currently leading a team of 6 developers. Strong background in React ecosystem and modern development practices. Has successfully delivered multiple high-impact projects.",
        matchingSkills: [
          { name: "React (8 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Redux (7 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "TypeScript (6 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Leadership (3 yrs)", color: "bg-blue-100", textColor: "text-blue-700" },
          { name: "Jest (6 yrs)", color: "bg-green-100", textColor: "text-green-700" },
        ],
        missingSkills: [
          { name: "GraphQL (limited)", color: "bg-orange-100", textColor: "text-orange-700" },
          { name: "Next.js (basic)", color: "bg-orange-100", textColor: "text-orange-700" },
        ],
      },
      {
        id: 3,
        name: "Sarah Johnson",
        position: "Senior React Developer",
        avatar: "/image-2.png",
        match: 88,
        matchColor: "bg-green-500",
        email: "sarah.johnson@email.com",
        phone: "+1(555)456-7890",
        education: "BS Software Engineering, MIT",
        location: "Boston, MA",
        experience: "6 years experience",
        linkedin: "in/sarah-johnson-react",
        status: "Considering offers",
        statusColor: "bg-yellow-100",
        statusTextColor: "text-yellow-700",
        matchReason:
          "Sarah has 6 years of solid React experience with strong TypeScript and testing skills. She has worked on large-scale applications and has good GraphQL experience. Her Next.js experience is excellent and she's familiar with modern development practices.",
        resumeSummary:
          "Senior React Developer with strong expertise in modern frontend technologies. Has built and maintained complex web applications for fintech companies. Excellent problem-solving skills and experience with performance optimization. Active contributor to the React community.",
        matchingSkills: [
          { name: "React (6 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "TypeScript (5 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Next.js (4 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "GraphQL (3 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "Jest (5 yrs)", color: "bg-green-100", textColor: "text-green-700" },
          { name: "React Testing Library (4 yrs)", color: "bg-green-100", textColor: "text-green-700" },
        ],
        missingSkills: [
          { name: "Redux (limited)", color: "bg-orange-100", textColor: "text-orange-700" },
        ],
      },
    ];

    return (
      <div className="p-4 space-y-4">
        <div className="text-center text-sm text-gray-500 mb-4">
          <p>Mock data - Connect resume database for real matching</p>
        </div>
        {mockCandidates.map((candidate, index) => (
          <Card key={candidate.id} className="border border-gray-200">
            <CardContent className="p-4">
              {/* Header with Serial Number */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">{candidate.name}</h3>
                    <p className="text-xs text-gray-600">{candidate.position}</p>
                  </div>
                </div>
                <Badge className={`${candidate.matchColor} text-white text-xs px-2 py-1`}>
                  {candidate.match}% Match
                </Badge>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">Email</p>
                  <p className="text-gray-800">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-800">{candidate.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Education</p>
                  <p className="text-gray-800">{candidate.education}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Location</p>
                  <p className="text-gray-800">{candidate.location}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">LinkedIn</p>
                  <p className="text-gray-800">{candidate.linkedin}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Experience</p>
                  <p className="text-gray-800">{candidate.experience}</p>
                </div>
              </div>

              {/* Status and Download */}
              <div className="flex justify-between items-center mb-4">
                <Badge
                  variant="outline"
                  className={`${candidate.statusColor} ${candidate.statusTextColor} text-xs px-3 py-1`}
                >
                  {candidate.status}
                </Badge>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
                  Download Resume
                </Button>
              </div>

              {/* Match Reason */}
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                <h4 className="text-green-700 text-xs font-medium mb-2">Why this match?</h4>
                <p className="text-green-700 text-xs leading-relaxed">{candidate.matchReason}</p>
              </div>

              {/* Resume Summary */}
              <div className="mb-4">
                <h4 className="text-gray-700 text-xs font-medium mb-2">Resume Summary</h4>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">{candidate.resumeSummary}</p>

                <h4 className="text-gray-700 text-xs font-medium mb-2">Matching skills</h4>
                <div className="flex flex-wrap gap-1 mb-3">
                  {candidate.matchingSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={`${skill.color} ${skill.textColor} text-xs px-2 py-0.5`}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>

                <h4 className="text-gray-700 text-xs font-medium mb-2">Missing skills</h4>
                <div className="flex flex-wrap gap-1">
                  {candidate.missingSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={`${skill.color} ${skill.textColor} text-xs px-2 py-0.5`}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Render real matching results
  return (
    <div className="p-4 space-y-4">
      <div className="text-center text-sm text-gray-600 mb-4">
        <p>{matchResults.length} candidates found with 75%+ match</p>
      </div>
      
      {matchResults.map((result, index) => (
        <Card key={result.candidate_id} className="border border-gray-200">
          <CardContent className="p-4">
            {/* Header with Rank */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full mr-3 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{result.candidate_name}</h3>
                  <p className="text-xs text-gray-600">{result.candidate_email}</p>
                </div>
              </div>
              <Badge className={`${result.match_score >= 90 ? 'bg-green-500' : result.match_score >= 80 ? 'bg-yellow-500' : 'bg-orange-500'} text-white text-xs px-2 py-1`}>
                {result.match_score}% Match
              </Badge>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Keywords</p>
                <p className="text-gray-800">{result.keyword_score}/25 points</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Experience</p>
                <p className="text-gray-800">{result.experience_score}/35 points</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Education</p>
                <p className="text-gray-800">{result.education_score}/20 points</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Skills</p>
                <p className="text-gray-800">{result.skills_score}/20 points</p>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <h4 className="text-blue-700 text-xs font-medium mb-2">Analysis Summary</h4>
              <p className="text-blue-700 text-xs leading-relaxed">{result.analysis.summary}</p>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-3">
              {/* Strong Matches */}
              {result.analysis.keyword_analysis.strong_matches.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">Strong Keyword Matches</h4>
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
                  <h4 className="text-gray-700 text-xs font-medium mb-2">Matching Technical Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.skills_analysis.matching_technical_skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Critical Skills */}
              {result.analysis.skills_analysis.missing_critical_skills.length > 0 && (
                <div>
                  <h4 className="text-gray-700 text-xs font-medium mb-2">Missing Critical Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.skills_analysis.missing_critical_skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
                View Full Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};