import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

interface ReviewsListProps {
  restaurantId?: string;
  menuItemId?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ restaurantId, menuItemId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, menuItemId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query;

      if (restaurantId) {
        query = supabase
          .from('restaurant_reviews')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });
      } else if (menuItemId) {
        query = supabase
          .from('menu_item_reviews')
          .select('*')
          .eq('menu_item_id', menuItemId)
          .order('created_at', { ascending: false });
      }

      if (query) {
        const { data, error } = await query;

        if (error) throw error;

        setReviews(data || []);

        if (data && data.length > 0) {
          const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
          setAverageRating(avg);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Be the first to write a review</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900">{review.customer_name}</div>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-700 mt-3 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
