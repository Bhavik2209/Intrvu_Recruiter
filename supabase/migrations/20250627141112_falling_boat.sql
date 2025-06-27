/*
  # Allow anonymous candidate submissions

  1. Security Changes
    - Update RLS policy to allow anonymous users to insert candidate records
    - This enables the candidate landing page to work for unauthenticated users
    - Maintains security by only allowing INSERT operations for anonymous users
    - All other operations (SELECT, UPDATE, DELETE) still require authentication

  2. Policy Updates
    - Remove the existing restrictive INSERT policy
    - Add new policy that allows both authenticated and anonymous users to insert candidates
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON candidates;

-- Create a new policy that allows anonymous candidate submissions
CREATE POLICY "Allow candidate submissions"
  ON candidates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure other operations still require authentication
-- (The existing SELECT, UPDATE, DELETE policies already handle this correctly)