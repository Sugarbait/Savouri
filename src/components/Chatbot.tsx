import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useCart } from '../contexts/CartContext';
import { useChatbot } from '../contexts/ChatbotContext';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';
import { MessageSquare, Send, X, ShoppingCart, Plus, Minus, Trash2, Star } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const Chatbot: React.FC = () => {
  const { currentRestaurant, menuItems, menuCategories } = useRestaurant();
  const { getCartTotal, getCartItemCount, addToCart, cart, clearCart } = useCart();
  const { isChatbotOpen, openChatbot, closeChatbot, pendingItem, clearPendingItem } = useChatbot();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatbotOpen && messages.length === 0 && currentRestaurant) {
      const greeting: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `Hi! Welcome to ${currentRestaurant.name}! 👋\n\nI'm your AI ordering assistant. I can help you discover delicious ${currentRestaurant.cuisine_type} dishes, answer questions about our menu, and make personalized recommendations.\n\nWhat sounds good to you today?`,
        timestamp: new Date(),
        suggested_actions: [
          { label: 'Show Me Popular Dishes', action: 'show_featured', data: null },
          { label: 'Browse Full Menu', action: 'show_menu', data: null },
          { label: 'Surprise Me!', action: 'get_recommendation', data: null },
        ],
      };
      setMessages([greeting]);
    }
  }, [isChatbotOpen, currentRestaurant, messages.length]);

  useEffect(() => {
    if (pendingItem && currentRestaurant) {
      const item = menuItems.find(m => m.id === pendingItem.id);
      if (item) {
        const itemMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Great choice! You've selected ${item.name}. Would you like to add this to your order?`,
          timestamp: new Date(),
          menu_items: [item],
          suggested_actions: [
            { label: 'Add to Order', action: 'add_item', data: item.id },
            { label: 'View Similar Items', action: 'show_category', data: item.category_id },
            { label: 'Keep Browsing', action: 'show_menu', data: null },
          ],
        };
        setMessages(prev => [...prev, itemMessage]);
        clearPendingItem();
      }
    }
  }, [pendingItem, menuItems, currentRestaurant, clearPendingItem]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUpsellItems = () => {
    if (!currentRestaurant || cart.length === 0) return [];

    const cartItemIds = new Set(cart.map(item => item.menu_item_id));
    const cartCategoryIds = new Set(
      cart.map(item => menuItems.find(mi => mi.id === item.menu_item_id)?.category_id).filter(Boolean)
    );

    const beverageCategory = menuCategories.find(
      cat => cat.restaurant_id === currentRestaurant.id && cat.name.toLowerCase().includes('beverage')
    );
    const appetizersCategory = menuCategories.find(
      cat => cat.restaurant_id === currentRestaurant.id && cat.name.toLowerCase().includes('appetizer')
    );
    const dessertsCategory = menuCategories.find(
      cat => cat.restaurant_id === currentRestaurant.id && cat.name.toLowerCase().includes('dessert')
    );

    const upsellItems = [];

    if (beverageCategory && !cartCategoryIds.has(beverageCategory.id)) {
      const drinks = menuItems.filter(
        item => item.category_id === beverageCategory.id && !cartItemIds.has(item.id)
      ).slice(0, 2);
      upsellItems.push(...drinks);
    }

    if (appetizersCategory && !cartCategoryIds.has(appetizersCategory.id)) {
      const appetizers = menuItems.filter(
        item => item.category_id === appetizersCategory.id && !cartItemIds.has(item.id) && item.is_featured
      ).slice(0, 1);
      upsellItems.push(...appetizers);
    }

    if (dessertsCategory && !cartCategoryIds.has(dessertsCategory.id)) {
      const desserts = menuItems.filter(
        item => item.category_id === dessertsCategory.id && !cartItemIds.has(item.id) && item.is_featured
      ).slice(0, 1);
      upsellItems.push(...desserts);
    }

    return upsellItems.slice(0, 3);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentRestaurant) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    // DIRECT CLIENT-SIDE FILTERING - Just like the "Show Popular Dishes" button!
    const queryLower = userQuery.toLowerCase();
    let directFilteredItems: typeof menuItems | null = null;
    let directContent = '';

    // CRITICAL: Check for allergy-related queries FIRST
    if (/\b(allerg(y|ies|ic)|peanut|nut|shellfish|dairy|egg|soy|wheat|gluten|sesame|fish)\b/i.test(queryLower)) {
      setIsTyping(false);
      const phoneNumber = currentRestaurant.phone || 'the restaurant';
      const allergyWarning: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ IMPORTANT ALLERGY NOTICE\n\nI understand you have allergy concerns. For your safety, please contact us directly at ${phoneNumber} to speak with our staff about:\n\n• Specific allergen information\n• Cross-contamination risks\n• Ingredient details\n• Kitchen preparation methods\n\nWhile I can show you our menu items, **I cannot guarantee** any dish is completely safe for severe allergies. We recommend calling us before placing your order so our team can guide you on safe options and ensure proper kitchen precautions.\n\nWould you like to see our menu while you discuss safe options with our team?`,
        timestamp: new Date(),
        suggested_actions: [
          { label: 'View Full Menu', action: 'show_menu', data: null },
          { label: 'Show Popular Dishes', action: 'show_featured', data: null },
        ],
      };
      setMessages(prev => [...prev, allergyWarning]);
      return;
    }

    // Check for menu item queries and filter directly
    if (/\b(vegan|vegetarian)\b/i.test(queryLower)) {
      directFilteredItems = menuItems.filter(item =>
        item.is_available && item.dietary_tags.some(tag => /vegan|vegetarian/i.test(tag))
      ).slice(0, 12);
      directContent = "Here are our vegan and vegetarian options:";
    } else if (/\bgluten[- ]?free\b/i.test(queryLower)) {
      directFilteredItems = menuItems.filter(item =>
        item.is_available && item.dietary_tags.some(tag => /gluten/i.test(tag))
      ).slice(0, 12);
      directContent = "Here are our gluten-free options:";
    } else if (/\b(no fish|without fish|no seafood)\b/i.test(queryLower)) {
      directFilteredItems = menuItems.filter(item =>
        item.is_available && !/fish|salmon|tuna|shrimp|crab|lobster|seafood|sashimi|nigiri|eel/i.test(item.name + ' ' + item.description)
      ).slice(0, 12);
      directContent = "Here are our dishes without fish:";
    } else if (/\b(fish|seafood|salmon|tuna)\b/i.test(queryLower)) {
      directFilteredItems = menuItems.filter(item =>
        item.is_available && /fish|salmon|tuna|shrimp|crab|lobster|seafood|sashimi|nigiri|eel/i.test(item.name + ' ' + item.description)
      ).slice(0, 12);
      directContent = "Here are our fish options:";
    } else if (/\b(popular|best|recommend|featured|top)\b/i.test(queryLower)) {
      directFilteredItems = menuItems.filter(item => item.is_featured).slice(0, 12);
      directContent = "Here are our most popular dishes:";
    }

    // If we have direct filtered items, show them immediately and skip AI
    if (directFilteredItems && directFilteredItems.length > 0) {
      setIsTyping(false);
      const directMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: directContent,
        timestamp: new Date(),
        menu_items: directFilteredItems,
      };
      setMessages(prev => [...prev, directMessage]);
      return;
    }

    try {
      // Get menu items with category names
      const menuItemsWithCategories = menuItems.map(item => {
        const category = menuCategories.find(cat => cat.id === item.category_id);
        return {
          ...item,
          category_name: category?.name || 'General'
        };
      });

      // Prepare messages for Claude
      const apiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: inputValue
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          restaurantContext: {
            name: currentRestaurant.name,
            cuisine_type: currentRestaurant.cuisine_type,
            description: currentRestaurant.description,
            city: currentRestaurant.city,
            state: currentRestaurant.state,
            address: currentRestaurant.address,
            phone: currentRestaurant.phone,
          },
          menuItems: menuItemsWithCategories,
          restaurantHours: currentRestaurant.hours,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // CRITICAL: Check if this is an allergy warning response - DO NOT auto-show items
      const isAllergyResponse = /⚠️.*ALLERGY|allergy concerns|For your safety.*contact/i.test(data.message);

      // Parse the response to extract SHOW: lines and convert to visual cards
      const lines = data.message.split('\n');
      const showItems: string[] = [];
      const cleanedLines: string[] = [];

      for (const line of lines) {
        if (line.trim().startsWith('SHOW:')) {
          const itemName = line.trim().substring(5).trim();
          showItems.push(itemName);
        } else {
          cleanedLines.push(line);
        }
      }

      let content = cleanedLines.join('\n').trim();
      let itemsToShow = showItems
        .map(name => menuItems.find(item => item.name.toLowerCase() === name.toLowerCase()))
        .filter((item): item is typeof menuItems[0] => item !== undefined);

      // If no SHOW: items found, ALWAYS try to detect menu item names in the response
      // UNLESS this is an allergy warning response
      if (itemsToShow.length === 0 && !isAllergyResponse) {
        // Try to find menu item names mentioned in the response
        let detectedItems: typeof menuItems = [];

        for (const item of menuItems) {
          // Check if item name appears in the response (with word boundaries)
          const nameRegex = new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (nameRegex.test(content)) {
            detectedItems.push(item);
          }
        }

        // If still no items detected, use intelligent filtering based on the user's query
        if (detectedItems.length === 0) {
          const userQuery = inputValue.toLowerCase();

          // Check if user is asking about menu items - expanded keywords
          const isMenuQuery = /\b(show|what|items|dishes|menu|food|have|options|recommend|best|popular|good|vegetarian|vegan|fish|meat|gluten|dairy|spicy|without|no|want|get|order)\b/i.test(userQuery);

          if (isMenuQuery) {
            // Filter items based on common query patterns
            let filteredItems = menuItems.filter(item => item.is_available);

            // Dietary/ingredient filters
            if (/\b(vegan|vegetarian)\b/i.test(userQuery)) {
              filteredItems = filteredItems.filter(item =>
                item.dietary_tags.some(tag => /vegan|vegetarian/i.test(tag))
              );
            } else if (/\bgluten[- ]?free\b/i.test(userQuery)) {
              filteredItems = filteredItems.filter(item =>
                item.dietary_tags.some(tag => /gluten/i.test(tag))
              );
            } else if (/\b(no fish|without fish|no seafood)\b/i.test(userQuery)) {
              // Items without fish - check description and name
              filteredItems = filteredItems.filter(item =>
                !/fish|salmon|tuna|shrimp|crab|lobster|seafood|sashimi|nigiri|eel/i.test(item.name + ' ' + item.description)
              );
            } else if (/\b(fish|seafood|salmon|tuna)\b/i.test(userQuery)) {
              // Items with fish
              filteredItems = filteredItems.filter(item =>
                /fish|salmon|tuna|shrimp|crab|lobster|seafood|sashimi|nigiri|eel/i.test(item.name + ' ' + item.description)
              );
            } else if (/\b(popular|best|recommend|featured|top)\b/i.test(userQuery)) {
              filteredItems = filteredItems.filter(item => item.is_featured);
            }

            // ALWAYS add filtered items if we have any - limit to 12 for display
            if (filteredItems.length > 0) {
              detectedItems = filteredItems.slice(0, 12);
            } else if (/\b(popular|best|recommend|featured|top)\b/i.test(userQuery)) {
              // Fallback to featured items if query is for recommendations
              detectedItems = menuItems.filter(item => item.is_featured).slice(0, 6);
            }
          }
        }

        // If we found items, ALWAYS show them as cards and clean up the content
        if (detectedItems.length > 0) {
          itemsToShow = detectedItems;

          // Remove ALL lines that mention menu items or have detailed descriptions
          const lines = content.split('\n');
          const simplifiedLines = lines.filter(line => {
            const trimmedLine = line.trim();

            // Skip empty lines
            if (!trimmedLine) return false;

            // Remove lines with prices
            if (/\$\d+/.test(trimmedLine)) return false;

            // Remove lines with numbers at start (like "1. Item Name")
            if (/^\d+\./.test(trimmedLine)) return false;

            // Remove lines that contain any detected menu item names
            for (const item of detectedItems) {
              const nameRegex = new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              if (nameRegex.test(trimmedLine)) return false;
            }

            // Keep short intro/outro lines (under 150 chars)
            if (trimmedLine.length < 150) return true;

            return false;
          });

          content = simplifiedLines.join('\n').trim();

          // If there's no intro text left, extract just the first sentence
          if (!content || content.length < 10) {
            const firstSentence = data.message.split(/[.!?]/)[0];
            content = firstSentence && firstSentence.length > 10 && firstSentence.length < 200
              ? firstSentence + ':'
              : "Here are the dishes that match your request:";
          } else if (!content.endsWith(':')) {
            // Add a colon at the end if not present
            content = content.replace(/[,.]$/, '') + ':';
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        menu_items: itemsToShow.length > 0 ? itemsToShow : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    // Reset to initial greeting message
    if (currentRestaurant) {
      const greeting: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `Hi! Welcome to ${currentRestaurant.name}! 👋\n\nI'm your AI ordering assistant. I can help you discover delicious ${currentRestaurant.cuisine_type} dishes, answer questions about our menu, and make personalized recommendations.\n\nWhat sounds good to you today?`,
        timestamp: new Date(),
        suggested_actions: [
          { label: 'Show Me Popular Dishes', action: 'show_featured', data: null },
          { label: 'Browse Full Menu', action: 'show_menu', data: null },
          { label: 'Surprise Me!', action: 'get_recommendation', data: null },
        ],
      };
      setMessages([greeting]);
    }
  };

  const generateResponse = (input: string): ChatMessage => {
    if (input.includes('pizza') || input.includes('margherita')) {
      const pizzas = menuItems.filter(item => item.category_id === 'cat-3');
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Great choice! Here are our delicious pizzas. Click any item to add it to your order:`,
        timestamp: new Date(),
        menu_items: pizzas.slice(0, 3),
        suggested_actions: [
          { label: 'Add to Order', action: 'add_item', data: pizzas[0]?.id },
          { label: 'See More Options', action: 'show_category', data: 'cat-3' },
        ],
      };
    }

    if (input.includes('pasta') || input.includes('spaghetti') || input.includes('fettuccine')) {
      const pastas = menuItems.filter(item => item.category_id === 'cat-2');
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Our pasta dishes are amazing! Here are some favorites. Click any item to add it to your order:`,
        timestamp: new Date(),
        menu_items: pastas,
        suggested_actions: [
          { label: 'Add to Order', action: 'add_item', data: pastas[0]?.id },
        ],
      };
    }

    if (input.includes('dessert') || input.includes('tiramisu') || input.includes('sweet')) {
      const desserts = menuItems.filter(item => item.category_id === 'cat-4');
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Perfect way to end your meal! Check out our desserts. Click any item to add it to your order:`,
        timestamp: new Date(),
        menu_items: desserts,
      };
    }

    if (input.includes('cart') || input.includes('order')) {
      const itemCount = getCartItemCount();
      const total = getCartTotal();
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: itemCount > 0
          ? `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your order. Your total is $${total.toFixed(2)}. Ready to place your order?`
          : `Your order is empty. Let me help you find something delicious!`,
        timestamp: new Date(),
        suggested_actions: itemCount > 0
          ? [
              { label: 'Place Order', action: 'checkout', data: null },
              { label: 'Add More Items', action: 'show_menu', data: null },
            ]
          : [
              { label: 'View Popular Items', action: 'show_featured', data: null },
              { label: 'Browse Menu', action: 'show_menu', data: null },
            ],
      };
    }

    if (input.includes('popular') || input.includes('recommend') || input.includes('featured')) {
      const featured = menuItems.filter(item => item.is_featured);
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are our most popular dishes that customers love. Click any item to add it to your order:`,
        timestamp: new Date(),
        menu_items: featured,
        suggested_actions: [
          { label: 'Add to Order', action: 'add_item', data: featured[0]?.id },
        ],
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I can help you with that! Here are some options you might like. Click any item to add it to your order:`,
      timestamp: new Date(),
      menu_items: menuItems.slice(0, 3),
      suggested_actions: [
        { label: 'Show All Menu', action: 'show_menu', data: null },
        { label: 'View Order', action: 'show_cart', data: null },
      ],
    };
  };

  const handleSuggestedAction = async (action: string, data?: any) => {
    if (action === 'get_recommendation') {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Surprise me with a recommendation!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('Surprise me with something delicious! What do you recommend?');
      await handleSendMessage();
      return;
    }

    if (action === 'show_featured') {
      const featured = menuItems.filter(item => item.is_featured);
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are our most popular dishes that customers love. Click any item to add it to your order:`,
        timestamp: new Date(),
        menu_items: featured,
        suggested_actions: [
          { label: 'Browse Full Menu', action: 'show_menu', data: null },
        ],
      };
      setMessages(prev => [...prev, message]);
    } else if (action === 'show_menu') {
      const popularItems = menuItems.filter(item => item.is_featured).slice(0, 6);
      const allItems = popularItems.length > 0 ? popularItems : menuItems.slice(0, 6);

      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: popularItems.length > 0
          ? "Here are our most popular items. Click any item to add it to your order!"
          : "Here's what we have available. Click any item to add it to your order!",
        timestamp: new Date(),
        menu_items: allItems,
        suggested_actions: [
          { label: 'Show More', action: 'show_all_items', data: null },
          { label: 'View Order', action: 'show_cart', data: null },
        ],
      };
      setMessages(prev => [...prev, message]);
    } else if (action === 'show_all_items') {
      const allItems = menuItems.slice(0, 12);
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Here's our full menu. Click any item to add it to your order!",
        timestamp: new Date(),
        menu_items: allItems,
        suggested_actions: [
          { label: 'View Order', action: 'show_cart', data: null },
        ],
      };
      setMessages(prev => [...prev, message]);
    } else if (action === 'show_cart') {
      const itemCount = getCartItemCount();
      const total = getCartTotal();

      let content = '';
      if (itemCount > 0) {
        content = `Here's your order:\n\n`;
        cart.forEach((cartItem, index) => {
          const menuItem = menuItems.find(m => m.id === cartItem.menu_item_id);
          const itemTotal = cartItem.price * cartItem.quantity;
          content += `${index + 1}. ${cartItem.name}\n   Qty: ${cartItem.quantity} × $${cartItem.price.toFixed(2)} = $${itemTotal.toFixed(2)}`;
          if (cartItem.customizations && cartItem.customizations.length > 0) {
            content += `\n   (${cartItem.customizations.join(', ')})`;
          }
          content += '\n\n';
        });
        content += `━━━━━━━━━━━━━━━━━━━\nTotal: $${total.toFixed(2)}\n\nReady to place your order?`;
      } else {
        content = `Your cart is empty. Let me help you find something delicious!`;
      }

      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        suggested_actions: itemCount > 0
          ? [
              { label: 'Place Order', action: 'place_order', data: null },
              { label: 'Add More Items', action: 'show_menu', data: null },
              { label: 'Clear Cart', action: 'clear_cart', data: null },
            ]
          : [
              { label: 'View Popular Items', action: 'show_featured', data: null },
              { label: 'Browse Menu', action: 'show_menu', data: null },
            ],
      };
      setMessages(prev => [...prev, message]);
    } else if (action === 'add_item' && data) {
      if (!user) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Please sign in to add items to your cart and place orders.',
          timestamp: new Date(),
          suggested_actions: [
            { label: 'Sign In', action: 'show_auth', data: null },
            { label: 'Keep Browsing', action: 'show_menu', data: null },
          ],
        };
        setMessages(prev => [...prev, message]);
        return;
      }

      const item = menuItems.find(m => m.id === data);
      if (item) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `Add ${item.name} to my cart`,
          timestamp: new Date(),
        };

        addToCart({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          customizations: []
        });

        const newTotal = getCartTotal() + item.price;
        const newItemCount = getCartItemCount() + 1;

        const upsellItems = getUpsellItems();

        const confirmMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: upsellItems.length > 0
            ? `Perfect! I've added ${item.name} ($${item.price.toFixed(2)}) to your cart. You now have ${newItemCount} item${newItemCount > 1 ? 's' : ''} totaling $${newTotal.toFixed(2)}.\n\nMight I suggest adding one of these to complete your meal?`
            : `Perfect! I've added ${item.name} ($${item.price.toFixed(2)}) to your cart. You now have ${newItemCount} item${newItemCount > 1 ? 's' : ''} totaling $${newTotal.toFixed(2)}.`,
          timestamp: new Date(),
          menu_items: upsellItems.length > 0 ? upsellItems : undefined,
          suggested_actions: [
            { label: 'Place Order', action: 'place_order', data: null },
            { label: 'View Cart', action: 'show_cart', data: null },
            { label: 'Keep Browsing', action: 'show_menu', data: null },
          ],
        };
        setMessages(prev => [...prev, userMessage, confirmMessage]);
      }
    } else if (action === 'add_item_with_quantity' && data) {
      if (!user) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Please sign in to add items to your cart and place orders.',
          timestamp: new Date(),
          suggested_actions: [
            { label: 'Sign In', action: 'show_auth', data: null },
            { label: 'Keep Browsing', action: 'show_menu', data: null },
          ],
        };
        setMessages(prev => [...prev, message]);
        return;
      }

      const item = menuItems.find(m => m.id === data.itemId);
      if (item) {
        const quantity = data.quantity;
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `Add ${quantity} ${item.name}${quantity > 1 ? 's' : ''} to my cart`,
          timestamp: new Date(),
        };

        addToCart({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          customizations: []
        });

        const itemTotal = item.price * quantity;
        const newTotal = getCartTotal() + itemTotal;
        const newItemCount = getCartItemCount() + quantity;

        const upsellItems = getUpsellItems();

        const confirmMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: upsellItems.length > 0
            ? `Perfect! I've added ${quantity} ${item.name}${quantity > 1 ? 's' : ''} ($${itemTotal.toFixed(2)}) to your cart. You now have ${newItemCount} item${newItemCount > 1 ? 's' : ''} totaling $${newTotal.toFixed(2)}.\n\nMight I suggest adding one of these to complete your meal?`
            : `Perfect! I've added ${quantity} ${item.name}${quantity > 1 ? 's' : ''} ($${itemTotal.toFixed(2)}) to your cart. You now have ${newItemCount} item${newItemCount > 1 ? 's' : ''} totaling $${newTotal.toFixed(2)}.`,
          timestamp: new Date(),
          menu_items: upsellItems.length > 0 ? upsellItems : undefined,
          suggested_actions: [
            { label: 'Place Order', action: 'place_order', data: null },
            { label: 'View Cart', action: 'show_cart', data: null },
            { label: 'Keep Browsing', action: 'show_menu', data: null },
            { label: 'Clear Cart', action: 'clear_cart', data: null },
          ],
        };
        setMessages(prev => [...prev, userMessage, confirmMessage]);
      }
    } else if (action === 'show_category' && data) {
      const categoryItems = menuItems.filter(item => item.category_id === data);
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Here are some similar items you might like. Click any item to add it to your order:',
        timestamp: new Date(),
        menu_items: categoryItems.slice(0, 6),
        suggested_actions: [
          { label: 'Keep Browsing', action: 'show_menu', data: null },
        ],
      };
      setMessages(prev => [...prev, message]);
    } else if (action === 'show_auth') {
      setAuthModalOpen(true);
    } else if (action === 'place_order') {
      if (!user) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Please sign in to place your order.',
          timestamp: new Date(),
          suggested_actions: [
            { label: 'Sign In', action: 'show_auth', data: null },
          ],
        };
        setMessages(prev => [...prev, message]);
        return;
      }

      const itemCount = getCartItemCount();
      const total = getCartTotal();

      if (itemCount === 0) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Your cart is empty. Let me help you find something delicious!`,
          timestamp: new Date(),
          suggested_actions: [
            { label: 'View Popular Items', action: 'show_featured', data: null },
            { label: 'Browse Menu', action: 'show_menu', data: null },
          ],
        };
        setMessages(prev => [...prev, message]);
        return;
      }

      // Get upsell items for checkout
      const upsellItems = getUpsellItems();

      // Also get smaller ticket items (under $10) that aren't in cart
      const cartItemIds = new Set(cart.map(item => item.menu_item_id));
      const smallerItems = menuItems
        .filter(item =>
          item.price < 10 &&
          !cartItemIds.has(item.id) &&
          item.is_available &&
          (item.name.toLowerCase().includes('fries') ||
           item.name.toLowerCase().includes('side') ||
           item.name.toLowerCase().includes('appetizer') ||
           item.name.toLowerCase().includes('bite') ||
           item.name.toLowerCase().includes('roll') ||
           item.name.toLowerCase().includes('snack') ||
           item.name.toLowerCase().includes('small'))
        )
        .slice(0, 2);

      const allUpsells = [...upsellItems, ...smallerItems].slice(0, 3);

      if (allUpsells.length > 0) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: 'Place my order',
          timestamp: new Date(),
        };

        const upsellMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Before you check out, would you like to add any of these to complete your meal? 🍟`,
          timestamp: new Date(),
          menu_items: allUpsells,
          suggested_actions: [
            { label: "No Thanks, Place Order", action: 'confirm_order', data: null },
            { label: 'Keep Browsing', action: 'show_menu', data: null },
          ],
        };

        setMessages(prev => [...prev, userMessage, upsellMessage]);
      } else {
        // No upsells available, proceed directly
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: 'Place my order',
          timestamp: new Date(),
        };

        const confirmMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Thank you for your order! Your order of ${itemCount} item${itemCount > 1 ? 's' : ''} totaling $${total.toFixed(2)} has been received.\n\nEstimated preparation time: 20-30 minutes. You'll receive a confirmation shortly with tracking details.`,
          timestamp: new Date(),
          suggested_actions: [
            { label: 'Start New Order', action: 'new_order', data: null },
          ],
        };

        setMessages(prev => [...prev, userMessage, confirmMessage]);
        clearCart();
      }
    } else if (action === 'clear_cart') {
      const itemCount = getCartItemCount();

      if (itemCount === 0) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Your cart is already empty.',
          timestamp: new Date(),
          suggested_actions: [
            { label: 'View Popular Items', action: 'show_featured', data: null },
            { label: 'Browse Menu', action: 'show_menu', data: null },
          ],
        };
        setMessages(prev => [...prev, message]);
        return;
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Clear my cart',
        timestamp: new Date(),
      };

      clearCart();

      const confirmMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Your cart has been cleared. Would you like to start a new order?',
        timestamp: new Date(),
        suggested_actions: [
          { label: 'View Popular Items', action: 'show_featured', data: null },
          { label: 'Browse Menu', action: 'show_menu', data: null },
        ],
      };

      setMessages(prev => [...prev, userMessage, confirmMessage]);
    } else if (action === 'confirm_order') {
      // User declined upsells, finalize the order
      const itemCount = getCartItemCount();
      const total = getCartTotal();

      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Thank you for your order! Your order of ${itemCount} item${itemCount > 1 ? 's' : ''} totaling $${total.toFixed(2)} has been received.\n\nEstimated preparation time: 20-30 minutes. You'll receive a confirmation shortly with tracking details.`,
        timestamp: new Date(),
        suggested_actions: [
          { label: 'Start New Order', action: 'new_order', data: null },
        ],
      };

      setMessages(prev => [...prev, confirmMessage]);
      clearCart();
    } else if (action === 'new_order') {
      const greeting: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Ready for another order? What can I get started for you today?`,
        timestamp: new Date(),
        suggested_actions: [
          { label: 'View Popular Items', action: 'show_featured', data: null },
          { label: 'Browse Menu', action: 'show_menu', data: null },
        ],
      };
      setMessages(prev => [...prev, greeting]);
    }
  };

  if (!currentRestaurant) return null;

  return (
    <>
      {!isChatbotOpen && (
        <button
          onClick={openChatbot}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-3"
          style={{ backgroundColor: currentRestaurant.accent_color }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
          {getCartItemCount() > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {getCartItemCount()}
            </div>
          )}
        </button>
      )}

      {isChatbotOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[700px] z-50 bg-white md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden">
          <div
            className="p-6 text-white flex items-center justify-between"
            style={{ backgroundColor: currentRestaurant.primary_color }}
          >
            <div className="flex items-center gap-3">
              <img
                src={currentRestaurant.logo_url}
                alt={currentRestaurant.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div>
                <h3 className="font-bold text-xl">Chat with us</h3>
                <p className="text-base opacity-90">Order easily via chat</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={closeChatbot}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {getCartItemCount() > 0 && (
            <div
              className="px-6 py-3 flex items-center justify-between text-base border-b"
              style={{ backgroundColor: currentRestaurant.secondary_color }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" style={{ color: currentRestaurant.primary_color }} />
                <span className="font-semibold">{getCartItemCount()} items</span>
              </div>
              <span className="font-bold" style={{ color: currentRestaurant.accent_color }}>
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${
                    message.menu_items && message.menu_items.length > 0
                      ? 'w-full'
                      : message.role === 'assistant' && message.suggested_actions && message.suggested_actions.length > 0
                        ? 'w-full'
                        : 'max-w-[80%]'
                  } rounded-2xl ${
                    message.role === 'assistant' && (
                      (message.menu_items && message.menu_items.length > 0) ||
                      (message.suggested_actions && message.suggested_actions.length > 0)
                    )
                      ? 'p-4 pr-4'
                      : 'p-4'
                  } ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  style={
                    message.role === 'user'
                      ? { backgroundColor: currentRestaurant.accent_color }
                      : {}
                  }
                >
                  <p className="text-base leading-relaxed whitespace-pre-line">{message.content}</p>

                  {message.menu_items && message.menu_items.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.menu_items.map(item => (
                        <div key={item.id} className="w-full bg-white rounded-xl p-3 shadow-md">
                          <div className="flex gap-3 mb-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{item.name}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-1">{item.description}</p>
                              <div className="flex items-center gap-2">
                                <p
                                  className="text-base font-bold"
                                  style={{ color: currentRestaurant.accent_color }}
                                >
                                  ${item.price.toFixed(2)}
                                </p>
                                {item.average_rating && item.average_rating > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-semibold text-gray-700">
                                      {item.average_rating.toFixed(1)}
                                    </span>
                                    {item.review_count && item.review_count > 0 && (
                                      <span className="text-xs text-gray-500">
                                        ({item.review_count})
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">No reviews</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center bg-gray-100 rounded-full h-8">
                              <button
                                onClick={() => {
                                  const currentQty = itemQuantities[item.id] || 1;
                                  if (currentQty > 1) {
                                    setItemQuantities(prev => ({ ...prev, [item.id]: currentQty - 1 }));
                                  }
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={(itemQuantities[item.id] || 1) === 1}
                              >
                                <Minus className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                              <span className="w-6 text-center font-semibold text-gray-900 text-sm">
                                {itemQuantities[item.id] || 1}
                              </span>
                              <button
                                onClick={() => {
                                  const currentQty = itemQuantities[item.id] || 1;
                                  setItemQuantities(prev => ({ ...prev, [item.id]: currentQty + 1 }));
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-200"
                              >
                                <Plus className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                const qty = itemQuantities[item.id] || 1;
                                handleSuggestedAction('add_item_with_quantity', { itemId: item.id, quantity: qty });
                                setItemQuantities(prev => ({ ...prev, [item.id]: 1 }));
                              }}
                              className="px-5 py-1.5 rounded-full font-semibold text-sm text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                              style={{ backgroundColor: currentRestaurant.accent_color }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.suggested_actions && message.suggested_actions.length > 0 && (
                    <div className="mt-3 flex flex-col items-stretch gap-2">
                      {message.suggested_actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedAction(action.action, action.data)}
                          className="w-full px-4 py-2.5 bg-white border-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                          style={{
                            borderColor: currentRestaurant.primary_color,
                            color: currentRestaurant.primary_color
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                      {message.menu_items && message.menu_items.length > 0 && getCartItemCount() > 0 && (
                        <button
                          onClick={() => handleSuggestedAction('show_cart', null)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: currentRestaurant.accent_color }}
                        >
                          Place Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-current transition-colors text-base"
                style={{ borderColor: currentRestaurant.primary_color + '40' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                style={{ backgroundColor: currentRestaurant.accent_color }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
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
