/*
  # Create candidates table

  1. New Tables
    - `candidates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users - links to recruiter who added the candidate)
      - `name` (text, candidate's full name)
      - `email` (text, candidate's email address)
      - `resume_url` (text, URL/path to the resume file in Supabase Storage)
      - `resume_filename` (text, original filename of the resume)
      - `extracted_data` (jsonb, scraped/parsed data from resume)
      - `status` (text, processing status: pending, processing, completed, failed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `candidates` table
    - Add policies for authenticated users to manage their own candidates
    - Users can only access candidates they've added

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on email for candidate lookups
    - Add index on status for filtering
*/

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  resume_url text,
  resume_filename text,
  extracted_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own candidates"
  ON candidates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidates"
  ON candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates"
  ON candidates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates"
  ON candidates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS candidates_user_id_idx ON candidates(user_id);
CREATE INDEX IF NOT EXISTS candidates_email_idx ON candidates(email);
CREATE INDEX IF NOT EXISTS candidates_status_idx ON candidates(status);
CREATE INDEX IF NOT EXISTS candidates_created_at_idx ON candidates(created_at DESC);

-- Add trigger for updated_at column
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint to prevent duplicate candidates per user
CREATE UNIQUE INDEX IF NOT EXISTS candidates_user_email_unique 
  ON candidates(user_id, email);