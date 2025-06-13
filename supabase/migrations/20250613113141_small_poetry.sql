/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile data
    - Policy ensures users can only create records where the id matches their auth.uid()

  This resolves the RLS violation error when new users try to create their profile.
*/

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);