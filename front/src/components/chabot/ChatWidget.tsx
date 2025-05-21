'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center hover:bg-brand-600 transition"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-80 max-w-full h-[400px] bg-white dark:bg-gray-900 rounded-xl shadow-xl flex flex-col border border-gray-300 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-500 text-white px-4 py-2 rounded-t-xl font-semibold text-lg">
            <span>GaryBot</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
            {messages.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Salut ! Pose ta question ici.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-1.5 rounded-md text-sm break-words ${
                  msg.from === 'user'
                    ? 'bg-brand-500 text-white self-end rounded-br-none'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white self-start rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex px-3 py-2 border-t border-gray-300 dark:border-gray-700 gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris un message..."
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="bg-brand-500 text-white px-4 py-2 rounded-md hover:bg-brand-600 transition text-sm"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
