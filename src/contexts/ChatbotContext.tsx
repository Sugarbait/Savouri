import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isChatbotOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  addItemToChatbot: (itemId: string, itemName: string) => void;
  pendingItem: { id: string; name: string } | null;
  clearPendingItem: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ id: string; name: string } | null>(null);

  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);

  const addItemToChatbot = (itemId: string, itemName: string) => {
    setPendingItem({ id: itemId, name: itemName });
    setIsChatbotOpen(true);
  };

  const clearPendingItem = () => {
    setPendingItem(null);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isChatbotOpen,
        openChatbot,
        closeChatbot,
        addItemToChatbot,
        pendingItem,
        clearPendingItem,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};
