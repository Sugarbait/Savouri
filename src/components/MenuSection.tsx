import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { MenuItem } from './MenuItem';
import { Leaf, WheatOff } from 'lucide-react';

export const MenuSection: React.FC = () => {
  const { menuCategories, getMenuItemsByCategory, menuItems, currentRestaurant } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');

  if (!currentRestaurant) return null;

  const activeCategory = selectedCategory || 'all';
  const items = activeCategory === 'all' ? menuItems : (activeCategory ? getMenuItemsByCategory(activeCategory) : []);

  const availableDietaryTags = useMemo(() => {
    const tags = new Set<string>();
    menuItems.forEach(item => {
      item.dietary_tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [menuItems]);

  const filteredItems = items.filter(item => {
    if (dietaryFilter === 'all') return true;
    return item.dietary_tags.includes(dietaryFilter as any);
  });

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: Leaf },
    { value: 'vegan', label: 'Vegan', icon: Leaf },
    { value: 'gluten-free', label: 'Gluten-Free', icon: WheatOff },
  ];

  const availableOptions = dietaryOptions.filter(option =>
    availableDietaryTags.includes(option.value)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
          Our Menu
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Every dish crafted with passion and the finest ingredients
        </p>
      </div>

      <div className="mb-8 space-y-6">
        {/* Dietary Filters */}
        {availableOptions.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Dietary Preferences</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  dietaryFilter === 'all'
                    ? 'shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  dietaryFilter === 'all'
                    ? {
                        backgroundColor: currentRestaurant.primary_color,
                        color: currentRestaurant.secondary_color,
                      }
                    : {}
                }
              >
                All Items
              </button>
              {availableOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setDietaryFilter(option.value)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      dietaryFilter === option.value
                        ? 'shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={
                      dietaryFilter === option.value
                        ? {
                            backgroundColor: currentRestaurant.primary_color,
                            color: currentRestaurant.secondary_color,
                          }
                        : {}
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Categories</p>
          <div className="overflow-x-auto scrollbar-hide w-full">
            <div className="flex gap-3 min-w-max justify-center px-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  activeCategory === 'all'
                    ? {
                        backgroundColor: currentRestaurant.primary_color,
                        color: currentRestaurant.secondary_color,
                      }
                    : {}
                }
              >
                All Items
              </button>
              {menuCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    activeCategory === category.id
                      ? {
                          backgroundColor: currentRestaurant.primary_color,
                          color: currentRestaurant.secondary_color,
                        }
                      : {}
                  }
                >
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {filteredItems.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">
            No items match your dietary preferences. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};
