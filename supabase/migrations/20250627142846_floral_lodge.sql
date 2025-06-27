/*
  # Automated Resume Processing Setup

  1. Extensions
    - Enable pg_net extension for HTTP requests from database

  2. Functions
    - Create function to call resume-text-extractor Edge Function
    - Handle HTTP requests to process resume text extraction

  3. Triggers
    - Automatically trigger resume processing when candidate is inserted
    - Only process when resume_url is provided
*/

-- Enable the pg_net extension for making HTTP requests from the database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to process resume text extraction
CREATE OR REPLACE FUNCTION process_resume_extraction()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  supabase_anon_key text;
BEGIN
  -- Only process if resume_url is provided and status is pending
  IF NEW.resume_url IS NOT NULL AND NEW.status = 'pending' THEN
    
    -- Get Supabase URL and anon key from environment
    -- These should be set as database secrets in your Supabase project
    supabase_url := current_setting('app.settings.supabase_url', true);
    supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    -- If environment variables are not set, use default values
    -- You should set these as secrets in your Supabase project settings
    IF supabase_url IS NULL OR supabase_url = '' THEN
      supabase_url := 'https://nhattlsxliahryrnjqmn.supabase.co';
    END IF;
    
    IF supabase_anon_key IS NULL OR supabase_anon_key = '' THEN
      supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYXR0bHN4bGlhaHJ5cm5qcW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzIxOTUsImV4cCI6MjA2NTMwODE5NX0.DnwD2x7ik8ldk1N1MEvRfzx881FQvN1JlMrPmy3FKIc';
    END IF;
    
    -- Make HTTP request to resume-text-extractor Edge Function
    SELECT INTO request_id net.http_post(
      url := supabase_url || '/functions/v1/resume-text-extractor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'resume_url', NEW.resume_url,
        'candidate_id', NEW.id
      )
    );
    
    -- Log the request (optional, for debugging)
    RAISE NOTICE 'Resume processing request sent for candidate %, request_id: %', NEW.id, request_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically process resumes when candidates are inserted
DROP TRIGGER IF EXISTS trigger_process_resume_extraction ON candidates;

CREATE TRIGGER trigger_process_resume_extraction
  AFTER INSERT ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION process_resume_extraction();

-- Create trigger to also process resumes when resume_url is updated
DROP TRIGGER IF EXISTS trigger_process_resume_extraction_update ON candidates;

CREATE TRIGGER trigger_process_resume_extraction_update
  AFTER UPDATE OF resume_url ON candidates
  FOR EACH ROW
  WHEN (OLD.resume_url IS DISTINCT FROM NEW.resume_url AND NEW.resume_url IS NOT NULL)
  EXECUTE FUNCTION process_resume_extraction();