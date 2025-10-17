export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  hero_video_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  button_color: string;
  cuisine_type: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  hours: RestaurantHours;
  is_active: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  template_style: 'classic' | 'modern' | 'story' | 'fast-casual';
  about_mission?: string;
  about_story?: string;
  about_chef?: string;
  about_awards?: string;
  about_section_image_url?: string;
  show_reserve_table?: boolean;
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  is_closed: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  dietary_tags: string[];
  customizations: MenuItemCustomization[];
  preparation_time: number;
  calories?: number;
  allergens: string[];
  spice_level?: number;
  average_rating?: number;
  review_count?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'spicy' | 'keto' | 'halal' | 'kosher';

export interface MenuTag {
  id: string;
  name: string;
  icon: string;
  category: 'dietary' | 'allergen' | 'flavor' | 'quality' | 'nutritional' | 'preparation';
  created_at: string;
}

export interface MenuItemCustomization {
  id: string;
  name: string;
  options: CustomizationOption[];
  is_required: boolean;
  max_selections: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price_modifier: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total: number;
  order_type: 'delivery' | 'pickup' | 'dine-in';
  status: OrderStatus;
  scheduled_for?: string;
  special_instructions?: string;
  delivery_address?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'card' | 'cash' | 'online';
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  customizations: SelectedCustomization[];
  special_instructions?: string;
}

export interface SelectedCustomization {
  customization_id: string;
  customization_name: string;
  option_id: string;
  option_name: string;
  price_modifier: number;
}

export interface CartItem extends OrderItem {
  image_url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  menu_items?: MenuItem[];
  suggested_actions?: SuggestedAction[];
}

export interface SuggestedAction {
  label: string;
  action: string;
  data?: any;
}

export interface Customer {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  dietary_preferences: DietaryTag[];
  favorite_restaurants: string[];
  order_history: Order[];
  created_at: string;
}

export interface Review {
  id: string;
  restaurant_id?: string;
  menu_item_id?: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}
