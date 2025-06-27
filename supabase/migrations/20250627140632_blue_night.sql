/*
  # Create storage policies for resumes bucket and allow anonymous uploads

  1. Storage Bucket
    - Ensure 'resumes' bucket exists and is public

  2. Storage Policies
    - Allow anonymous users to upload resume files
    - Allow public read access to resume files
    - Allow authenticated users to manage their files
    - Allow authenticated users to update and delete files

  3. Security
    - Anonymous users can only INSERT files to resumes bucket
    - Public read access for resume files
    - Authenticated users have full CRUD access
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