import React, { useState, useEffect } from 'react';
import { MenuItem as MenuItemType, MenuTag } from '../types';
import { useCart } from '../contexts/CartContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useChatbot } from '../contexts/ChatbotContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Clock, X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MenuTagIcon } from './MenuTagIcon';
import { ReviewForm } from './ReviewForm';
import { ReviewsList } from './ReviewsList';
import { AuthModal } from './AuthModal';

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { addToCart } = useCart();
  const { currentRestaurant } = useRestaurant();
  const { addItemToChatbot } = useChatbot();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<any[]>([]);
  const [itemTags, setItemTags] = useState<MenuTag[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchItemTags = async () => {
      if (item.dietary_tags.length > 0) {
        const { data, error } = await supabase
          .from('menu_tags')
          .select('*')
          .in('id', item.dietary_tags);

        if (!error && data) {
          setItemTags(data);
        }
      }
    };

    fetchItemTags();
  }, [item.dietary_tags]);

  if (!currentRestaurant) return null;

  const handleAddToCart = () => {
    if (!user) {
      setShowDetails(false);
      setAuthModalOpen(true);
      return;
    }

    addToCart({
      menu_item_id: item.id,
      name: item.name,
      quantity,
      price: item.price,
      customizations: selectedCustomizations,
      image_url: item.image_url,
    });
    setShowDetails(false);
    setQuantity(1);
    setSelectedCustomizations([]);
  };

  return (
    <>
      <div
        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        {item.image_url && (
          <div className="relative h-56 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {item.is_featured && (
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white shadow-lg"
                style={{ backgroundColor: currentRestaurant.accent_color }}
              >
                Popular
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {itemTags.slice(0, 3).map(tag => (
                <div
                  key={tag.id}
                  className="bg-white/95 backdrop-blur p-2 rounded-full shadow-lg"
                  title={tag.name}
                >
                  <MenuTagIcon icon={tag.icon} className="w-4 h-4" style={{ color: currentRestaurant.primary_color }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-opacity-80 transition-colors">
              {item.name}
            </h3>
            <span
              className="text-2xl font-bold ml-4 flex-shrink-0"
              style={{ color: currentRestaurant.accent_color }}
            >
              ${item.price.toFixed(2)}
            </span>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{item.preparation_time} min</span>
              {item.calories && <span className="ml-2">{item.calories} cal</span>}
            </div>
            <button
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              style={{ backgroundColor: currentRestaurant.accent_color }}
              onClick={(e) => {
                e.stopPropagation();
                addItemToChatbot(item.id, item.name);
              }}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="relative">
              {item.image_url && (
                <div className="h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-3 right-3 bg-white/95 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
                  <div className="flex gap-2 flex-wrap">
                    {itemTags.map(tag => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        <MenuTagIcon icon={tag.icon} className="w-3 h-3" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className="text-2xl font-bold ml-3 flex-shrink-0"
                  style={{ color: currentRestaurant.accent_color }}
                >
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{item.description}</p>

              <div className="flex gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{item.preparation_time} minutes</span>
                </div>
                {item.calories && <span>{item.calories} calories</span>}
              </div>

              {item.allergens.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs font-semibold text-red-800 mb-0.5">Allergen Information:</p>
                  <p className="text-xs text-red-700">
                    Contains: {item.allergens.join(', ')}
                  </p>
                </div>
              )}

              {item.customizations.map(customization => (
                <div key={customization.id} className="mb-4">
                  <h3 className="font-semibold text-base mb-2">
                    {customization.name}
                    {customization.is_required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  <div className="space-y-1.5">
                    {customization.options.map(option => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type={customization.max_selections === 1 ? 'radio' : 'checkbox'}
                          name={customization.id}
                          className="w-4 h-4"
                          style={{ accentColor: currentRestaurant.accent_color }}
                        />
                        <span className="flex-1 text-sm">{option.name}</span>
                        {option.price_modifier > 0 && (
                          <span className="text-gray-600 text-sm">
                            +${option.price_modifier.toFixed(2)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-base font-semibold">Quantity:</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-full text-base font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl mb-3"
                style={{ backgroundColor: currentRestaurant.accent_color }}
              >
                Add to Cart - ${(item.price * quantity).toFixed(2)}
              </button>

              {item.review_count && item.review_count > 0 ? (
                <div className="mb-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(item.average_rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {item.average_rating?.toFixed(1)}
                    </span>
                    <span className="text-gray-600 text-sm">
                      ({item.review_count} {item.review_count === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <button
                    onClick={() => setShowReviews(!showReviews)}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: currentRestaurant.accent_color }}
                  >
                    {showReviews ? 'Hide' : 'View'} Reviews
                  </button>
                </div>
              ) : (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Be the first to write a review</p>
                </div>
              )}

              <button
                onClick={() => {
                  if (!user) {
                    setShowDetails(false);
                    setAuthModalOpen(true);
                  } else {
                    setShowReviewForm(true);
                  }
                }}
                className="w-full py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: currentRestaurant.accent_color,
                  color: currentRestaurant.accent_color,
                }}
              >
                Write a Review
              </button>

              {showReviews && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ReviewsList key={refreshReviews} menuItemId={item.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <ReviewForm
          menuItemId={item.id}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setRefreshReviews(prev => prev + 1);
            setShowReviews(true);
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          initialMode="signin"
          initialUserType="customer"
        />
      )}
    </>
  );
};
