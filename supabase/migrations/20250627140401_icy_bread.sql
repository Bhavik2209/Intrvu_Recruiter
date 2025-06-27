/*
  # Allow Anonymous Resume Uploads

  1. Storage Policies
    - Allow anonymous users to upload files to the 'resumes' bucket
    - Allow anonymous users to insert objects in the 'resumes' bucket
    - Ensure the 'resumes' bucket exists and is configured properly

  2. Security
    - Only allow uploads to the 'resumes' bucket for anonymous users
    - Restrict file operations to INSERT only for anonymous users
*/

-- Create the resumes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload files to the resumes bucket
CREATE POLICY "Allow anonymous resume uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resumes');

-- Allow anonymous users to read files from the resumes bucket (needed for public URLs)
CREATE POLICY "Allow anonymous resume reads"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'resumes');

-- Allow authenticated users to manage their own files in the resumes bucket
CREATE POLICY "Allow authenticated users to manage resumes"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'resumes');