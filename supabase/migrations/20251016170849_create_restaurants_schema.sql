/*
  # Multi-Tenant Restaurant Platform Schema

  ## New Tables Created
  
  ### `restaurants`
  - `id` (uuid, primary key) - Unique restaurant identifier
  - `name` (text) - Restaurant name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Restaurant description
  - `logo_url` (text) - Logo image URL
  - `hero_image_url` (text) - Hero banner image URL
  - `hero_video_url` (text, nullable) - Optional hero video
  - `primary_color` (text) - Brand primary color hex
  - `secondary_color` (text) - Brand secondary color hex
  - `accent_color` (text) - Brand accent color hex
  - `cuisine_type` (text) - Type of cuisine
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email
  - `address` (text) - Street address
  - `city` (text) - City
  - `state` (text) - State/province
  - `zip` (text) - Postal code
  - `latitude` (numeric, nullable) - Location latitude
  - `longitude` (numeric, nullable) - Location longitude
  - `hours` (jsonb) - Operating hours by day
  - `is_active` (boolean) - Restaurant status
  - `template_style` (text) - Design template choice
  - `owner_id` (uuid, nullable) - Restaurant owner user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `menu_categories`
  - `id` (uuid, primary key) - Category identifier
  - `restaurant_id` (uuid, foreign key) - Restaurant reference
  - `name` (text) - Category name
  - `description` (text, nullable) - Category description
  - `sort_order` (integer) - Display order
  - `is_active` (boolean) - Category visibility
  - `created_at` (timestamptz) - Creation timestamp

  ### `menu_items`
  - `id` (uuid, primary key) - Menu item identifier
  - `restaurant_id` (uuid, foreign key) - Restaurant reference
  - `category_id` (uuid, foreign key) - Category reference
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `price` (numeric) - Base price
  - `image_url` (text, nullable) - Item image URL
  - `is_available` (boolean) - Availability status
  - `is_featured` (boolean) - Featured item flag
  - `dietary_tags` (text[]) - Dietary information tags
  - `customizations` (jsonb) - Customization options
  - `preparation_time` (integer) - Prep time in minutes
  - `calories` (integer, nullable) - Calorie count
  - `allergens` (text[]) - Allergen information
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `orders`
  - `id` (uuid, primary key) - Order identifier
  - `restaurant_id` (uuid, foreign key) - Restaurant reference
  - `customer_id` (uuid, nullable) - Customer user ID
  - `customer_name` (text) - Customer name
  - `customer_phone` (text) - Customer phone
  - `customer_email` (text, nullable) - Customer email
  - `items` (jsonb) - Order items with customizations
  - `subtotal` (numeric) - Subtotal amount
  - `tax` (numeric) - Tax amount
  - `delivery_fee` (numeric) - Delivery fee
  - `total` (numeric) - Total amount
  - `order_type` (text) - delivery/pickup/dine-in
  - `status` (text) - Order status
  - `scheduled_for` (timestamptz, nullable) - Scheduled time
  - `special_instructions` (text, nullable) - Special instructions
  - `delivery_address` (text, nullable) - Delivery address
  - `payment_status` (text) - Payment status
  - `payment_method` (text) - Payment method
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `customers`
  - `id` (uuid, primary key) - Customer identifier
  - `user_id` (uuid, nullable) - Auth user ID
  - `email` (text, nullable) - Email address
  - `phone` (text, nullable) - Phone number
  - `name` (text) - Customer name
  - `dietary_preferences` (text[]) - Dietary preferences
  - `favorite_restaurants` (uuid[]) - Favorite restaurant IDs
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  
  1. Enable RLS on all tables
  2. Restaurants table:
     - Public can read active restaurants
     - Only owners can update their restaurant
  3. Menu tables:
     - Public can read active items
     - Only restaurant owners can modify
  4. Orders:
     - Customers can view their own orders
     - Restaurant owners can view their restaurant orders
  5. Customers:
     - Users can only view/update their own data
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  logo_url text NOT NULL,
  hero_image_url text NOT NULL,
  hero_video_url text,
  primary_color text NOT NULL DEFAULT '#8B4513',
  secondary_color text NOT NULL DEFAULT '#F5E6D3',
  accent_color text NOT NULL DEFAULT '#C85A54',
  cuisine_type text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  latitude numeric,
  longitude numeric,
  hours jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  template_style text NOT NULL DEFAULT 'classic',
  owner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  dietary_tags text[] DEFAULT '{}',
  customizations jsonb DEFAULT '[]',
  preparation_time integer NOT NULL DEFAULT 15,
  calories integer,
  allergens text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id uuid,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  order_type text NOT NULL DEFAULT 'pickup',
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz,
  special_instructions text,
  delivery_address text,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'card',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  phone text,
  name text NOT NULL,
  dietary_preferences text[] DEFAULT '{}',
  favorite_restaurants uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Public can view active restaurants"
  ON restaurants FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurant owners can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Restaurant owners can insert restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for menu_categories
CREATE POLICY "Public can view active categories"
  ON menu_categories FOR SELECT
  TO public
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.is_active = true)
  );

CREATE POLICY "Restaurant owners can manage categories"
  ON menu_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_categories.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- RLS Policies for menu_items
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  TO public
  USING (
    is_available = true AND
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.is_active = true)
  );

CREATE POLICY "Restaurant owners can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Restaurant owners can view their restaurant orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid())
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Restaurant owners can update their restaurant orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid())
  );

-- RLS Policies for customers
CREATE POLICY "Users can view their own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer data"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
