import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant, MenuItem, MenuCategory } from '../types';
import { supabase } from '../lib/supabase';

interface RestaurantContextType {
  currentRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  setCurrentRestaurant: (slug: string) => void;
  getMenuItemsByCategory: (categoryId: string) => MenuItem[];
  getFeaturedItems: () => MenuItem[];
  isOpen: () => boolean;
  loading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (currentRestaurant) {
      fetchMenuData(currentRestaurant.id);
    }
  }, [currentRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .order('name');

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuData = async (restaurantId: string) => {
    try {
      const [categoriesResult, itemsResult] = await Promise.all([
        supabase
          .from('menu_categories')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_available', true)
          .order('sort_order')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (itemsResult.error) throw itemsResult.error;

      setMenuCategories(categoriesResult.data || []);
      setMenuItems(itemsResult.data || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  };

  const setCurrentRestaurant = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentRestaurantState(data);
      }
    } catch (error) {
      console.error('Error setting current restaurant:', error);
    }
  };

  const getMenuItemsByCategory = (categoryId: string): MenuItem[] => {
    return menuItems.filter(item => item.category_id === categoryId && item.is_available);
  };

  const getFeaturedItems = (): MenuItem[] => {
    return menuItems
      .filter(item => item.is_featured && item.is_available)
      .sort((a, b) => {
        if (b.average_rating !== a.average_rating) {
          return (b.average_rating || 0) - (a.average_rating || 0);
        }
        return (b.review_count || 0) - (a.review_count || 0);
      })
      .slice(0, 6);
  };

  const isOpen = (): boolean => {
    if (!currentRestaurant) return false;
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof currentRestaurant.hours;
    const dayHours = currentRestaurant.hours[dayName];

    if (dayHours.is_closed) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentRestaurant,
        restaurants,
        menuCategories,
        menuItems,
        setCurrentRestaurant,
        getMenuItemsByCategory,
        getFeaturedItems,
        isOpen,
        loading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};
