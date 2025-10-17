import React, { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Clock, ChevronRight, Plus, ChevronDown, User, LogOut, Settings, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from './UserProfile';
import { AuthModal } from './AuthModal';

interface RestaurantBrowserProps {
  onSelectRestaurant: (slug: string) => void;
  onAddRestaurant: () => void;
}

export const RestaurantBrowser: React.FC<RestaurantBrowserProps> = ({ onSelectRestaurant, onAddRestaurant }) => {
  const { user, profile, signOut } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [initialUserType, setInitialUserType] = useState<'customer' | 'business_owner'>('customer');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const handleOpenAuth = (mode: 'signin' | 'signup', userType: 'customer' | 'business_owner' = 'customer') => {
    setAuthMode(mode);
    setInitialUserType(userType);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const cuisineTypes = ['all', ...new Set(restaurants.map(r => r.cuisine_type))];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine_type === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const isOpen = (restaurant: Restaurant): boolean => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof restaurant.hours;
    const dayHours = restaurant.hours[dayName];

    if (!dayHours || dayHours.is_closed) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-lg">
                <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                Savouri
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <button
                    onClick={onAddRestaurant}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:text-white/80 transition-colors"
                  >
                    For Businesses
                  </button>
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
                    >
                      {profile?.profile_picture_url ? (
                        <img
                          src={profile.profile_picture_url}
                          alt="Profile"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-500"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      )}
                      <div className="text-left hidden md:block">
                        <p className="font-semibold text-white text-sm drop-shadow-md">{profile?.display_name}</p>
                        <p className="text-xs text-white/80 drop-shadow-sm">{profile?.email}</p>
                      </div>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{profile?.display_name}</p>
                          <p className="text-sm text-gray-500">{profile?.email}</p>
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            {profile?.user_type === 'business_owner' ? 'Business Owner' : 'Customer'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setProfileOpen(true);
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Account Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            onAddRestaurant();
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors sm:hidden"
                        >
                          <Plus className="w-5 h-5" />
                          <span>For Businesses</span>
                        </button>
                        <button
                          onClick={() => {
                            signOut();
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleOpenAuth('signup', 'business_owner')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:text-white/80 transition-colors"
                  >
                    For Businesses
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="px-3 sm:px-6 py-2 text-sm sm:text-base text-white font-semibold hover:text-white/80 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup', 'customer')}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-white text-orange-600 rounded-full font-bold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop)',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl">
            Welcome to Savouri
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-10 drop-shadow-lg">
            Discover amazing restaurants, order your favorite meals with AI-powered assistance, and reserve tables effortlessly
          </p>

          <button
            onClick={() => {
              if (user) {
                onAddRestaurant();
              } else {
                handleOpenAuth('signup', 'business_owner');
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full font-bold text-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Add Your Restaurant
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg shadow-lg"
            />
          </div>

          <div className="flex justify-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md min-w-[200px] justify-between"
              >
                <span>
                  {selectedCuisine === 'all'
                    ? 'All Cuisines'
                    : selectedCuisine.charAt(0).toUpperCase() + selectedCuisine.slice(1)}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden z-10">
                  {cuisineTypes.map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => {
                        setSelectedCuisine(cuisine);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${
                        selectedCuisine === cuisine ? 'bg-orange-50 font-semibold' : ''
                      }`}
                    >
                      <span>
                        {cuisine === 'all'
                          ? 'All Cuisines'
                          : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No restaurants found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map(restaurant => (
              <div
                key={restaurant.id}
                onClick={() => onSelectRestaurant(restaurant.slug)}
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={restaurant.hero_image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute top-4 right-4">
                    {isOpen(restaurant) ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        Open Now
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg truncate">
                          {restaurant.name}
                        </h3>
                        <p className="text-white/90 text-sm drop-shadow-md">
                          {restaurant.cuisine_type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.city}, {restaurant.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{restaurant.phone}</span>
                    </div>
                  </div>

                  <button
                    className="w-full py-3 rounded-full font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-4"
                    style={{ backgroundColor: restaurant.accent_color }}
                  >
                    View Menu
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && (
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-2">Restaurant owner?</p>
            <button
              onClick={onAddRestaurant}
              className="text-orange-600 font-semibold hover:underline text-lg"
            >
              Add your restaurant to Savouri
            </button>
          </div>
        )}
      </div>

      {profileOpen && <UserProfile onClose={() => setProfileOpen(false)} />}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
          initialUserType={initialUserType}
          onSuccess={(userType) => {
            setAuthModalOpen(false);
            // If business owner just signed up, take them to add restaurant
            if (userType === 'business_owner' && authMode === 'signup') {
              onAddRestaurant();
            }
          }}
        />
      )}
    </div>
  );
};
