import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { MenuTag } from '../types';
import { MenuTagIcon } from './MenuTagIcon';

interface AddRestaurantFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface MenuCategory {
  name: string;
  description: string;
  imageUrl: string;
  items: MenuItem[];
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: string;
  calories: string;
  allergens: string;
  tags: string[];
}

export const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [menuTags, setMenuTags] = useState<MenuTag[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    heroImageUrl: '',
    cuisineType: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#F7F7F7',
    accentColor: '#FFB830',
    buttonColor: '#EA580C',
    aboutMission: '',
    aboutStory: '',
    aboutChef: '',
    aboutAwards: '',
    aboutSectionImageUrl: '',
    showReserveTable: true,
  });

  const [hours, setHours] = useState({
    monday: { open: '09:00', close: '21:00', closed: false },
    tuesday: { open: '09:00', close: '21:00', closed: false },
    wednesday: { open: '09:00', close: '21:00', closed: false },
    thursday: { open: '09:00', close: '21:00', closed: false },
    friday: { open: '09:00', close: '21:00', closed: false },
    saturday: { open: '10:00', close: '22:00', closed: false },
    sunday: { open: '10:00', close: '20:00', closed: false },
  });

  const [categories, setCategories] = useState<MenuCategory[]>([
    {
      name: '',
      description: '',
      imageUrl: '',
      items: [],
    },
  ]);

  useEffect(() => {
    const fetchMenuTags = async () => {
      const { data, error } = await supabase
        .from('menu_tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (!error && data) {
        setMenuTags(data);
      }
    };

    fetchMenuTags();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value },
    }));
  };

  const addCategory = () => {
    setCategories((prev) => [...prev, { name: '', description: '', imageUrl: '', items: [] }]);
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: string, value: string) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat))
    );
  };

  const addMenuItem = (categoryIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              items: [
                ...cat.items,
                {
                  name: '',
                  description: '',
                  price: '',
                  imageUrl: '',
                  isAvailable: true,
                  isFeatured: false,
                  preparationTime: '15',
                  calories: '',
                  allergens: '',
                  tags: [],
                },
              ],
            }
          : cat
      )
    );
  };

  const removeMenuItem = (categoryIndex: number, itemIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex ? { ...cat, items: cat.items.filter((_, j) => j !== itemIndex) } : cat
      )
    );
  };

  const updateMenuItem = (categoryIndex: number, itemIndex: number, field: string, value: string | boolean | string[]) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              items: cat.items.map((item, j) => (j === itemIndex ? { ...item, [field]: value } : item)),
            }
          : cat
      )
    );
  };

  const toggleMenuTag = (categoryIndex: number, itemIndex: number, tagId: string) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              items: cat.items.map((item, j) => {
                if (j === itemIndex) {
                  const tags = item.tags.includes(tagId)
                    ? item.tags.filter(t => t !== tagId)
                    : [...item.tags, tagId];
                  return { ...item, tags };
                }
                return item;
              }),
            }
          : cat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          logo_url: formData.logoUrl,
          hero_image_url: formData.heroImageUrl,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          accent_color: formData.accentColor,
          button_color: formData.buttonColor,
          cuisine_type: formData.cuisineType,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          hours: hours,
          about_mission: formData.aboutMission,
          about_story: formData.aboutStory,
          about_chef: formData.aboutChef,
          about_awards: formData.aboutAwards,
          about_section_image_url: formData.aboutSectionImageUrl || null,
          show_reserve_table: formData.showReserveTable,
          is_active: true,
          owner_id: null,
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (!category.name) continue;

        const { data: categoryData, error: categoryError } = await supabase
          .from('menu_categories')
          .insert({
            restaurant_id: restaurant.id,
            name: category.name,
            description: category.description,
            image_url: category.imageUrl || null,
            sort_order: i,
            is_active: true,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        for (let j = 0; j < category.items.length; j++) {
          const item = category.items[j];
          if (!item.name || !item.price) continue;

          const { error: itemError } = await supabase.from('menu_items').insert({
            restaurant_id: restaurant.id,
            category_id: categoryData.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            image_url: item.imageUrl || null,
            is_available: item.isAvailable,
            is_featured: item.isFeatured,
            dietary_tags: item.tags,
            preparation_time: parseInt(item.preparationTime) || 15,
            calories: item.calories ? parseInt(item.calories) : null,
            allergens: item.allergens ? item.allergens.split(',').map(a => a.trim()).filter(a => a) : [],
            sort_order: j,
          });

          if (itemError) throw itemError;
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden flex flex-col" style={{minHeight: 'calc(100vh - 2rem)'}}>
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Add Your Restaurant</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center w-full max-w-xs">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            {step === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 sticky top-0 bg-white py-2 -mt-2 z-10">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Website Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your restaurant URL: savouri.com/{formData.slug}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <ImageUpload
                      value={formData.logoUrl}
                      onChange={(url) => handleInputChange('logoUrl', url)}
                      label="Restaurant Logo"
                      bucket="restaurant-images"
                      required
                    />
                  </div>

                  <div>
                    <ImageUpload
                      value={formData.heroImageUrl}
                      onChange={(url) => handleInputChange('heroImageUrl', url)}
                      label="Hero Banner Image"
                      bucket="restaurant-images"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Cuisine Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cuisineType}
                      onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                      placeholder="Italian, Mexican, Asian, etc."
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@restaurant.com"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Brand Colors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Primary</label>
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Secondary</label>
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Accent</label>
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">View Button Color</label>
                      <input
                        type="color"
                        value={formData.buttonColor}
                        onChange={(e) => handleInputChange('buttonColor', e.target.value)}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 sticky top-0 bg-white py-2 -mt-2 z-10">Operating Hours</h3>

                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(hours).map(([day, times]) => (
                    <div key={day} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 bg-gray-50 p-3 rounded-lg">
                      <div className="w-24 sm:w-28 font-medium text-gray-700 capitalize text-sm sm:text-base flex-shrink-0">{day}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={times.closed}
                          onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm text-gray-600">Closed</span>
                      </div>
                      {!times.closed && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={times.open}
                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg flex-1 sm:flex-initial"
                          />
                          <span className="text-gray-500 text-xs sm:text-sm">to</span>
                          <input
                            type="time"
                            value={times.close}
                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg flex-1 sm:flex-initial"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">About Your Restaurant</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Tell customers about your restaurant, mission, and story.</p>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Mission Statement
                      </label>
                      <textarea
                        value={formData.aboutMission}
                        onChange={(e) => handleInputChange('aboutMission', e.target.value)}
                        placeholder="What's your restaurant's mission?"
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Our Story
                      </label>
                      <textarea
                        value={formData.aboutStory}
                        onChange={(e) => handleInputChange('aboutStory', e.target.value)}
                        placeholder="Tell us about your restaurant's history and what makes it special..."
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        About the Chef
                      </label>
                      <textarea
                        value={formData.aboutChef}
                        onChange={(e) => handleInputChange('aboutChef', e.target.value)}
                        placeholder="Tell us about your chef and their culinary journey..."
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Awards & Recognition
                      </label>
                      <textarea
                        value={formData.aboutAwards}
                        onChange={(e) => handleInputChange('aboutAwards', e.target.value)}
                        placeholder="Any awards, certifications, or recognitions..."
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <ImageUpload
                        value={formData.aboutSectionImageUrl}
                        onChange={(url) => handleInputChange('aboutSectionImageUrl', url)}
                        label="About Section Image (Optional)"
                        bucket="restaurant-images"
                      />
                      <p className="text-xs text-gray-500 mt-1">This image will appear in the About section. If not provided, a default image will be used.</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showReserveTable}
                          onChange={(e) => handleInputChange('showReserveTable', e.target.checked)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Show "Reserve a Table" button in About section
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">Uncheck this if you don't offer table reservations or sit-down service.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 sticky top-0 bg-white py-2 -mt-2 z-10">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Menu Categories & Items</h3>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>

                {categories.map((category, catIndex) => (
                  <div key={catIndex} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                              Category Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={category.name}
                              onChange={(e) => updateCategory(catIndex, 'name', e.target.value)}
                              placeholder="e.g., Appetizers, Main Course, Drinks"
                              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={category.description}
                              onChange={(e) => updateCategory(catIndex, 'description', e.target.value)}
                              placeholder="Category description"
                              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <ImageUpload
                            value={category.imageUrl}
                            onChange={(url) => updateCategory(catIndex, 'imageUrl', url)}
                            label="Category Image (Optional)"
                            bucket="restaurant-images"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCategory(catIndex)}
                        className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Menu Items</h4>
                        <button
                          type="button"
                          onClick={() => addMenuItem(catIndex)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Item
                        </button>
                      </div>

                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-2 sm:space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 min-w-0">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Item Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={item.name}
                                  onChange={(e) => updateMenuItem(catIndex, itemIndex, 'name', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Price *
                                </label>
                                <input
                                  type="number"
                                  required
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => updateMenuItem(catIndex, itemIndex, 'price', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateMenuItem(catIndex, itemIndex, 'description', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <ImageUpload
                                  value={item.imageUrl}
                                  onChange={(url) => updateMenuItem(catIndex, itemIndex, 'imageUrl', url)}
                                  label="Menu Item Image"
                                  bucket="restaurant-images"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Prep Time (min)
                                </label>
                                <input
                                  type="number"
                                  value={item.preparationTime}
                                  onChange={(e) => updateMenuItem(catIndex, itemIndex, 'preparationTime', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Calories (optional)
                                </label>
                                <input
                                  type="number"
                                  value={item.calories}
                                  onChange={(e) => updateMenuItem(catIndex, itemIndex, 'calories', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  placeholder="e.g., 450"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Allergens (optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.allergens}
                                  onChange={(e) => updateMenuItem(catIndex, itemIndex, 'allergens', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  placeholder="e.g., nuts, dairy, gluten (comma separated)"
                                />
                              </div>
                              <div className="md:col-span-2 flex flex-wrap items-center gap-3 sm:gap-4">
                                <label className="flex items-center gap-1.5 sm:gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.isAvailable}
                                    onChange={(e) => updateMenuItem(catIndex, itemIndex, 'isAvailable', e.target.checked)}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-700">Available</span>
                                </label>
                                <label className="flex items-center gap-1.5 sm:gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.isFeatured}
                                    onChange={(e) => updateMenuItem(catIndex, itemIndex, 'isFeatured', e.target.checked)}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-700">Customer Favorite</span>
                                </label>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">
                                  Menu Tags (Dietary & Allergen Info)
                                </label>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {menuTags.map((tag) => {
                                    const isSelected = item.tags.includes(tag.id);
                                    return (
                                      <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleMenuTag(catIndex, itemIndex, tag.id)}
                                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all ${
                                          isSelected
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                      >
                                        <MenuTagIcon icon={tag.icon} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        {tag.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMenuItem(catIndex, itemIndex)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {category.items.length === 0 && (
                        <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                          No items added yet. Click "Add Item" to get started.
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                    No categories added yet. Click "Add Category" to get started.
                  </div>
                )}
              </div>
            )}
            </form>

          <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm md:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Creating...' : 'Create Restaurant'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
