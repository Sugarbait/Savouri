import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
import { CartProvider } from './contexts/CartContext';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { RestaurantHero } from './components/RestaurantHero';
import { FeaturedItems } from './components/FeaturedItems';
import { MenuSection } from './components/MenuSection';
import { LocationSection } from './components/LocationSection';
import { AboutSection } from './components/AboutSection';
import { Chatbot } from './components/Chatbot';
import { RestaurantBrowser } from './components/RestaurantBrowser';
import { AddRestaurantForm } from './components/AddRestaurantForm';

type NavSection = 'home' | 'menu' | 'location' | 'about';
type AppView = 'browser' | 'restaurant' | 'add-restaurant';

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [appView, setAppView] = useState<AppView>('browser');
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();
  const { user, loading } = useAuth();

  const handleSelectRestaurant = (slug: string) => {
    setCurrentRestaurant(slug);
    setAppView('restaurant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddRestaurant = () => {
    setAppView('add-restaurant');
  };

  const handleBackToBrowser = () => {
    setAppView('browser');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (appView === 'add-restaurant') {
    return (
      <AddRestaurantForm
        onClose={handleBackToBrowser}
        onSuccess={handleBackToBrowser}
      />
    );
  }

  if (appView === 'browser' || !currentRestaurant) {
    return <RestaurantBrowser onSelectRestaurant={handleSelectRestaurant} onAddRestaurant={handleAddRestaurant} />;
  }

  return (
    <CartProvider>
      <ChatbotProvider>
        <div className="min-h-screen bg-white">
          <Navigation activeSection={activeSection} onNavigate={setActiveSection} />

          {activeSection === 'home' && (
            <>
              <RestaurantHero />
              <MenuSection />
              <FeaturedItems />
            </>
          )}

          {activeSection === 'menu' && <MenuSection />}

          {activeSection === 'location' && <LocationSection />}

          {activeSection === 'about' && <AboutSection />}

          <Chatbot />
        </div>
      </ChatbotProvider>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <AppContent />
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;
