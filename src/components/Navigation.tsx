import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useAuth } from '../contexts/AuthContext';
import { Home, UtensilsCrossed, MapPin, Info, History, Menu, X, ArrowLeft, ShoppingCart, User, LogOut } from 'lucide-react';
import { OrderHistory } from './OrderHistory';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';
import { supabase } from '../lib/supabase';

type NavSection = 'home' | 'menu' | 'location' | 'about';

interface NavigationProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

import { useCart } from '../contexts/CartContext';

export const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const { currentRestaurant } = useRestaurant();
  const { user, profile, signOut } = useAuth();
  const { cart, getCartTotal, getCartItemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!currentRestaurant) return null;

  const handlePlaceOrder = async () => {
    if (!user) {
      setCartOpen(false);
      setAuthModalOpen(true);
      return;
    }

    if (cart.length === 0 || !currentRestaurant) return;

    setIsPlacingOrder(true);

    try {
      const orderData = {
        user_id: user.id,
        restaurant_id: currentRestaurant.id,
        customer_name: profile?.display_name || 'Guest',
        customer_phone: profile?.phone || '000-000-0000',
        customer_email: profile?.email || '',
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations
        })),
        subtotal: getCartTotal(),
        tax: 0,
        total: getCartTotal(),
        order_type: 'pickup',
        status: 'pending',
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      clearCart();
      setCartOpen(false);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const navItems = [
    { id: 'home' as NavSection, label: 'Home', icon: Home },
    { id: 'menu' as NavSection, label: 'Menu', icon: UtensilsCrossed },
    { id: 'location' as NavSection, label: 'Location', icon: MapPin },
    { id: 'about' as NavSection, label: 'About', icon: Info },
  ];

  return (
    <>
      <nav
        className="sticky top-0 z-30 shadow-lg backdrop-blur-md"
        style={{
          background: `linear-gradient(to right, ${currentRestaurant.primary_color}, ${currentRestaurant.accent_color})`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="Browse all restaurants"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <img
                src={currentRestaurant.logo_url}
                alt={currentRestaurant.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <span className="text-2xl font-bold text-white hidden sm:block">
                {currentRestaurant.name}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white shadow-lg scale-105'
                        : 'text-white hover:bg-white/20'
                    }`}
                    style={isActive ? { color: currentRestaurant.primary_color } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="View current order"
              >
                <ShoppingCart className="w-6 h-6" />
                {getCartItemCount() > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </div>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Account"
                  >
                    {profile?.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="font-semibold text-gray-900 truncate">{profile?.display_name}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setOrderHistoryOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <History className="w-4 h-4" />
                        Order History
                      </button>
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 bg-white rounded-full font-semibold hover:shadow-lg transition-all"
                  style={{ color: currentRestaurant.primary_color }}
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 pt-20"
          style={{
            background: `linear-gradient(to bottom, ${currentRestaurant.primary_color}, ${currentRestaurant.accent_color})`
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="px-4 py-6 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                    isActive ? 'bg-white shadow-lg' : 'text-white hover:bg-white/20'
                  }`}
                  style={isActive ? { color: currentRestaurant.primary_color } : {}}
                >
                  <Icon className="w-6 h-6" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setCartOpen(false)}>
          <div
            className="absolute right-0 top-20 bottom-0 w-full md:w-96 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 p-6 text-white flex items-center justify-between shadow-md z-10"
              style={{ backgroundColor: currentRestaurant.primary_color }}
            >
              <h2 className="text-2xl font-bold">Current Order</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add items from the menu to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.menu_item_id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {item.customizations.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.customizations.map(c => c.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => item.menu_item_id && removeFromCart(item.menu_item_id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => item.menu_item_id && updateQuantity(item.menu_item_id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => item.menu_item_id && updateQuantity(item.menu_item_id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold" style={{ color: currentRestaurant.accent_color }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span style={{ color: currentRestaurant.accent_color }}>
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: currentRestaurant.accent_color }}
                    >
                      {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <OrderHistory isOpen={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} />

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} initialMode="signin" initialUserType="customer" />}

      {profileOpen && <UserProfile onClose={() => setProfileOpen(false)} />}
    </>
  );
};
