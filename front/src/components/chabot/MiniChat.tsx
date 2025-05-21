'use client';

import { useChat } from '@/context/ChatContext';

interface MiniChatProps {
  onClose: () => void;
}

const MiniChat = ({ onClose }: MiniChatProps) => {
  const { input, setInput, messages, sendMessage, startChat, chatStarted } = useChat();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col h-96">
      <div className="flex justify-between items-center px-4 py-2 bg-brand-500 text-white rounded-t-xl">
        <span>GaryBot</span>
        <button onClick={onClose} aria-label="Fermer">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-800 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-3 py-2 rounded-lg ${
                msg.from === 'user'
                  ? 'bg-brand-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!chatStarted) {
            startChat(input.trim());
          } else {
            sendMessage();
          }
        }}
        className="flex px-4 py-2 gap-2 border-t border-gray-200 dark:border-gray-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />
        <button type="submit" className="bg-brand-500 text-white px-4 rounded-md hover:bg-brand-600 transition">
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default MiniChat;
