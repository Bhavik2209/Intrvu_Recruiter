import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { UploadIcon, FileTextIcon, XIcon } from 'lucide-react';

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
  className?: string;
}

export interface FileUploadAreaRef {
  openFileDialog: () => void;
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploadArea = forwardRef<FileUploadAreaRef, FileUploadAreaProps>(({ 
  onFileSelect, 
  onError, 
  isLoading = false,
  className = ""
}, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose the openFileDialog function to parent components
  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      fileInputRef.current?.click();
    }
  }));

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      // Also check by extension as a fallback
      const extension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).map(ext => ext.substring(1));
      
      if (!extension || !allowedExtensions.includes(extension)) {
        return "The file is not supported. Please upload files in .pdf, .txt, and .docx formats";
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleFileSelection = (file: File) => {
    const error = validateFile(file);
    if (error) {
      onError(error);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile && !isLoading) {
    return (
      <Card className={`border-2 border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileTextIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <UploadIcon className={`mx-auto h-12 w-12 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {isLoading ? 'Processing...' : 'Upload Job Description'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isLoading 
                  ? 'Please wait while we process your file'
                  : 'Drag and drop your file here, or click to browse'
                }
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports .pdf, .txt, and .docx files (max 10MB)
              </p>
            </div>
            {!isLoading && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose File
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
});

FileUploadArea.displayName = "FileUploadArea";