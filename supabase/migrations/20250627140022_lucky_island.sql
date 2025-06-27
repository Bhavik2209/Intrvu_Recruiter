/*
  # Create resumes storage bucket

  1. Storage Setup
    - Create 'resumes' bucket for storing candidate resume files
    - Set bucket to be publicly accessible for file uploads
    - Configure appropriate policies for file operations

  2. Security
    - Allow authenticated users to upload files
    - Allow public read access to uploaded files
    - Restrict delete operations to authenticated users only
*/

-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow public read access to resume files
CREATE POLICY "Allow public read access to resumes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');

-- Allow authenticated users to update file metadata
CREATE POLICY "Allow authenticated users to update resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes');