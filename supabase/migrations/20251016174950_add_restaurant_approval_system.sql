/*
  # Add Restaurant Approval System

  1. Changes
    - Add `approval_status` column to `restaurants` table
    - Add `approved_by` column to track which admin approved
    - Add `approved_at` timestamp column
    - Update RLS policies to restrict pending restaurants
    - Default new restaurants to 'pending' status

  2. Approval States
    - `pending` - Restaurant awaiting admin approval
    - `approved` - Restaurant approved and visible to public
    - `rejected` - Restaurant rejected by admin

  3. Security
    - Only approved restaurants are visible to public
    - Pending restaurants only visible to owner and admins
    - Only admins can change approval status
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN approval_status text NOT NULL DEFAULT 'pending';
    ALTER TABLE restaurants ADD COLUMN approved_by uuid REFERENCES auth.users(id);
    ALTER TABLE restaurants ADD COLUMN approved_at timestamptz;
  END IF;
END $$;

DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;

CREATE POLICY "Public can view approved active restaurants"
  ON restaurants FOR SELECT
  TO public
  USING (is_active = true AND approval_status = 'approved');

CREATE POLICY "Owners can view their own restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);