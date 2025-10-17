/*
  # Add Button Color to Restaurants

  1. Changes
    - Add `button_color` column to `restaurants` table
    - Default to orange color (#EA580C) to match current design
    - Allow restaurants to customize their "View Menu" button color

  2. Notes
    - This is a non-breaking change with a sensible default
    - Existing restaurants will get the default orange color
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'button_color'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN button_color text NOT NULL DEFAULT '#EA580C';
  END IF;
END $$;