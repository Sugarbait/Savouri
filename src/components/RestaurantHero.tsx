import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useChatbot } from '../contexts/ChatbotContext';
import { Clock, Phone, MapPin, MessageSquare, Star, Calendar } from 'lucide-react';
import { ReviewForm } from './ReviewForm';

export const RestaurantHero: React.FC = () => {
  const { currentRestaurant, isOpen } = useRestaurant();
  const { openChatbot } = useChatbot();
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!currentRestaurant) return null;

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${currentRestaurant.hero_image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-16 pt-20">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-4 text-center md:text-left">
          <img
            src={currentRestaurant.logo_url}
            alt={currentRestaurant.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-2xl"
          />
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
              {currentRestaurant.name}
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              {currentRestaurant.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-6 text-white/95 mb-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-base md:text-lg">
              {isOpen() ? (
                <span className="text-green-400 font-semibold">Open Now</span>
              ) : (
                <span className="text-red-400 font-semibold">Closed</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Phone className="w-5 h-5" />
            <span className="text-base md:text-lg">{currentRestaurant.phone}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-base md:text-lg">
              {currentRestaurant.address}, {currentRestaurant.city}
            </span>
          </div>
          {currentRestaurant.review_count !== undefined && currentRestaurant.review_count > 0 && (
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(currentRestaurant.average_rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-white/30 text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-base md:text-lg font-semibold">
                {currentRestaurant.average_rating?.toFixed(1)}
              </span>
              <span className="text-base md:text-lg text-white/80">
                ({currentRestaurant.review_count} {currentRestaurant.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={openChatbot}
            className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
            style={{
              backgroundColor: currentRestaurant.accent_color,
              color: '#FFFFFF',
            }}
          >
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
            Order Now
          </button>
          {currentRestaurant.show_reserve_table !== false && (
            <button
              className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105"
              style={{
                backgroundColor: currentRestaurant.primary_color,
                color: '#FFFFFF',
              }}
            >
              <Calendar className="w-5 h-5 md:w-6 md:h-6" />
              Reserve a Table
            </button>
          )}
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105 bg-white text-gray-900"
          >
            <Star className="w-5 h-5 md:w-6 md:h-6" />
            Write a Review
          </button>
        </div>
      </div>

      {showReviewForm && (
        <ReviewForm
          restaurantId={currentRestaurant.id}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
