import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { MenuItem } from './MenuItem';
import { Leaf, Flame, WheatOff, Milk, ChevronDown } from 'lucide-react';

export const MenuSection: React.FC = () => {
  const { menuCategories, getMenuItemsByCategory, menuItems, currentRestaurant } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentRestaurant) return null;

  const activeCategory = selectedCategory || (menuCategories.length > 0 ? menuCategories[0].id : null);
  const items = activeCategory ? getMenuItemsByCategory(activeCategory) : [];

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

  const getSelectedLabel = () => {
    if (dietaryFilter === 'all') return 'All Items';
    const option = dietaryOptions.find(o => o.value === dietaryFilter);
    return option ? option.label : 'All Items';
  };

  const getSelectedIcon = () => {
    if (dietaryFilter === 'all') return null;
    const option = dietaryOptions.find(o => o.value === dietaryFilter);
    return option ? option.icon : null;
  };

  const SelectedIcon = getSelectedIcon();

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

      {availableOptions.length > 0 && (
        <div className="mb-8 flex justify-center">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-2">
                {SelectedIcon && <SelectedIcon className="w-5 h-5" />}
                <span>{getSelectedLabel()}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden z-10">
                <button
                  onClick={() => {
                    setDietaryFilter('all');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${
                    dietaryFilter === 'all' ? 'font-semibold' : ''
                  }`}
                  style={
                    dietaryFilter === 'all'
                      ? { backgroundColor: currentRestaurant.secondary_color }
                      : {}
                  }
                >
                  <span>All Items</span>
                </button>
                {availableOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDietaryFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${
                        dietaryFilter === option.value ? 'font-semibold' : ''
                      }`}
                      style={
                        dietaryFilter === option.value
                          ? { backgroundColor: currentRestaurant.secondary_color }
                          : {}
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 min-w-max justify-center px-4">
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
