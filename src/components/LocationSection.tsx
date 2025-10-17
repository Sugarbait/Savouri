import React from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { MapPin, Phone, Mail, Clock, Navigation as NavigationIcon } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const { currentRestaurant, isOpen } = useRestaurant();

  if (!currentRestaurant) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as typeof days[number];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
          Visit Us
        </h2>
        <p className="text-xl text-gray-600">
          We can't wait to serve you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-bold mb-6" style={{ color: currentRestaurant.primary_color }}>
            Contact Information
          </h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: currentRestaurant.secondary_color }}
              >
                <MapPin className="w-6 h-6" style={{ color: currentRestaurant.primary_color }} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Address</h4>
                <p className="text-gray-600">
                  {currentRestaurant.address}
                  <br />
                  {currentRestaurant.city}, {currentRestaurant.state} {currentRestaurant.zip}
                </p>
                <button
                  className="mt-2 flex items-center gap-2 font-medium hover:underline"
                  style={{ color: currentRestaurant.accent_color }}
                >
                  <NavigationIcon className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: currentRestaurant.secondary_color }}
              >
                <Phone className="w-6 h-6" style={{ color: currentRestaurant.primary_color }} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Phone</h4>
                <a
                  href={`tel:${currentRestaurant.phone}`}
                  className="text-gray-600 hover:underline"
                >
                  {currentRestaurant.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: currentRestaurant.secondary_color }}
              >
                <Mail className="w-6 h-6" style={{ color: currentRestaurant.primary_color }} />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Email</h4>
                <a
                  href={`mailto:${currentRestaurant.email}`}
                  className="text-gray-600 hover:underline"
                >
                  {currentRestaurant.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6" style={{ color: currentRestaurant.primary_color }} />
            <h3 className="text-2xl font-bold" style={{ color: currentRestaurant.primary_color }}>
              Hours of Operation
            </h3>
          </div>

          <div className="space-y-3">
            {days.map(day => {
              const hours = currentRestaurant.hours[day];
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
                    isToday ? 'shadow-md' : ''
                  }`}
                  style={
                    isToday
                      ? { backgroundColor: currentRestaurant.secondary_color }
                      : {}
                  }
                >
                  <span
                    className={`font-semibold capitalize ${isToday ? 'text-lg' : ''}`}
                    style={isToday ? { color: currentRestaurant.primary_color } : {}}
                  >
                    {day}
                    {isToday && (
                      <span
                        className="ml-2 px-2 py-1 text-xs rounded-full text-white"
                        style={{
                          backgroundColor: isOpen()
                            ? '#10B981'
                            : '#EF4444',
                        }}
                      >
                        {isOpen() ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                  </span>
                  <span className={`text-gray-600 ${isToday ? 'font-semibold' : ''}`}>
                    {hours.is_closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl overflow-hidden shadow-xl h-96">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
            `${currentRestaurant.address}, ${currentRestaurant.city}, ${currentRestaurant.state} ${currentRestaurant.zip}`
          )}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};
