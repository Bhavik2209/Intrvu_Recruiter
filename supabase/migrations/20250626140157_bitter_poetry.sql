/*
  # Add matching_results column to chats table

  1. Schema Changes
    - Add `matching_results` column to `chats` table to store candidate matching results
    - Column type is jsonb to store the MatchingResults object

  2. Notes
    - This will allow each chat to persist its matching results
    - Results will be automatically deleted when chat is deleted due to CASCADE
*/

-- Add matching_results column to chats table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chats' AND column_name = 'matching_results'
  ) THEN
    ALTER TABLE chats ADD COLUMN matching_results jsonb;
  END IF;
END $$;