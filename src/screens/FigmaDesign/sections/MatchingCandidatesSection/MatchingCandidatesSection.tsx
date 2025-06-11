import { ChevronLeftIcon, ChevronRightIcon, MoreVerticalIcon, PlusIcon, Edit2Icon, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

interface MatchingCandidatesSectionProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export const MatchingCandidatesSection = ({ 
  isCollapsed, 
  onToggleCollapse 
}: MatchingCandidatesSectionProps): JSX.Element => {
  const [candidateSearches, setCandidateSearches] = useState([
    {
      id: 1,
      title: "Senior React Developer",
      lastUpdated: "Today, 2:45 PM",
      isActive: true,
    },
    {
      id: 2,
      title: "DevOps Engineer",
      lastUpdated: "Yesterday",
      isActive: false,
    },
    {
      id: 3,
      title: "UX Designer",
      lastUpdated: "Oct 12, 2023",
      isActive: false,
    },
    {
      id: 4,
      title: "Product Manager",
      lastUpdated: "Oct 10, 2023",
      isActive: false,
    },
    {
      id: 5,
      title: "Backend Developer",
      lastUpdated: "Oct 8, 2023",
      isActive: false,
    },
    {
      id: 6,
      title: "Data Scientist",
      lastUpdated: "Oct 5, 2023",
      isActive: false,
    },
    {
      id: 7,
      title: "Mobile Developer",
      lastUpdated: "Oct 3, 2023",
      isActive: false,
    },
    {
      id: 8,
      title: "QA Engineer",
      lastUpdated: "Oct 1, 2023",
      isActive: false,
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleRename = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: number) => {
    setCandidateSearches(searches =>
      searches.map(search =>
        search.id === id ? { ...search, title: editingTitle } : search
      )
    );
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDelete = (id: number) => {
    setCandidateSearches(searches => searches.filter(search => search.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      handleCancelRename();
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
          {candidateSearches.slice(0, 6).map((search) => (
            <div
              key={search.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                search.isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
              title={search.title}
            >
              {search.title.charAt(0)}
            </div>
          ))}
          {candidateSearches.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
              +{candidateSearches.length - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Candidate Searches</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleCollapse(true)}
            className="h-6 w-6"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Search
        </Button>
      </div>

      {/* Search List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {candidateSearches.map((search) => (
          <div
            key={search.id}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              search.isActive ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
            }`}
          >
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
              
              {editingId === search.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveRename(search.id)}
                  onKeyDown={(e) => handleKeyPress(e, search.id)}
                  className="flex-1 text-sm font-medium text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 mr-2"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium text-gray-800 truncate flex-1">
                  {search.title}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                    <MoreVerticalIcon className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => handleRename(search.id, search.title)}
                    className="text-sm"
                  >
                    <Edit2Icon className="h-3 w-3 mr-2" />
                    Rename chat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(search.id)}
                    className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3 w-3 mr-2" />
                    Delete chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="ml-6">
              <span className="text-xs text-gray-500">Last updated: {search.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};