/*
  # Create storage policies for resumes bucket

  1. Storage Policies
    - Allow authenticated users to upload resume files
    - Allow public read access to resume files
    - Allow authenticated users to update their own files
    - Allow authenticated users to delete their own files

  2. Notes
    - These policies assume the 'resumes' storage bucket has been created
    - The bucket should be created manually in the Supabase Dashboard
*/

-- Create policy to allow authenticated users to upload files to the resumes bucket
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Create policy to allow public read access to resume files
CREATE POLICY "Public can read resume files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Create policy to allow authenticated users to update their own uploaded files
CREATE POLICY "Authenticated users can update resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow authenticated users to delete their own uploaded files
CREATE POLICY "Authenticated users can delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);