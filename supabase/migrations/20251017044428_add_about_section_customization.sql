/*
  # Add About Section Customization Fields

  1. Changes
    - Add `about_section_image_url` column to allow custom image in about section
    - Add `show_reserve_table` boolean column to toggle "Reserve a Table" button visibility
    - Both fields are optional and have sensible defaults
  
  2. Notes
    - `about_section_image_url` defaults to NULL (will use default stock image)
    - `show_reserve_table` defaults to TRUE (button shown by default)
    - Existing restaurants will automatically show the reserve button (backwards compatible)
*/

DO $$
BEGIN
  -- Add about_section_image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'about_section_image_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN about_section_image_url text;
  END IF;

  -- Add show_reserve_table column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'show_reserve_table'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN show_reserve_table boolean DEFAULT true;
  END IF;
END $$;