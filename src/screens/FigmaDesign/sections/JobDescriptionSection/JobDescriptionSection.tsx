import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { ChatMessage } from "../../../../lib/supabase";

interface JobDescriptionSectionProps {
  messages: ChatMessage[];
  activeChatId: string | null;
  loading: boolean;
  sendingMessage?: boolean;
  uploadingFile?: boolean;
  parsingFile?: boolean;
  matchingLoading?: boolean;
}

export const JobDescriptionSection = ({ 
  messages, 
  activeChatId, 
  loading,
  sendingMessage = false,
  uploadingFile = false,
  parsingFile = false,
  matchingLoading = false
}: JobDescriptionSectionProps): JSX.Element => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage, uploadingFile, parsingFile, matchingLoading]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine what thinking message to show
  const getThinkingMessage = () => {
    if (uploadingFile) return "Uploading your file...";
    if (parsingFile) return "Extracting text from your document...";
    if (matchingLoading) return "Analyzing resumes and finding the best matches...";
    if (sendingMessage) return "AI is thinking...";
    return null;
  };

  const thinkingMessage = getThinkingMessage();

  if (loading && !activeChatId) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!activeChatId) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-500 text-2xl font-medium">AI</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to IntrvuRecruiter</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Start a new job search conversation to find the perfect candidates for your role. 
            I'll help you analyze requirements and match them with our talent pool.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-800 mb-2">I can help you with:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Analyzing job requirements</li>
              <li>• Finding matching candidates</li>
              <li>• Evaluating candidate profiles</li>
              <li>• Providing recruitment insights</li>
              <li>• Answering hiring questions</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-4">
        <div className="flex justify-start">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-white text-xs font-medium">AI</span>
          </div>
          <div className="max-w-lg">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">
                  Hello! I'm your AI recruitment assistant. Please share the requirements for the role or position you are looking to hire for, and I'll help you find the best matching candidates from our talent pool.
                </p>
              </CardContent>
            </Card>
            <div className="mt-1 ml-2">
              <span className="text-xs text-gray-500">AI-powered candidate search</span>
            </div>
          </div>
        </div>

        {/* Show thinking indicator if processing */}
        {thinkingMessage && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
            <div className="max-w-lg">
              <Card className="bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed text-blue-700">
                    {thinkingMessage}
                  </p>
                </CardContent>
              </Card>
              <div className="mt-1 ml-2">
                <span className="text-xs text-blue-500">Processing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-4">
      {/* Initial AI greeting if this is the first conversation */}
      {messages.length > 0 && messages[0].type === 'user' && (
        <div className="flex justify-start">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-white text-xs font-medium">AI</span>
          </div>
          <div className="max-w-lg">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">
                  Hello! I'm your AI recruitment assistant. Please share the requirements for the role or position you are looking to hire for, and I'll help you find the best matching candidates from our talent pool.
                </p>
              </CardContent>
            </Card>
            <div className="mt-1 ml-2">
              <span className="text-xs text-gray-500">AI-powered candidate search</span>
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
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
                <span className="text-xs text-gray-500">
                  You - {formatTime(message.created_at)}
                </span>
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
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
              </CardContent>
            </Card>

            {message.type === "ai" && (
              <div className="mt-1 ml-2">
                <span className="text-xs text-gray-500">
                  AI-powered candidate analysis - {formatTime(message.created_at)}
                </span>
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

      {/* Show thinking indicator if processing */}
      {thinkingMessage && (
        <div className="flex justify-start">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
          <div className="max-w-lg">
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-blue-700">
                  {thinkingMessage}
                </p>
              </CardContent>
            </Card>
            <div className="mt-1 ml-2">
              <span className="text-xs text-blue-500">Processing...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};