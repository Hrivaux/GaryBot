'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Message = { from: 'user' | 'bot'; text: string };

interface ChatContextType {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  sendMessage: (message?: string) => void;
  resetChat: () => void;
  chatStarted: boolean;
  startChat: (initialMessage: string) => void;
  isMiniChatOpen: boolean;
  setMiniChatOpen: (val: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [isMiniChatOpen, setMiniChatOpen] = useState(false)

  const sendMessage = (msg?: string) => {
    const text = msg ?? input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { from: 'user', text },
      { from: 'bot', text: 'Merci pour votre question ! Voici une réponse automatique pour le moment.' },
    ]);
    setInput('');
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setChatStarted(false);
  };

  const startChat = (initialMessage: string) => {
    if (!chatStarted) {
      setChatStarted(true);
      sendMessage(initialMessage);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        setInput,
        sendMessage,
        resetChat,
        chatStarted,
        startChat,
        isMiniChatOpen,
        setMiniChatOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
