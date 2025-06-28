import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { FileUploadArea, FileUploadAreaRef } from '../../components/FileUploadArea';
import { BoltBadge } from '../../components/BoltBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { 
  CheckCircleIcon, 
  UsersIcon, 
  SearchIcon, 
  TrendingUpIcon,
  BrainCircuitIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  UploadIcon,
  UserCheckIcon,
  BuildingIcon,
  TargetIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const CandidateLandingPage = (): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileUploadRef = useRef<FileUploadAreaRef>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSubmitError('');
  };

  const handleFileError = (error: string) => {
    setSubmitError(error);
    setSelectedFile(null);
  };

  const handleSubmitResume = async () => {
    if (!candidateName.trim() || !candidateEmail.trim() || !selectedFile) {
      setSubmitError('Please fill in all fields and select a resume file.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${candidateName.replace(/\s+/g, '_')}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error('Failed to upload resume file');
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Create candidate record
      const { error: candidateError } = await supabase
        .from('candidates')
        .insert({
          name: candidateName.trim(),
          email: candidateEmail.trim(),
          resume_url: publicUrl,
          resume_filename: selectedFile.name,
          status: 'pending'
        });

      if (candidateError) {
        // If it's a duplicate email error, show a friendly message
        if (candidateError.code === '23505') {
          throw new Error('This email is already registered in our system. Thank you for your interest!');
        }
        throw new Error('Failed to submit your information');
      }

      setSubmitSuccess(true);
      setCandidateName('');
      setCandidateEmail('');
      setSelectedFile(null);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setIsDialogOpen(false);
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting resume:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit resume. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCandidateName('');
    setCandidateEmail('');
    setSelectedFile(null);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">IntrvuRecruiter</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
              <BoltBadge size="lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Where Top Talent Meets
              <span className="text-blue-600 block">Smart Recruiters</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who trust IntrvuRecruiter to connect them with their next career opportunity, 
              and help recruiters find the perfect candidates with AI-powered matching.
            </p>
            
            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={resetForm}
                  >
                    <UploadIcon className="mr-2 h-5 w-5" />
                    Submit Your Resume
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Join Our Talent Pool</DialogTitle>
                    <DialogDescription className="text-center">
                      Submit your resume to be discovered by top recruiters and hiring managers.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {submitSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-700 mb-2">Successfully Submitted!</h3>
                      <p className="text-gray-600">
                        Thank you for joining our talent pool. Recruiters will be able to discover your profile soon.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="Enter your full name"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          placeholder="Enter your email address"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resume File *
                        </label>
                        <FileUploadArea
                          ref={fileUploadRef}
                          onFileSelect={handleFileSelect}
                          onError={handleFileError}
                          isLoading={isSubmitting}
                        />
                      </div>
                      
                      {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                          {submitError}
                        </div>
                      )}
                      
                      <Button
                        onClick={handleSubmitResume}
                        disabled={isSubmitting || !candidateName.trim() || !candidateEmail.trim() || !selectedFile}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          'Submit Resume'
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        By submitting, you agree to be contacted by recruiters about relevant opportunities.
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <Link to="/signup">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
                >
                  <UserCheckIcon className="mr-2 h-5 w-5" />
                  I'm a Recruiter
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-gray-600">Active Candidates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Partner Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">95%</div>
                <div className="text-gray-600">Match Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24h</div>
                <div className="text-gray-600">Average Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Job Seekers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Job Seekers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get discovered by top recruiters and land your dream job with our AI-powered matching platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BrainCircuitIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Matching</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI analyzes your skills, experience, and preferences to match you with the most relevant opportunities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Privacy Protected</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your information is secure and only shared with recruiters when you're a strong match for their requirements.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClockIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Passive & Active Search</h3>
                <p className="text-gray-600 leading-relaxed">
                  Whether you're actively job hunting or just open to opportunities, we'll connect you with the right roles.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
                  onClick={resetForm}
                >
                  Join Our Talent Pool
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Recruiters & Hiring Managers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect candidates faster with our intelligent recruitment platform powered by advanced AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Candidate Search</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload job descriptions and get instant matches from our pool of qualified candidates with detailed compatibility scores.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Reduce Time-to-Hire</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cut your recruitment time by 70% with pre-screened candidates and AI-powered compatibility analysis.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TargetIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Quality Over Quantity</h3>
                <p className="text-gray-600 leading-relaxed">
                  Focus on the best matches with detailed skill analysis, experience mapping, and cultural fit indicators.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
              >
                Start Finding Candidates
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose IntrvuRecruiter?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with human expertise to deliver exceptional results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">95% Match Accuracy</h3>
              <p className="text-gray-600 text-sm">Industry-leading precision in candidate-job matching</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">10K+ Active Candidates</h3>
              <p className="text-gray-600 text-sm">Diverse pool of qualified professionals</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BuildingIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">500+ Companies</h3>
              <p className="text-gray-600 text-sm">Trusted by leading organizations worldwide</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">24h Response Time</h3>
              <p className="text-gray-600 text-sm">Fast turnaround on candidate searches</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful recruiters and candidates who trust IntrvuRecruiter for their career and hiring needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg"
              >
                Get Started Free
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-blue-600 bg-white hover:bg-gray-100 hover:text-blue-700 px-8 py-4 text-lg font-semibold rounded-lg"
                  onClick={resetForm}
                >
                  Submit Resume
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-bold">IntrvuRecruiter</h3>
                <BoltBadge size="sm" />
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting top talent with leading companies through intelligent AI-powered matching.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Submit Resume</li>
                <li>Browse Opportunities</li>
                <li>Career Resources</li>
                <li>Success Stories</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Find Candidates</li>
                <li>Post Jobs</li>
                <li>Pricing Plans</li>
                <li>Enterprise Solutions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 IntrvuRecruiter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};