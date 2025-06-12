import { SendIcon, PaperclipIcon, LogOutIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CandidateSearchSection } from "./sections/CandidateSearchSection";
import { JobDescriptionSection } from "./sections/JobDescriptionSection";
import { MatchingCandidatesSection } from "./sections/MatchingCandidatesSection";
import { useAuth } from "../../hooks/useAuth";

export const FigmaDesign = (): JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  const handleFileUpload = () => {
    // Create a hidden file input and trigger it
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Files selected:', Array.from(files).map(f => f.name));
        // Handle file upload logic here
      }
    };
    fileInput.click();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="bg-gray-50 h-screen flex overflow-hidden">
      {/* Left Sidebar - Candidate Searches */}
      <div className={`${isSidebarCollapsed ? 'w-12' : 'w-[200px]'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
        <MatchingCandidatesSection 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
        />
      </div>

      {/* Middle Section - Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-gray-800">IntrvuRecruiter</h1>
              <p className="text-sm text-gray-500">AI-powered candidate search</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <JobDescriptionSection />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileUpload}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex-shrink-0"
              title="Attach files"
            >
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Input
              className="flex-1 border-none bg-transparent"
              placeholder="Describe your job requirements, ask questions about candidates or refine your search..."
            />
            <Button size="icon" className="bg-blue-500 hover:bg-blue-600 rounded-full flex-shrink-0">
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Candidates */}
      <div className={`${isSidebarCollapsed ? 'w-[420px]' : 'w-[400px]'} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
        {/* Matching Candidates Header */}
        <div className="bg-blue-500 text-white p-4 flex-shrink-0">
          <h2 className="font-medium">Matching Candidates</h2>
          <p className="text-sm text-blue-100">3 candidates found</p>
        </div>
        
        {/* Export Button */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <Button variant="outline" size="sm" className="ml-auto flex">
            Export
          </Button>
        </div>

        {/* Candidates List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <CandidateSearchSection />
        </div>
      </div>
    </div>
  );
};