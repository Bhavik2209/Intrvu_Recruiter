import { SendIcon, PaperclipIcon, LogOutIcon, ChevronLeftIcon, ChevronRightIcon, FileDownIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { AutoResizeTextarea } from "../../components/AutoResizeTextarea";
import { FileUploadArea, FileUploadAreaRef } from "../../components/FileUploadArea";
import { WelcomePopup } from "../../components/WelcomePopup";
import { CandidateSearchSection } from "./sections/CandidateSearchSection";
import { JobDescriptionSection } from "./sections/JobDescriptionSection";
import { MatchingCandidatesSection } from "./sections/MatchingCandidatesSection";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { exportMatchingResultsToPDF } from "../../utils/pdfExport";

export const FigmaDesign = (): JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCandidatesCollapsed, setIsCandidatesCollapsed] = useState(true); // Start collapsed
  const [messageInput, setMessageInput] = useState("");
  const [fileUploadError, setFileUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const fileUploadRef = useRef<FileUploadAreaRef>(null);
  
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

  // Show welcome popup for first-time users
  useEffect(() => {
    if (chats.length === 0 && !loading) {
      setShowWelcomePopup(true);
    }
  }, [chats.length, loading]);

  // Auto-expand candidates column when matching results are found
  useEffect(() => {
    if (matchingResults && matchingResults.matches && matchingResults.matches.length > 0) {
      setIsCandidatesCollapsed(false);
    }
  }, [matchingResults]);

  const handleWelcomePopupClose = async () => {
    setShowWelcomePopup(false);
    
    // If no chats exist (first-time user), create a new chat
    if (chats.length === 0) {
      console.log('First-time user detected, creating initial chat...');
      await createNewChat("New Job Search");
    }
  };

  const handleFileUpload = () => {
    setFileUploadError("");
    setUploadStatus("");
    // Trigger the file dialog directly
    fileUploadRef.current?.openFileDialog();
  };

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
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
    // Submit on Enter (without Shift), allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleExportResults = async () => {
    if (!matchingResults || matchingResults.matches.length === 0) {
      alert('No matching candidates to export. Please run a candidate search first.');
      return;
    }

    setExportingPDF(true);
    
    try {
      // Get the current chat title for the job position
      const currentChat = chats.find(chat => chat.id === activeChatId);
      const jobTitle = currentChat?.title || 'Job Search';
      
      // Export to PDF
      exportMatchingResultsToPDF(matchingResults, jobTitle);
      
      // Show success message
      console.log('PDF export completed successfully');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export results. Please try again.');
    } finally {
      setExportingPDF(false);
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
      {/* Welcome Popup */}
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={handleWelcomePopupClose} 
      />

      {/* Hidden File Upload Area */}
      <div className="hidden">
        <FileUploadArea
          ref={fileUploadRef}
          onFileSelect={handleJobDescriptionUpload}
          onError={handleFileUploadError}
          isLoading={uploadingFile || parsingFile}
        />
      </div>

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
                className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {(uploadStatus || processingStatus || fileUploadError) && (
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="max-w-2xl mx-auto">
              {/* Status Messages */}
              {uploadStatus && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">{uploadStatus}</p>
                </div>
              )}
              
              {processingStatus && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <p className="text-sm text-blue-700">{processingStatus}</p>
                  </div>
                </div>
              )}
              
              {fileUploadError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{fileUploadError}</p>
                </div>
              )}
              
              {(uploadStatus || processingStatus || fileUploadError) && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFileUploadError("");
                      setUploadStatus("");
                    }}
                    disabled={uploadingFile || parsingFile}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <JobDescriptionSection 
            messages={messages}
            activeChatId={activeChatId}
            loading={loading}
            sendingMessage={sendingMessage}
            uploadingFile={uploadingFile}
            parsingFile={parsingFile}
            matchingLoading={matchingLoading}
          />
        </div>

        {/* Enhanced Input Area with Multiline Support */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-end gap-2 bg-gray-100 rounded-lg p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleFileUpload}
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex-shrink-0 self-end mb-1"
                title="Upload job description file"
                disabled={uploadingFile || parsingFile}
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <AutoResizeTextarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="border-none bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[20px]"
                  placeholder={
                    activeChatId 
                      ? "Describe your job requirements, ask questions about candidates or refine your search..."
                      : "Start a new job search conversation..."
                  }
                  disabled={sendingMessage || uploadingFile || parsingFile}
                  minRows={1}
                  maxRows={8}
                />
              </div>
              
              <Button 
                type="submit"
                size="icon" 
                className="bg-blue-500 hover:bg-blue-600 rounded-full flex-shrink-0 h-8 w-8 self-end mb-1"
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
          <div className="h-full flex flex-col items-center justify-center py-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCandidatesCollapsed(false)}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 rotate-180"
              title="Expand candidates panel"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            {/* Vertical Text */}
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="text-sm font-medium text-gray-600 whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
              >
                Matching Candidates
              </div>
            </div>
            
            {/* Candidate Count Indicator */}
            {hasMatches && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-green-700">{candidateCount}</span>
                </div>
                <div className="text-xs text-gray-500 text-center transform rotate-90 whitespace-nowrap">
                  Found
                </div>
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
                     hasMatches ? `${candidateCount} candidates found (50%+ match)` : 
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
                className="w-full flex items-center justify-center gap-2"
                disabled={!hasMatches || exportingPDF}
                onClick={handleExportResults}
              >
                {exportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDownIcon className="h-4 w-4" />
                    Export Results (PDF)
                  </>
                )}
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