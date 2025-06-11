import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

const chatMessages = [
  {
    type: "ai",
    content:
      "Hello! I'm your AI recruitment assistant. Please share the requirements for the role or position you are looking to hire for, and I'll help you find the best matching candidates from our talent pool.",
    label: "AI-powered candidate search",
  },
  {
    type: "user",
    content:
      "We need a Senior React Developer with 5+ years of experience. Must have expertise in React hooks, Redux, and TypeScript. Experience with Next.js is required. The candidate should have worked on large-scale applications and be familiar with testing frameworks like Jest and React Testing Library. They should also have experience with RESTful APIs and GraphQL.",
    time: "You - 2:30 PM",
  },
  {
    type: "ai",
    content:
      "Thank you for providing the job requirements. I've analyzed our talent pool and found 3 candidates with a match score of 70% or higher for your Senior React Developer position. You can view their profiles in the right panel.\n\nWould you like me to provide more details about any specific candidate or refine the search criteria further?",
    label: "AI-powered candidate matching",
  },
  {
    type: "user",
    content:
      "Can you tell me more about Michael Chen's experience with testing frameworks?",
    time: "You - 2:32 PM",
  },
  {
    type: "ai",
    content:
      "Michael Chen has extensive experience with testing frameworks:\n\n• 5+ years with Jest for unit testing\n• 4+ years with React Testing Library for component testing\n• Experience with Cypress for end-to-end testing\n• Has implemented testing strategies for large-scale applications at Airbnb\n• Strong advocate for TDD (Test-Driven Development)\n• Has mentored junior developers on testing best practices\n\nHis testing experience is particularly strong in the React ecosystem, which aligns perfectly with your requirements.",
    label: "AI-powered candidate analysis",
  },
  {
    type: "user",
    content:
      "What about his GraphQL experience? I noticed it was listed as limited.",
    time: "You - 2:35 PM",
  },
  {
    type: "ai",
    content:
      "You're right to ask about GraphQL. Michael's GraphQL experience is indeed more limited:\n\n• 1 year of hands-on GraphQL experience\n• Has worked with Apollo Client in 2 projects\n• Familiar with GraphQL queries and mutations\n• Limited experience with GraphQL schema design\n• No experience with GraphQL subscriptions\n\nWhile his GraphQL skills are developing, his strong React and TypeScript foundation would help him quickly ramp up. Would you like me to search for candidates with stronger GraphQL experience, or is this acceptable given his other strong qualifications?",
    label: "AI-powered candidate analysis",
  },
  {
    type: "user",
    content:
      "That's helpful context. Can you also tell me about David Rodriguez's leadership experience since he's listed as a Tech Lead?",
    time: "You - 2:38 PM",
  },
  {
    type: "ai",
    content:
      "Great question! David Rodriguez has solid leadership experience:\n\n• Currently leading a team of 6 frontend developers\n• 3+ years in technical leadership roles\n• Has successfully delivered 4 major product launches\n• Experience with agile methodologies and sprint planning\n• Mentored 8+ junior developers throughout his career\n• Strong communication skills with stakeholders\n• Experience with code reviews and technical decision making\n\nHis leadership style focuses on collaborative development and knowledge sharing. He's particularly good at bridging the gap between technical teams and product management.",
    label: "AI-powered candidate analysis",
  },
  {
    type: "user",
    content:
      "How do their salary expectations compare to our budget range of $120k-$150k?",
    time: "You - 2:40 PM",
  },
  {
    type: "ai",
    content:
      "Based on their profiles and market data:\n\n**Michael Chen:**\n• Expected range: $130k-$155k\n• Slightly above your upper limit but negotiable\n• Open to discussing total compensation package\n\n**David Rodriguez:**\n• Expected range: $140k-$165k\n• Above your budget due to leadership premium\n• May consider lower base with equity/benefits\n\nBoth candidates are within negotiating range. Michael fits better within your budget, while David's leadership experience commands a premium. Would you like me to search for candidates with lower salary expectations, or explore compensation package options?",
    label: "AI-powered salary analysis",
  },
];

export const JobDescriptionSection = (): JSX.Element => {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-4">
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.type === "ai" && (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs font-medium">AI</span>
            </div>
          )}

          <div className={`max-w-lg ${message.type === "user" ? "ml-auto" : ""}`}>
            {message.type === "user" && (
              <div className="text-right mb-1">
                <span className="text-xs text-gray-500">{message.time}</span>
              </div>
            )}

            <Card
              className={`${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              </CardContent>
            </Card>

            {message.type === "ai" && message.label && (
              <div className="mt-1 ml-2">
                <span className="text-xs text-gray-500">{message.label}</span>
              </div>
            )}
          </div>

          {message.type === "user" && (
            <div className="w-8 h-8 bg-gray-400 rounded-full ml-3 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-medium">U</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};