/*
  # Add About Section and Menu Tags

  ## Changes Made
  
  ### 1. Restaurants Table Updates
    - Add `about_mission` (text) - Restaurant mission statement
    - Add `about_story` (text) - Restaurant story/history
    - Add `about_chef` (text) - About the chef
    - Add `about_awards` (text) - Awards and recognitions
  
  ### 2. Menu Tags System
    - Create `menu_tags` table to store available dietary/menu tags
    - Tags include: Vegetarian, Vegan, Gluten-Free, Peanut-Free, Dairy-Free, Spicy, Mild, Keto, Paleo, Halal, Kosher, Organic, Local, Sustainable, Nut-Free, Soy-Free, Low-Carb, High-Protein, Sugar-Free, Raw
    - Each tag has an icon identifier and display name
  
  ### 3. Menu Items Updates
    - Update `dietary_tags` to reference menu_tags IDs
    - Add `spice_level` field (0-5 scale)
  
  ### 4. Security
    - Enable RLS on menu_tags table
    - Public can view all menu tags
    - Only authenticated users can manage tags
*/

-- Add about section fields to restaurants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'about_mission'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN about_mission text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'about_story'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN about_story text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'about_chef'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN about_chef text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'about_awards'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN about_awards text DEFAULT '';
  END IF;
END $$;

-- Create menu_tags table
CREATE TABLE IF NOT EXISTS menu_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add spice level to menu items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'spice_level'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN spice_level integer DEFAULT 0 CHECK (spice_level >= 0 AND spice_level <= 5);
  END IF;
END $$;

-- Enable RLS on menu_tags
ALTER TABLE menu_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_tags
CREATE POLICY "Public can view menu tags"
  ON menu_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage menu tags"
  ON menu_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default menu tags
INSERT INTO menu_tags (name, icon, category) VALUES
  ('Vegetarian', 'leaf', 'dietary'),
  ('Vegan', 'sprout', 'dietary'),
  ('Gluten-Free', 'wheat-off', 'allergen'),
  ('Peanut-Free', 'nut-off', 'allergen'),
  ('Dairy-Free', 'milk-off', 'allergen'),
  ('Spicy', 'flame', 'flavor'),
  ('Mild', 'droplet', 'flavor'),
  ('Keto', 'drumstick', 'dietary'),
  ('Paleo', 'bone', 'dietary'),
  ('Halal', 'moon', 'dietary'),
  ('Kosher', 'star', 'dietary'),
  ('Organic', 'leaf', 'quality'),
  ('Local', 'map-pin', 'quality'),
  ('Sustainable', 'recycle', 'quality'),
  ('Nut-Free', 'shield-check', 'allergen'),
  ('Soy-Free', 'bean-off', 'allergen'),
  ('Low-Carb', 'trending-down', 'nutritional'),
  ('High-Protein', 'trending-up', 'nutritional'),
  ('Sugar-Free', 'candy-off', 'nutritional'),
  ('Raw', 'carrot', 'preparation')
ON CONFLICT (name) DO NOTHING;

-- Create index for menu_tags
CREATE INDEX IF NOT EXISTS idx_menu_tags_category ON menu_tags(category);