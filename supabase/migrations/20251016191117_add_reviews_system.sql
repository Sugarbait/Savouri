/*
  # Add Reviews System

  ## Summary
  This migration adds a comprehensive 5-star review system for both restaurants and menu items, including:
  - Restaurant-level reviews with ratings and comments
  - Menu item-level reviews with ratings and comments
  - Average rating calculations
  - Review counts for sorting Customer Favorites by popularity

  ## New Tables Created

  ### `restaurant_reviews`
  - `id` (uuid, primary key) - Unique review identifier
  - `restaurant_id` (uuid, foreign key) - Reference to restaurant
  - `customer_name` (text) - Name of reviewer
  - `customer_email` (text, optional) - Email of reviewer
  - `rating` (integer) - Star rating (1-5)
  - `comment` (text, optional) - Review comment
  - `created_at` (timestamptz) - When review was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `menu_item_reviews`
  - `id` (uuid, primary key) - Unique review identifier
  - `menu_item_id` (uuid, foreign key) - Reference to menu item
  - `restaurant_id` (uuid, foreign key) - Reference to restaurant
  - `customer_name` (text) - Name of reviewer
  - `customer_email` (text, optional) - Email of reviewer
  - `rating` (integer) - Star rating (1-5)
  - `comment` (text, optional) - Review comment
  - `created_at` (timestamptz) - When review was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## New Columns Added

  ### `restaurants` table
  - `average_rating` (numeric) - Calculated average rating
  - `review_count` (integer) - Total number of reviews

  ### `menu_items` table
  - `average_rating` (numeric) - Calculated average rating
  - `review_count` (integer) - Total number of reviews

  ## Security (Row Level Security)
  1. Reviews are publicly readable
  2. Anyone can submit reviews (insert)
  3. Review authors cannot edit/delete (maintains integrity)

  ## Important Notes
  1. Customer Favorites will now sort by average_rating DESC, then review_count DESC
  2. Rating must be between 1 and 5 (enforced by check constraint)
  3. Triggers automatically update average ratings and counts
*/

-- Add rating columns to restaurants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN average_rating numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN review_count integer DEFAULT 0;
  END IF;
END $$;

-- Add rating columns to menu_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN average_rating numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN review_count integer DEFAULT 0;
  END IF;
END $$;

-- Create restaurant_reviews table
CREATE TABLE IF NOT EXISTS restaurant_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_item_reviews table
CREATE TABLE IF NOT EXISTS menu_item_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_rating ON restaurant_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_item ON menu_item_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_restaurant ON menu_item_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_rating ON menu_item_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_menu_items_rating ON menu_items(average_rating DESC, review_count DESC) WHERE is_featured = true;

-- Enable Row Level Security
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurant_reviews
CREATE POLICY "Anyone can view restaurant reviews"
  ON restaurant_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit restaurant reviews"
  ON restaurant_reviews FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for menu_item_reviews
CREATE POLICY "Anyone can view menu item reviews"
  ON menu_item_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit menu item reviews"
  ON menu_item_reviews FOR INSERT
  TO public
  WITH CHECK (true);

-- Function to update restaurant rating stats
CREATE OR REPLACE FUNCTION update_restaurant_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM restaurant_reviews
      WHERE restaurant_id = NEW.restaurant_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM restaurant_reviews
      WHERE restaurant_id = NEW.restaurant_id
    )
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update menu item rating stats
CREATE OR REPLACE FUNCTION update_menu_item_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE menu_items
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM menu_item_reviews
      WHERE menu_item_id = NEW.menu_item_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM menu_item_reviews
      WHERE menu_item_id = NEW.menu_item_id
    )
  WHERE id = NEW.menu_item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update ratings automatically
DROP TRIGGER IF EXISTS update_restaurant_rating_trigger ON restaurant_reviews;
CREATE TRIGGER update_restaurant_rating_trigger
  AFTER INSERT ON restaurant_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating_stats();

DROP TRIGGER IF EXISTS update_menu_item_rating_trigger ON menu_item_reviews;
CREATE TRIGGER update_menu_item_rating_trigger
  AFTER INSERT ON menu_item_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_item_rating_stats();

-- Triggers for updated_at timestamp
DROP TRIGGER IF EXISTS update_restaurant_reviews_updated_at ON restaurant_reviews;
CREATE TRIGGER update_restaurant_reviews_updated_at
  BEFORE UPDATE ON restaurant_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_item_reviews_updated_at ON menu_item_reviews;
CREATE TRIGGER update_menu_item_reviews_updated_at
  BEFORE UPDATE ON menu_item_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
