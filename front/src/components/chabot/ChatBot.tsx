'use client';

import React, { useState, useRef, useEffect } from "react";

const frequentQuestions = [
  {
    emoji: "🛠️",
    title: "Révision et entretien",
    subtitle: "Conseils sur les révisions constructeur, filtres, vidanges…",
  },
  {
    emoji: "🛑",
    title: "Freins",
    subtitle: "Infos sur plaquettes, disques, durée de vie, symptômes d’usure.",
  },
  {
    emoji: "❄️",
    title: "Climatisation",
    subtitle: "Quand faire la recharge ? Contrôle d’étanchéité ?",
  },
  {
    emoji: "🔋",
    title: "Batterie",
    subtitle: "Signes de faiblesse, durée de vie, type adapté.",
  },
];

const ChatBot = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = (initialMessage: string) => {
    setMessages([
      { from: "user", text: initialMessage },
      { from: "bot", text: "Merci pour votre question ! Voici une réponse automatique pour le moment." },
    ]);
    setChatStarted(true);
    setInput("");
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: input.trim() },
      { from: "bot", text: "Merci pour votre question ! Voici une réponse automatique pour le moment." },
    ]);
    setInput("");
  };

  const handleBack = () => {
    setChatStarted(false);
    setMessages([]);
    setInput("");
  };

  if (!chatStarted) {
    return (
      <div className="w-full max-w-3xl mx-auto h-[70vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        <header className="flex items-center gap-2 bg-brand-500 text-white px-5 py-3 font-semibold text-base sm:text-lg rounded-t-xl">
          <span>GaryBot</span>
        </header>

        <div className="px-6 py-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg">
          Bonjour ! Posez-moi une question ou choisissez une thématique ci-dessous pour commencer.
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {frequentQuestions.map(({ emoji, title, subtitle }, idx) => (
              <button
                key={idx}
                onClick={() => startChat(title)}
                className="flex flex-col p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition text-left"
              >
                <div className="flex items-center gap-3 mb-2 select-none text-3xl">
                  <span>{emoji}</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{title}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) startChat(input.trim());
          }}
          className="px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            placeholder="Posez votre question ici..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition text-base"
          >
            Envoyer
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto h-[70vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 bg-brand-500 text-white px-5 py-3 font-semibold text-base sm:text-lg rounded-t-xl">
        <button
          onClick={handleBack}
          aria-label="Retour au menu"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 transition text-white"
          title="Retour au menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-2xl select-none">💬</span>
        <span>GaryBot</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-gray-50 dark:bg-gray-800 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg text-base break-words ${
                msg.from === "user"
                  ? "bg-brand-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <form
          className="flex flex-col sm:flex-row gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            value={input}
            placeholder="Écris un message..."
            className="flex-1 px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition text-base"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
