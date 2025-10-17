import React, { useState } from 'react';
import { UtensilsCrossed, Sparkles, TrendingUp, Heart, ChefHat, Clock, Star, ArrowRight } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl shadow-lg">
                <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Savouri
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => handleOpenAuth('signin')}
                className="px-3 sm:px-6 py-2 text-sm sm:text-base text-gray-700 font-semibold hover:text-orange-500 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleOpenAuth('signup')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce">
            <Star className="w-4 h-4 fill-current" />
            <span>Trusted by thousands of food lovers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight px-4">
            Your Favorite Food,
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent">
              Just a Click Away
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Discover amazing restaurants, order delicious meals, and enjoy seamless delivery right to your door.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <button
              onClick={() => handleOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-2xl hover:shadow-orange-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Start Ordering Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleOpenAuth('signin')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 rounded-full text-lg font-bold hover:bg-gray-50 transition-all shadow-xl border-2 border-gray-200 hover:border-orange-300"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Demo Account Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 mb-12 sm:mb-16 border border-orange-100 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Try Demo Account</h2>
            <p className="text-gray-600">Experience Savouri with full access</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-5 border-2 border-orange-200 transform hover:scale-[1.02] transition-transform">
              <p className="text-sm font-semibold text-gray-700 mb-2">Email Address</p>
              <p className="text-base sm:text-lg font-mono text-gray-900 break-all">demo@savouri.com</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-5 border-2 border-orange-200 transform hover:scale-[1.02] transition-transform">
              <p className="text-sm font-semibold text-gray-700 mb-2">Password</p>
              <p className="text-base sm:text-lg font-mono text-gray-900">demo123456</p>
            </div>
            <button
              onClick={() => handleOpenAuth('signin')}
              className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Sign In with Demo Account
            </button>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 px-4">
            New here? The demo account will be created automatically on first use
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-orange-100">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Discover Restaurants
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Browse hundreds of restaurants and find your next favorite meal with our smart search
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-orange-100">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Easy Ordering
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Order in just a few clicks with our intuitive ordering system and secure checkout
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-orange-100 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Track Orders
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Real-time order tracking and instant updates on your delivery status
            </p>
          </div>
        </div>

        {/* CTA Section for Business Owners */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6">
              Own a Restaurant?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Join Savouri and reach thousands of hungry customers. Create your business account and start growing today.
            </p>
            <button
              onClick={() => handleOpenAuth('signup')}
              className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-orange-600 rounded-full text-lg sm:text-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Create Business Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      )}
    </div>
  );
};
