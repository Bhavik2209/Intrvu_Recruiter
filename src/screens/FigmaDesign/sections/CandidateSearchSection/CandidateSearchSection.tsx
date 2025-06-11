import React from "react";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

export const CandidateSearchSection = (): JSX.Element => {
  const candidates = [
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
      {candidates.map((candidate, index) => (
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
};