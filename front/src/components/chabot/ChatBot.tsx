'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';

// Type pour la réponse de l'API Vehicle
interface VehicleResponse {
  id: number;
  user: string;
  immat: string;
  marque: string;
  modele: string;
  dateMiseCirculation: string;
  energie: string;
  co2: number;
  puissanceFiscale: number;
  puissanceReelle: number;
  carrosserie: string;
  boiteVitesse: string;
  nbPassagers: number;
  nbPortes: number;
  nomCommercial: string;
  vin: string;
  couleur: string;
  logoMarque: string;
  km: number;
}

const ChatBot: React.FC = () => {
  const { messages, input, setInput, sendMessage, resetChat, chatStarted } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // États pour l'ajout de véhicule
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicleStep, setVehicleStep] = useState<number>(0);
  const [vehicleData, setVehicleData] = useState<{ immat: string; km: number }>({ immat: '', km: 0 });
  const [vehicleMessages, setVehicleMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([]);

  // État pour stocker le dernier véhicule créé
  const [lastVehicle, setLastVehicle] = useState<{
    nomCommercial: string;
    marque: string;
    km: number;
    logoMarque: string;
  } | null>(null);

  // Nom de l'utilisateur (à récupérer dynamiquement si besoin)
  const userName = 'Maxime';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, vehicleMessages]);

  const handleBack = () => {
    if (addingVehicle) {
      setAddingVehicle(false);
      setVehicleStep(0);
      setVehicleMessages([]);
      setLastVehicle(null);
    }
    resetChat();
  };

  const startAddVehicle = () => {
    setAddingVehicle(true);
    setVehicleStep(1);
    setVehicleMessages([
      { from: 'bot', text: `Bienvenue ${userName} ! Commençons l'ajout de votre véhicule.` },
      { from: 'bot', text: '📋 Veuillez saisir la plaque d’immatriculation :' },
    ]);
    setInput('');
    setLastVehicle(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (addingVehicle) {
      const value = input.trim();
      if (!value) return;

      setVehicleMessages(ms => [...ms, { from: 'user', text: value }]);
      setInput('');

      if (vehicleStep === 1) {
        setVehicleData(d => ({ ...d, immat: value }));
        setVehicleStep(2);
        setVehicleMessages(ms => [...ms, { from: 'bot', text: '🧭 Combien de kilomètres ?' }]);
      } else if (vehicleStep === 2) {
        const km = parseInt(value, 10);
        if (isNaN(km)) {
          setVehicleMessages(ms => [...ms, { from: 'bot', text: '⚠️ Merci de saisir un nombre valide pour les kilomètres.' }]);
          return;
        }
        setVehicleData(d => ({ ...d, km }));

        // Envoi à l'API avec JWT
        const token = localStorage.getItem('token');
        fetch('httpS://localhost:8000/api/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json',
            'Accept': 'application/ld+json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ immat: vehicleData.immat, km }),
        })
          .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            return res.json() as Promise<VehicleResponse>;  
          })
          .then(json => {
            setLastVehicle({
              nomCommercial: json.nomCommercial,
              marque: json.marque,
              km: json.km,
              logoMarque: json.logoMarque,
            });
            setVehicleMessages(ms => [...ms, { from: 'bot', text: '✅ Véhicule ajouté avec succès !' }]);
          })
          .catch(err => {
            setVehicleMessages(ms => [...ms, { from: 'bot', text: `❌ Erreur lors de l'ajout : ${err.message}` }]);
          })
          .finally(() => {
            setTimeout(() => {
              setAddingVehicle(false);
              setVehicleStep(0);
              setVehicleMessages([]);
            }, 2000);
          });
      }
      return;
    }

    // Chat IA standard
    sendMessage();
  };

  // Menu principal
  if (!chatStarted && !addingVehicle) {
    return (
      <div className="w-full max-w-3xl mx-auto h-[70vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        <header className="flex items-center gap-2 bg-brand-500 text-white px-5 py-3 font-semibold text-lg rounded-t-xl">
          <span className="text-2xl">💬</span>
          <span>GaryBot</span>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3">Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={startAddVehicle}
              className="flex items-center p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition text-left"
            >
              <span className="text-3xl mr-3">🚗</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Ajouter un véhicule</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Enregistrer plaque et kilométrage</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat ou ajout de véhicule
  const activeMessages = addingVehicle ? vehicleMessages : messages;

  return (
    <div className="w-full max-w-3xl mx-auto h-[70vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
      <header className="flex items-center gap-3 bg-brand-500 text-white px-5 py-3 rounded-t-xl">
        <button
          onClick={handleBack}
          aria-label="Retour au menu"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 transition text-white"
        >
          ←
        </button>
        <span className="text-2xl">💬</span>
        <span>GaryBot</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-800 flex flex-col">
        {/* Card de confirmation */}
        {lastVehicle && (
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl shadow p-4 mb-4">
            <div className="w-16 h-16 relative mr-4">
              <Image
                src={lastVehicle.logoMarque}
                alt={`${lastVehicle.marque} logo`}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="text-gray-800 dark:text-gray-100">
              <h3 className="text-lg font-semibold">{lastVehicle.nomCommercial}</h3>
              <p>Marque : <span className="font-medium">{lastVehicle.marque}</span></p>
              <p>Kilométrage : <span className="font-medium">{lastVehicle.km.toLocaleString()} km</span></p>
            </div>
          </div>
        )}

        {/* Messages */}
        {activeMessages.map((msg, index) => (
          <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg break-words ${
                msg.from === 'user'
                  ? 'bg-brand-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={addingVehicle ? (vehicleStep === 1 ? 'Ex. AB-123-CD' : 'Ex. 120000') : 'Écris un message…'}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base"
        />
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition text-base">
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ChatBot;