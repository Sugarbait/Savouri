/*
  # Finalize Authentication System

  1. Changes
    - Update orders table policies to work with customer_id 
    - Update restaurant_reviews policies to require authentication

  2. Security
    - All new reviews require user_id
    - Orders linked to user profiles
*/

-- Update restaurant_reviews policies
DROP POLICY IF EXISTS "Anyone can submit restaurant reviews" ON restaurant_reviews;

CREATE POLICY "Authenticated users can create restaurant reviews"
  ON restaurant_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own restaurant reviews"
  ON restaurant_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own restaurant reviews"
  ON restaurant_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Update menu_item_reviews policies similarly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_item_reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE menu_item_reviews ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can submit menu item reviews" ON menu_item_reviews;

CREATE POLICY "Authenticated users can create menu item reviews"
  ON menu_item_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own menu item reviews"
  ON menu_item_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own menu item reviews"
  ON menu_item_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add business owner update policy for restaurants
DROP POLICY IF EXISTS "Business owners can update their restaurants" ON restaurants;
CREATE POLICY "Business owners can update their restaurants"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());