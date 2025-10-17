import React from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { MenuItem } from './MenuItem';
import { Star } from 'lucide-react';

export const FeaturedItems: React.FC = () => {
  const { getFeaturedItems, currentRestaurant } = useRestaurant();
  const featuredItems = getFeaturedItems();

  if (!currentRestaurant || featuredItems.length === 0) return null;

  return (
    <div className="py-16 pb-24" style={{ backgroundColor: currentRestaurant.secondary_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-8 h-8" style={{ color: currentRestaurant.accent_color }} fill="currentColor" />
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Customer Favorites
            </h2>
            <Star className="w-8 h-8" style={{ color: currentRestaurant.accent_color }} fill="currentColor" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The dishes our guests can't stop talking about
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
