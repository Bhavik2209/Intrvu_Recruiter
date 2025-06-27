/*
  # Fix Storage Bucket and Policies for Resume Uploads

  1. Storage Setup
    - Create or update 'resumes' bucket for storing candidate resume files
    - Set bucket to be publicly accessible for file uploads
    - Configure appropriate policies for file operations

  2. Security
    - Allow anonymous users to upload files (for landing page submissions)
    - Allow public read access to uploaded files
    - Allow authenticated users full CRUD operations
*/

-- Create the resumes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous resume uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public resume reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated resume uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated resume updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated resume deletes" ON storage.objects;

-- Allow anonymous users to upload files to the resumes bucket
CREATE POLICY "Allow anonymous resume uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resumes');

-- Allow public read access to resume files
CREATE POLICY "Allow public resume reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow authenticated users to upload files to the resumes bucket
CREATE POLICY "Allow authenticated resume uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow authenticated users to update files in the resumes bucket
CREATE POLICY "Allow authenticated resume updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes');

-- Allow authenticated users to delete files in the resumes bucket
CREATE POLICY "Allow authenticated resume deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');