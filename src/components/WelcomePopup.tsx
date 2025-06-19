import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { XIcon } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomePopup = ({ isOpen, onClose }: WelcomePopupProps): JSX.Element | null => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardContent className="p-8 relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-4 w-4" />
          </Button>

          {/* AI Avatar */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-500 text-2xl font-medium">AI</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to IntrvuRecruiter</h2>
            <p className="text-gray-600 leading-relaxed">
              Start a new job search conversation to find the perfect candidates for your role. 
              I'll help you analyze requirements and match them with our talent pool.
            </p>
          </div>

          {/* Capabilities list */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-3">I can help you with:</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Analyzing job requirements
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Finding matching candidates
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Evaluating candidate profiles
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Providing recruitment insights
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Answering hiring questions
              </li>
            </ul>
          </div>

          {/* Get started button */}
          <Button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};