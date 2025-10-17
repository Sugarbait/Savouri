/*
  # Populate Menu Data for All Restaurants

  This migration adds comprehensive menu data for all three demo restaurants:
  - Bella Italia: Italian restaurant with appetizers, pasta, pizzas, desserts, and beverages
  - Sushi Zen: Japanese restaurant with appetizers, sushi, rolls, ramen, and beverages  
  - Taco Fiesta: Mexican restaurant with tacos, burritos, appetizers, desserts, and beverages

  ## Menu Categories (15 total)
  - 5 categories for Bella Italia
  - 5 categories for Sushi Zen
  - 5 categories for Taco Fiesta

  ## Menu Items (39 total)
  - 10 items for Bella Italia
  - 14 items for Sushi Zen
  - 15 items for Taco Fiesta

  Each menu item includes:
  - Name, description, and price
  - High-quality food images from Pexels
  - Dietary tags (vegetarian, vegan, gluten-free)
  - Allergen information
  - Preparation time and calorie information
  - Featured status for popular items
*/

-- Insert menu categories for Bella Italia
INSERT INTO menu_categories (restaurant_id, name, description, sort_order, is_active)
SELECT id, 'Appetizers', 'Start your meal with our delicious starters', 1, true
FROM restaurants WHERE slug = 'bella-italia'
UNION ALL
SELECT id, 'Main Courses', 'Our signature pasta and entrees', 2, true
FROM restaurants WHERE slug = 'bella-italia'
UNION ALL
SELECT id, 'Pizzas', 'Wood-fired perfection', 3, true
FROM restaurants WHERE slug = 'bella-italia'
UNION ALL
SELECT id, 'Desserts', 'Sweet endings', 4, true
FROM restaurants WHERE slug = 'bella-italia'
UNION ALL
SELECT id, 'Beverages', 'Drinks and refreshments', 5, true
FROM restaurants WHERE slug = 'bella-italia';

-- Insert menu categories for Sushi Zen
INSERT INTO menu_categories (restaurant_id, name, description, sort_order, is_active)
SELECT id, 'Appetizers', 'Traditional Japanese starters', 1, true
FROM restaurants WHERE slug = 'sushi-zen'
UNION ALL
SELECT id, 'Nigiri & Sashimi', 'Fresh cuts of premium fish', 2, true
FROM restaurants WHERE slug = 'sushi-zen'
UNION ALL
SELECT id, 'Specialty Rolls', 'Creative and signature rolls', 3, true
FROM restaurants WHERE slug = 'sushi-zen'
UNION ALL
SELECT id, 'Ramen & Noodles', 'Hearty and flavorful bowls', 4, true
FROM restaurants WHERE slug = 'sushi-zen'
UNION ALL
SELECT id, 'Beverages', 'Japanese drinks and teas', 5, true
FROM restaurants WHERE slug = 'sushi-zen';

-- Insert menu categories for Taco Fiesta
INSERT INTO menu_categories (restaurant_id, name, description, sort_order, is_active)
SELECT id, 'Tacos', 'Authentic street-style tacos', 1, true
FROM restaurants WHERE slug = 'taco-fiesta'
UNION ALL
SELECT id, 'Burritos & Bowls', 'Packed with flavor', 2, true
FROM restaurants WHERE slug = 'taco-fiesta'
UNION ALL
SELECT id, 'Appetizers', 'Start your fiesta right', 3, true
FROM restaurants WHERE slug = 'taco-fiesta'
UNION ALL
SELECT id, 'Desserts', 'Sweet Mexican treats', 4, true
FROM restaurants WHERE slug = 'taco-fiesta'
UNION ALL
SELECT id, 'Beverages', 'Refreshing drinks', 5, true
FROM restaurants WHERE slug = 'taco-fiesta';

-- Insert menu items for Bella Italia - Appetizers
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Bruschetta al Pomodoro',
  'Toasted bread topped with fresh tomatoes, garlic, basil, and olive oil',
  8.99,
  'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['vegetarian']::text[],
  10,
  180,
  ARRAY['gluten']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Appetizers';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Caprese Salad',
  'Fresh mozzarella, tomatoes, basil, balsamic glaze',
  10.99,
  'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian', 'gluten-free']::text[],
  8,
  220,
  ARRAY['dairy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Appetizers';

-- Insert menu items for Bella Italia - Main Courses
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Spaghetti Carbonara',
  'Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper',
  16.99,
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  20,
  650,
  ARRAY['gluten', 'dairy', 'eggs']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Main Courses';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Fettuccine Alfredo',
  'Creamy parmesan sauce with fresh fettuccine pasta',
  15.99,
  'https://images.pexels.com/photos/1850593/pexels-photo-1850593.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian']::text[],
  18,
  720,
  ARRAY['gluten', 'dairy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Main Courses';

-- Insert menu items for Bella Italia - Pizzas
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Margherita Pizza',
  'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil',
  14.99,
  'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['vegetarian']::text[],
  15,
  800,
  ARRAY['gluten', 'dairy']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Pizzas';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Quattro Formaggi',
  'Four cheese pizza: mozzarella, gorgonzola, parmesan, fontina',
  17.99,
  'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian']::text[],
  15,
  920,
  ARRAY['gluten', 'dairy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Pizzas';

-- Insert menu items for Bella Italia - Desserts
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Tiramisu',
  'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
  7.99,
  'https://images.pexels.com/photos/6210751/pexels-photo-6210751.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['vegetarian']::text[],
  5,
  450,
  ARRAY['gluten', 'dairy', 'eggs']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Desserts';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Panna Cotta',
  'Silky vanilla cream with berry compote',
  6.99,
  'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian', 'gluten-free']::text[],
  5,
  320,
  ARRAY['dairy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Desserts';

-- Insert menu items for Bella Italia - Beverages
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Italian Espresso',
  'Rich, bold espresso shot',
  3.99,
  true,
  false,
  ARRAY['vegan', 'gluten-free']::text[],
  3,
  5,
  ARRAY[]::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Beverages';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'San Pellegrino',
  'Sparkling mineral water',
  4.99,
  true,
  false,
  ARRAY['vegan', 'gluten-free']::text[],
  1,
  0,
  ARRAY[]::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'bella-italia' AND mc.name = 'Beverages';

-- Insert menu items for Sushi Zen - Appetizers
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Edamame',
  'Steamed young soybeans with sea salt',
  5.99,
  'https://images.pexels.com/photos/5737245/pexels-photo-5737245.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegan', 'gluten-free']::text[],
  5,
  120,
  ARRAY['soy']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Appetizers';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Gyoza',
  'Pan-fried pork dumplings with ponzu sauce',
  7.99,
  'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  8,
  280,
  ARRAY['gluten', 'soy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Appetizers';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Miso Soup',
  'Traditional Japanese soup with tofu, seaweed, and green onions',
  4.99,
  'https://images.pexels.com/photos/5928262/pexels-photo-5928262.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian']::text[],
  5,
  90,
  ARRAY['soy']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Appetizers';

-- Insert menu items for Sushi Zen - Nigiri & Sashimi
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Salmon Nigiri',
  'Fresh Atlantic salmon over seasoned rice (2 pieces)',
  6.99,
  'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['gluten-free']::text[],
  10,
  140,
  ARRAY['fish']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Nigiri & Sashimi';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Tuna Sashimi',
  'Premium bluefin tuna, thinly sliced (5 pieces)',
  12.99,
  'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['gluten-free']::text[],
  10,
  165,
  ARRAY['fish']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Nigiri & Sashimi';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Yellowtail Nigiri',
  'Buttery yellowtail with a hint of yuzu (2 pieces)',
  7.99,
  'https://images.pexels.com/photos/8951318/pexels-photo-8951318.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['gluten-free']::text[],
  10,
  150,
  ARRAY['fish']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Nigiri & Sashimi';

-- Insert menu items for Sushi Zen - Specialty Rolls
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Dragon Roll',
  'Eel, cucumber, avocado topped with more avocado and eel sauce',
  15.99,
  'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  15,
  350,
  ARRAY['fish', 'soy', 'gluten']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Specialty Rolls';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Rainbow Roll',
  'California roll topped with assorted fresh fish',
  14.99,
  'https://images.pexels.com/photos/271715/pexels-photo-271715.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  15,
  320,
  ARRAY['fish', 'shellfish', 'soy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Specialty Rolls';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Spicy Tuna Roll',
  'Fresh tuna mixed with spicy mayo, cucumber, and scallions',
  11.99,
  'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY[]::text[],
  12,
  290,
  ARRAY['fish', 'eggs', 'soy']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Specialty Rolls';

-- Insert menu items for Sushi Zen - Ramen & Noodles
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Tonkotsu Ramen',
  'Rich pork bone broth with chashu pork, soft-boiled egg, and noodles',
  16.99,
  'https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  20,
  650,
  ARRAY['gluten', 'soy', 'eggs']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Ramen & Noodles';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Miso Ramen',
  'Savory miso broth with vegetables and noodles',
  14.99,
  'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY[]::text[],
  18,
  580,
  ARRAY['gluten', 'soy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Ramen & Noodles';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Yakisoba',
  'Stir-fried noodles with vegetables and choice of protein',
  13.99,
  'https://images.pexels.com/photos/7214236/pexels-photo-7214236.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY[]::text[],
  15,
  520,
  ARRAY['gluten', 'soy']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Ramen & Noodles';

-- Insert menu items for Sushi Zen - Beverages
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Green Tea',
  'Hot or iced premium Japanese green tea',
  3.99,
  true,
  false,
  ARRAY['vegan', 'gluten-free']::text[],
  3,
  0,
  ARRAY[]::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Beverages';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Sake',
  'Traditional Japanese rice wine, hot or cold',
  8.99,
  true,
  false,
  ARRAY['vegan', 'gluten-free']::text[],
  2,
  120,
  ARRAY[]::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'sushi-zen' AND mc.name = 'Beverages';

-- Insert menu items for Taco Fiesta - Tacos
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Carne Asada Taco',
  'Grilled marinated steak with cilantro, onions, and lime',
  4.99,
  'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['gluten-free']::text[],
  10,
  220,
  ARRAY[]::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Tacos';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Al Pastor Taco',
  'Marinated pork with pineapple, cilantro, and onions',
  4.99,
  'https://images.pexels.com/photos/7218637/pexels-photo-7218637.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['gluten-free']::text[],
  10,
  230,
  ARRAY[]::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Tacos';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Fish Taco',
  'Crispy battered fish with cabbage slaw and chipotle crema',
  5.49,
  'https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  12,
  280,
  ARRAY['fish', 'gluten', 'dairy']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Tacos';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Veggie Taco',
  'Grilled peppers, onions, black beans, and avocado',
  4.49,
  'https://images.pexels.com/photos/5487953/pexels-photo-5487953.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian', 'vegan', 'gluten-free']::text[],
  8,
  180,
  ARRAY[]::text[],
  4
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Tacos';

-- Insert menu items for Taco Fiesta - Burritos & Bowls
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'California Burrito',
  'Carne asada, fries, cheese, sour cream, and guacamole',
  11.99,
  'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY[]::text[],
  15,
  850,
  ARRAY['dairy', 'gluten']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Burritos & Bowls';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Chicken Burrito Bowl',
  'Rice, beans, grilled chicken, salsa, and toppings',
  10.99,
  'https://images.pexels.com/photos/1998920/pexels-photo-1998920.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['gluten-free']::text[],
  12,
  620,
  ARRAY['dairy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Burritos & Bowls';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Carnitas Burrito',
  'Slow-cooked pork, rice, beans, and fresh toppings',
  10.49,
  'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY[]::text[],
  12,
  780,
  ARRAY['gluten', 'dairy']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Burritos & Bowls';

-- Insert menu items for Taco Fiesta - Appetizers
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Chips & Guacamole',
  'Fresh tortilla chips with house-made guacamole',
  7.99,
  'https://images.pexels.com/photos/2092897/pexels-photo-2092897.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['vegetarian', 'vegan', 'gluten-free']::text[],
  5,
  320,
  ARRAY[]::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Appetizers';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Queso Fundido',
  'Melted cheese with chorizo and peppers',
  8.99,
  'https://images.pexels.com/photos/3662086/pexels-photo-3662086.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['gluten-free']::text[],
  8,
  420,
  ARRAY['dairy']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Appetizers';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Nachos Supreme',
  'Loaded nachos with beans, cheese, jalapeños, and toppings',
  9.99,
  'https://images.pexels.com/photos/2092906/pexels-photo-2092906.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['vegetarian']::text[],
  10,
  680,
  ARRAY['dairy', 'gluten']::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Appetizers';

-- Insert menu items for Taco Fiesta - Desserts
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Churros',
  'Fried pastry dusted with cinnamon sugar, served with chocolate',
  5.99,
  'https://images.pexels.com/photos/3622479/pexels-photo-3622479.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  true,
  ARRAY['vegetarian']::text[],
  8,
  320,
  ARRAY['gluten', 'dairy', 'eggs']::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Desserts';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Flan',
  'Creamy caramel custard dessert',
  4.99,
  'https://images.pexels.com/photos/8477993/pexels-photo-8477993.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  false,
  ARRAY['vegetarian', 'gluten-free']::text[],
  5,
  280,
  ARRAY['dairy', 'eggs']::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Desserts';

-- Insert menu items for Taco Fiesta - Beverages
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Horchata',
  'Sweet rice milk with cinnamon',
  3.99,
  true,
  true,
  ARRAY['vegetarian', 'gluten-free']::text[],
  2,
  180,
  ARRAY[]::text[],
  1
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Beverages';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Jarritos',
  'Mexican soda in various flavors',
  2.99,
  true,
  false,
  ARRAY['vegan', 'gluten-free']::text[],
  1,
  140,
  ARRAY[]::text[],
  2
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Beverages';

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_available, is_featured, dietary_tags, preparation_time, calories, allergens, sort_order)
SELECT 
  r.id,
  mc.id,
  'Margarita',
  'Classic lime margarita on the rocks',
  9.99,
  true,
  true,
  ARRAY['vegan', 'gluten-free']::text[],
  5,
  220,
  ARRAY[]::text[],
  3
FROM restaurants r
JOIN menu_categories mc ON mc.restaurant_id = r.id
WHERE r.slug = 'taco-fiesta' AND mc.name = 'Beverages';
