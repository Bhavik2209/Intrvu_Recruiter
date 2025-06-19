import { SendIcon, PaperclipIcon, LogOutIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FileUploadArea } from "../../components/FileUploadArea";
import { CandidateSearchSection } from "./sections/CandidateSearchSection";
import { JobDescriptionSection } from "./sections/JobDescriptionSection";
import { MatchingCandidatesSection } from "./sections/MatchingCandidatesSection";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";

export const FigmaDesign = (): JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCandidatesCollapsed, setIsCandidatesCollapsed] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const { user, userProfile, signOut } = useAuth();
  
  const {
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    loading,
    sendingMessage,
    uploadingFile,
    parsingFile,
    createNewChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    uploadJobDescriptionFile,
    matchingResults,
    matchingLoading,
  } = useChat(user?.id);

  const handleFileUpload = () => {
    setShowFileUpload(true);
    setFileUploadError("");
    setUploadStatus("");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleJobDescriptionUpload = async (file: File) => {
    setFileUploadError("");
    setUploadStatus("JD uploaded successfully.");
    
    // If no active chat, create one first
    if (!activeChatId) {
      const newChat = await createNewChat("New Job Search");
      if (!newChat) {
        setFileUploadError("Failed to create new chat");
        setUploadStatus("");
        return;
      }
    }

    try {
      const result = await uploadJobDescriptionFile(file);
      
      if (!result.success) {
        setFileUploadError(result.error || "Unable to process the file. Please check the content and try again.");
        setUploadStatus("");
      } else {
        setUploadStatus("");
        setShowFileUpload(false);
      }
    } catch (error) {
      setFileUploadError("Unable to process the file. Please check the content and try again.");
      setUploadStatus("");
    }
  };

  const handleFileUploadError = (error: string) => {
    setFileUploadError(error);
    setUploadStatus("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sendingMessage) return;

    // If no active chat, create one first
    if (!activeChatId) {
      const newChat = await createNewChat("New Job Search");
      if (!newChat) return;
    }

    await sendMessage(messageInput);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const displayName = userProfile?.name || user?.email || 'User';
  const candidateCount = matchingResults?.matches?.length || 0;
  const hasMatches = candidateCount > 0;

  // Determine current processing status
  const getProcessingStatus = () => {
    if (uploadingFile) return "Uploading file...";
    if (parsingFile) return "Parsing now...";
    return "";
  };

  const processingStatus = getProcessingStatus();

  return (
    <div className="bg-gray-50 h-screen flex overflow-hidden">
      {/* Left Sidebar - Job Searches */}
      <div className={`${isSidebarCollapsed ? 'w-12' : 'w-[200px]'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
        <MatchingCandidatesSection 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onCreateNewChat={createNewChat}
          onUpdateChatTitle={updateChatTitle}
          onDeleteChat={deleteChat}
          loading={loading}
        />
      </div>

      {/* Middle Section - Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-gray-800">IntrvuRecruiter</h1>
              <p className="text-sm text-gray-500">
                {activeChatId ? 
                  chats.find(chat => chat.id === activeChatId)?.title || 'AI-powered candidate search' :
                  'AI-powered candidate search'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Welcome, {displayName}</p>
                <p className="text-xs text-gray-500">Find the perfect candidates</p>
              </div>
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

        {/* File Upload Area */}
        {showFileUpload && (
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="max-w-2xl mx-auto">
              <FileUploadArea
                onFileSelect={handleJobDescriptionUpload}
                onError={handleFileUploadError}
                isLoading={uploadingFile || parsingFile}
              />
              
              {/* Status Messages */}
              {uploadStatus && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">{uploadStatus}</p>
                </div>
              )}
              
              {processingStatus && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <p className="text-sm text-blue-700">{processingStatus}</p>
                  </div>
                </div>
              )}
              
              {fileUploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{fileUploadError}</p>
                </div>
              )}
              
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowFileUpload(false);
                    setFileUploadError("");
                    setUploadStatus("");
                  }}
                  disabled={uploadingFile || parsingFile}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <JobDescriptionSection 
            messages={messages}
            activeChatId={activeChatId}
            loading={loading}
          />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleFileUpload}
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex-shrink-0"
                title="Upload job description file"
                disabled={uploadingFile || parsingFile}
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border-none bg-transparent"
                placeholder={
                  activeChatId 
                    ? "Describe your job requirements, ask questions about candidates or refine your search..."
                    : "Start a new job search conversation..."
                }
                disabled={sendingMessage || uploadingFile || parsingFile}
              />
              <Button 
                type="submit"
                size="icon" 
                className="bg-blue-500 hover:bg-blue-600 rounded-full flex-shrink-0"
                disabled={sendingMessage || !messageInput.trim() || uploadingFile || parsingFile}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Matching Candidates */}
      <div className={`${isCandidatesCollapsed ? 'w-12' : 'w-[420px]'} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
        {isCandidatesCollapsed ? (
          /* Collapsed State */
          <div className="h-full flex flex-col items-center py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCandidatesCollapsed(false)}
              className="mb-4 rotate-180"
              title="Expand candidates panel"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="writing-mode-vertical text-sm font-medium text-gray-600 transform rotate-180">
              Matching Candidates
            </div>
            {hasMatches && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-green-700">{candidateCount}</span>
                </div>
                <div className="text-xs text-gray-500 text-center">Found</div>
              </div>
            )}
          </div>
        ) : (
          /* Expanded State */
          <>
            {/* Matching Candidates Header */}
            <div className="bg-blue-500 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">Matching Candidates</h2>
                  <p className="text-sm text-blue-100">
                    {matchingLoading ? 'Analyzing resumes...' : 
                     hasMatches ? `${candidateCount} candidates found (75%+ match)` : 
                     'Start a search to find candidates'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCandidatesCollapsed(true)}
                  className="h-8 w-8 text-white hover:bg-blue-600"
                  title="Collapse candidates panel"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={!hasMatches}
              >
                Export Results
              </Button>
            </div>

            {/* Candidates List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <CandidateSearchSection 
                matchResults={matchingResults?.matches}
                loading={matchingLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};