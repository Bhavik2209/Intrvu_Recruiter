import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FigmaDesign } from "./screens/FigmaDesign/FigmaDesign";
import { SignIn, SignUp } from "./screens/Auth";
import { CandidateLandingPage } from "./screens/LandingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default landing page - accessible to everyone */}
      <Route path="/" element={<CandidateLandingPage />} />
      
      {/* Public routes - only accessible when not authenticated */}
      <Route 
        path="/signin" 
        element={user ? <Navigate to="/recruitment" replace /> : <SignIn />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/recruitment" replace /> : <SignUp />} 
      />
      
      {/* Protected recruitment dashboard - only accessible when authenticated */}
      <Route 
        path="/recruitment" 
        element={
          <ProtectedRoute>
            <FigmaDesign />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route - redirect to landing page */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);