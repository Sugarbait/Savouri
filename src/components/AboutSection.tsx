import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { Award, Heart, Users, Utensils, Star } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { ReviewsList } from './ReviewsList';

export const AboutSection: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);

  if (!currentRestaurant) return null;

  const values = [
    {
      icon: Heart,
      title: 'Passion for Quality',
      description: 'Every dish is crafted with the finest ingredients and utmost care',
    },
    {
      icon: Users,
      title: 'Family Tradition',
      description: 'Recipes passed down through generations, preserving authentic flavors',
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: "Recognized for excellence in cuisine and service by food critics",
    },
    {
      icon: Utensils,
      title: 'Culinary Excellence',
      description: 'Our chefs bring decades of experience to every plate',
    },
  ];

  return (
    <div className="py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(currentRestaurant.about_story || currentRestaurant.about_mission) && (
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {currentRestaurant.about_story ||
                `At ${currentRestaurant.name}, we believe that great food brings people together.
                Since opening our doors, we've been dedicated to serving authentic ${currentRestaurant.cuisine_type} cuisine
                that honors tradition while embracing innovation. Every dish tells a story, and we're honored to share ours with you.`
              }
            </p>
          </div>
        )}

        {currentRestaurant.about_mission && (
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {currentRestaurant.about_mission}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: currentRestaurant.secondary_color }}
                >
                  <Icon className="w-6 h-6" style={{ color: currentRestaurant.primary_color }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2 text-center"
                  style={{ color: currentRestaurant.primary_color }}
                >
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={currentRestaurant.about_section_image_url || "https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=800"}
              alt="Chef preparing food"
              className="w-full h-96 object-cover"
            />
          </div>

          <div>
            <h3 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              {currentRestaurant.about_chef ? 'Meet Our Chef' : 'Our Commitment'}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 text-lg">
              {currentRestaurant.about_chef ||
                `Our head chef brings over 20 years of culinary expertise, trained in the finest kitchens
                and passionate about creating unforgettable dining experiences. Each dish is a masterpiece,
                combining traditional techniques with modern creativity.`
              }
            </p>
            {!currentRestaurant.about_chef && (
              <p className="text-gray-600 leading-relaxed text-lg">
                We source our ingredients from local farmers and trusted suppliers, ensuring that every meal
                is fresh, flavorful, and prepared with love. From our kitchen to your table, we're committed
                to excellence in every detail.
              </p>
            )}
            {currentRestaurant.about_awards && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2" style={{ color: currentRestaurant.accent_color }}>
                  Awards & Recognition
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {currentRestaurant.about_awards}
                </p>
              </div>
            )}
          </div>
        </div>

        {currentRestaurant.show_reserve_table !== false && (
          <div
            className="mt-16 rounded-3xl p-12 text-center shadow-2xl"
            style={{ backgroundColor: currentRestaurant.primary_color }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Experience the Difference
            </h3>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Join us for an unforgettable dining experience. Whether you're celebrating a special occasion
              or enjoying a casual meal, we're here to make every moment memorable.
            </p>
            <button
              className="px-8 py-4 bg-white rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              style={{ color: currentRestaurant.primary_color }}
            >
              Reserve a Table
            </button>
          </div>
        )}

        <div className="mt-16 bg-white rounded-3xl shadow-2xl p-4 sm:p-6 md:p-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Customer Reviews
              </h3>
              {currentRestaurant.review_count !== undefined && currentRestaurant.review_count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(currentRestaurant.average_rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {currentRestaurant.average_rating?.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({currentRestaurant.review_count} {currentRestaurant.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ backgroundColor: currentRestaurant.accent_color }}
            >
              Write a Review
            </button>
          </div>

          <ReviewsList key={refreshReviews} restaurantId={currentRestaurant.id} />
        </div>
      </div>

      {showReviewForm && (
        <ReviewForm
          restaurantId={currentRestaurant.id}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setRefreshReviews(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};
