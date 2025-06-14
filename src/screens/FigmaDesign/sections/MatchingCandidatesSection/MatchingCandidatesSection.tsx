import { ChevronLeftIcon, ChevronRightIcon, MoreVerticalIcon, PlusIcon, Edit2Icon, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Chat } from "../../../../lib/supabase";

interface MatchingCandidatesSectionProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat: () => Promise<Chat | null>;
  onUpdateChatTitle: (chatId: string, title: string) => Promise<void>;
  onDeleteChat: (chatId: string) => Promise<void>;
  loading: boolean;
}

export const MatchingCandidatesSection = ({ 
  isCollapsed, 
  onToggleCollapse,
  chats,
  activeChatId,
  onSelectChat,
  onCreateNewChat,
  onUpdateChatTitle,
  onDeleteChat,
  loading
}: MatchingCandidatesSectionProps): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = async (id: string) => {
    if (editingTitle.trim()) {
      await onUpdateChatTitle(id, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDelete = async (id: string) => {
    await onDeleteChat(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleNewChat = async () => {
    setCreatingChat(true);
    try {
      await onCreateNewChat();
    } finally {
      setCreatingChat(false);
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-full h-full flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleCollapse(false)}
          className="mb-4"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          {chats.slice(0, 6).map((chat) => (
            <div
              key={chat.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer ${
                chat.id === activeChatId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              title={chat.title}
              onClick={() => onSelectChat(chat.id)}
            >
              {chat.title.charAt(0).toUpperCase()}
            </div>
          ))}
          {chats.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              +{chats.length - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Job Searches</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleCollapse(true)}
            className="h-6 w-6"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
          onClick={handleNewChat}
          disabled={creatingChat}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {creatingChat ? 'Creating...' : 'New Search'}
        </Button>
      </div>

      {/* Search List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm mb-4">No job searches yet</p>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
              onClick={handleNewChat}
              disabled={creatingChat}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Start Your First Search
            </Button>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                chat.id === activeChatId ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
              }`}
              onClick={() => editingId !== chat.id && onSelectChat(chat.id)}
            >
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
                
                {editingId === chat.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleSaveRename(chat.id)}
                    onKeyDown={(e) => handleKeyPress(e, chat.id)}
                    className="flex-1 text-sm font-medium text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 mr-2"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-800 truncate flex-1">
                    {chat.title}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVerticalIcon className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(chat.id, chat.title);
                      }}
                      className="text-sm"
                    >
                      <Edit2Icon className="h-3 w-3 mr-2" />
                      Rename chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat.id);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-3 w-3 mr-2" />
                      Delete chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="ml-6">
                <span className="text-xs text-gray-500">
                  Last updated: {formatLastUpdated(chat.updated_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};