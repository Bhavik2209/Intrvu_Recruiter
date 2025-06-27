/*
  # Storage policies for resumes bucket

  1. Storage Setup
    - Create storage bucket policies for 'resumes' bucket
    - Allow authenticated users to upload files
    - Allow public read access to resume files

  Note: The 'resumes' storage bucket must be created manually in the Supabase Dashboard first.
*/

-- Policy to allow authenticated users to upload files to the resumes bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'authenticated_users_can_upload_resumes',
  'resumes',
  'Authenticated users can upload resumes',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'INSERT',
  '{authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to resume files
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'public_can_read_resumes',
  'resumes',
  'Public can read resume files',
  'true',
  'true',
  'SELECT',
  '{public, authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to update their own uploaded files
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'authenticated_users_can_update_resumes',
  'resumes',
  'Authenticated users can update resumes',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'UPDATE',
  '{authenticated}'
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to delete their own uploaded files
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'authenticated_users_can_delete_resumes',
  'resumes',
  'Authenticated users can delete resumes',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'DELETE',
  '{authenticated}'
) ON CONFLICT (id) DO NOTHING;