'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { garageIcon } from '@/lib/leafletIcon';



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

// Fonction de génération de prompts dynamiques via votre NLU
async function getDynamicPrompt(
  task:
    | 'welcome'
    | 'askPlate'
    | 'askKm'
    | 'invalidPlate'
    | 'invalidKm'
    | 'success'
    | 'error'
): Promise<string> {
  const token = localStorage.getItem('token');
  let userAsk = '';
  switch (task) {
    case 'welcome':
      userAsk = 'Rédige un message de bienvenue court et chaleureux indiquant que l’utilisateur est là pour l’ajout d’un véhicule (en une phrase).';
      break;
    case 'askPlate':
      userAsk = 'Rédige une question courte et chaleureuse, sans introduction, sans salutation uniquement une question courte pour demander la plaque d’immatriculation, rappelant le format AA-123-AA. Retourne moi juste la question rien de plus.';
      break;
    case 'askKm':
      userAsk = 'Rédige une question courte,sans introduction pour demander à l’utilisateur son kilométrage en entier, sans virgule ni point.';
      break;
    case 'invalidPlate':
      userAsk = 'Rédige un message d’alerte court et chaleureux indiquant que le format de plaque est invalide et rappelant le format correct AA-123-AA.';
      break;
    case 'invalidKm':
      userAsk = 'Rédige un message d’alerte court et chaleureux indiquant que le kilométrage saisi est invalide et doit être un entier sans virgule ni point.';
      break;
    case 'success':
      userAsk = 'Rédige un message de confirmation court et chaleureux pour indiquer que le véhicule a été créé avec succès et que vous allez afficher les détails.';
      break;
    case 'error':
      userAsk = 'Rédige un message d’erreur court et empathique lorsqu’une exception se produit lors de l’ajout du véhicule, en incluant le texte de l’erreur.';
      break;
  }
    const SYSTEM_CONCISE = 'Tu es GaryBot, un assistant automobile chaleureux et concis : réponses en une seule phrase, max 15 mots, sans formules longue.';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_CONCISE },
        { role: 'user',   content: userAsk }
      ]
    })
  });
  const { reply } = await res.json() as { reply: string };
  return reply;
}

const ChatBot: React.FC = () => {
    const [garageList, setGarageList] = useState<Array<{
    name: string;
    address: string;
    city: string;
    zipcode: string;
    latitude: number;
    longitude: number;
    distance: number;
  }> | null>(null);

  const { messages, input, setInput, sendMessage, resetChat, chatStarted } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // États pour l'ajout de véhicule
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicleStep, setVehicleStep] = useState<number>(0);
  const [vehicleData, setVehicleData] = useState<{ immat: string; km: number }>({ immat: '', km: 0 });
  const [vehicleMessages, setVehicleMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([]);
  const [findingGarage, setFindingGarage] = useState(false);
  const [garageMessages, setGarageMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([]);
  
const startGarageSearch = async () => {
  console.log("🔍 Recherche garage déclenchée"); // ← ajoute ceci
  setFindingGarage(true);
  setInput('');
  setGarageMessages([
    { from: 'bot', text: "Quel est votre emplacement ou votre adresse pour trouver un garage à proximité ?" }
  ]);
};


  // État pour stocker le dernier véhicule créé
  const [lastVehicle, setLastVehicle] = useState<{
    nomCommercial: string;
    marque: string;
    modele: string;
    km: number;
    logoMarque: string;
  } | null>(null);

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, vehicleMessages, garageMessages]); // ← Ajout ici


  const handleBack = () => {
    if (findingGarage) {
  setFindingGarage(false);
  setGarageMessages([]);
}

    if (addingVehicle) {
      setAddingVehicle(false);
      setVehicleStep(0);
      setVehicleMessages([]);
    }
    resetChat();
  };

  // Démarre le workflow d'ajout avec prompt dynamique (welcome + askPlate)
  const startAddVehicle = async () => {
    setAddingVehicle(true);
    setVehicleStep(1);
    setInput('');
    setLastVehicle(null);

    const welcomeMsg  = await getDynamicPrompt('welcome');
    const platePrompt = await getDynamicPrompt('askPlate');

    setVehicleMessages([
      { from: 'bot', text: welcomeMsg },
      { from: 'bot', text: platePrompt }
    ]);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (findingGarage) {
      console.log("💬 Formulaire soumis", { input, addingVehicle, findingGarage });

  const raw = input.trim();
  if (!raw) return;

  setGarageMessages((ms) => [...ms, { from: 'user', text: raw }]);
  setInput('');

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/find-garage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: raw })
    });

    const data = await res.json();

    if (Array.isArray(data.garages)) {
  setGarageList(data.garages); // ⬅️ stocke pour l’affichage carte + liste

  for (const garage of data.garages) {
    const garageInfo = `${garage.name}, ${garage.address}, ${garage.zipcode} ${garage.city} (${garage.distance} km)`;
    setGarageMessages((ms) => [...ms, { from: 'bot', text: garageInfo }]);
  }
}

    if (!res.ok) {
      setGarageMessages((ms) => [...ms, { from: 'bot', text: data.reply || "Erreur lors de la recherche." }]);
      return;
    }

    setGarageMessages((ms) => [...ms, { from: 'bot', text: data.reply }]);

    if (Array.isArray(data.garages)) {
      for (const garage of data.garages) {
        const garageInfo = `${garage.name}, ${garage.address}, ${garage.zipcode} ${garage.city} (${garage.distance} km)`;
        setGarageMessages((ms) => [...ms, { from: 'bot', text: garageInfo }]);
      }
    }
  } catch (error) {
    setGarageMessages((ms) => [...ms, { from: 'bot', text: "Erreur réseau. Veuillez réessayer." }]);
  }

  return;
}


    if (addingVehicle) {
      const raw = input.trim().toUpperCase();
      if (!raw) return;

      setVehicleMessages(ms => [...ms, { from: 'user', text: raw }]);
      setInput('');

      if (vehicleStep === 1) {
        // Validation de la plaque
        const plaqueRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
        if (!plaqueRegex.test(raw)) {
          const invalidPlateMsg = await getDynamicPrompt('invalidPlate');
          setVehicleMessages(ms => [...ms, { from: 'bot', text: invalidPlateMsg }]);
          return;
        }
        setVehicleData(d => ({ ...d, immat: raw }));
        setVehicleStep(2);

        const kmPrompt = await getDynamicPrompt('askKm');
        setVehicleMessages(ms => [...ms, { from: 'bot', text: kmPrompt }]);
        return;
      }

      if (vehicleStep === 2) {
        // Validation du kilométrage
        const kmRegex = /^\d+$/;
        if (!kmRegex.test(raw)) {
          const invalidKmMsg = await getDynamicPrompt('invalidKm');
          setVehicleMessages(ms => [...ms, { from: 'bot', text: invalidKmMsg }]);
          return;
        }
        const km = parseInt(raw, 10);
        setVehicleData(d => ({ ...d, km }));

        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/ld+json',
              'Accept': 'application/ld+json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ immat: vehicleData.immat, km })
          });

          if (!res.ok) throw new Error(await res.text());
          const json = await res.json() as VehicleResponse;

          // Succès
          const successMsg = await getDynamicPrompt('success');
          setLastVehicle({
            nomCommercial: json.nomCommercial,
            marque: json.marque,
            modele: json.modele,
            km: json.km,
            logoMarque: json.logoMarque
          });
          setVehicleMessages(ms => [...ms, { from: 'bot', text: successMsg }]);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          const errorMsg = await getDynamicPrompt('error');
          setVehicleMessages(ms => [...ms, { from: 'bot', text: `${errorMsg} ${message}` }]);
        }
        return;
      }
    }

    // Chat IA standard
    sendMessage();
  };
  

  // Menu principal
if (!chatStarted && !addingVehicle && !findingGarage) {
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
              onClick={() => void startAddVehicle()}
              className="flex items-center p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition text-left"
            >
              <span className="text-3xl mr-3">🚗</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Ajouter un véhicule</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Enregistrer plaque et kilométrage</div>
              </div>
            </button>
            <button
  onClick={() => void startGarageSearch()}
  className="flex items-center p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition text-left"
>
  <span className="text-3xl mr-3">🧭</span>
  <div>
    <div className="font-semibold text-gray-900 dark:text-white">Trouver un garage</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">Les 5 plus proches de chez vous</div>
  </div>
</button>

          </div>
        </div>
      </div>
    );
  }

  // Chat et affichage des messages + card
const activeMessages = addingVehicle
  ? vehicleMessages
  : findingGarage
  ? garageMessages
  : messages;
  return (
    <div className="w-full max-w-3xl mx-auto h-[70vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
      <header className="flex items-center gap-3 bg-brand-500 text-white px-5 py-3 rounded-t-xl">
        <button onClick={handleBack} aria-label="Retour au menu" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 transition text-white">←</button>
        <span className="text-2xl">💬</span><span>GaryBot</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-800 flex flex-col">
        {activeMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-lg break-words ${msg.from==='user'?'bg-brand-500 text-white rounded-br-none':'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
{findingGarage && garageList && (
  <div className="mt-4 space-y-4">
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md border">
      <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">📍 Garages les plus proches :</h4>
      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
        {garageList.map((g, i) => (
          <li key={i} className="border-b border-gray-200 dark:border-gray-600 pb-2">
            <strong>{g.name}</strong><br />
            {g.address}, {g.zipcode} {g.city} <br />
            <em>{g.distance} km</em>
          </li>
        ))}
      </ul>
    </div>

    {/* Carte */}
            <div className="h-[300px] w-full rounded-lg overflow-hidden shadow border border-gray-300 dark:border-gray-700">
              <MapContainer
                center={[garageList[0].latitude, garageList[0].longitude]}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {garageList.map((g, i) => (
                  <Marker key={i} position={[g.latitude, g.longitude]} icon={garageIcon}>
                    <Popup>
                      <strong>{g.name}</strong><br />
                      {g.address}<br />
                      {g.zipcode} {g.city}<br />
                      {g.distance} km
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Card de confirmation */}
        {lastVehicle && (
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl shadow p-4 mb-4">
            <div className="w-16 h-16 relative mr-4">
              <Image src={lastVehicle.logoMarque} alt={`${lastVehicle.marque} logo`} fill style={{objectFit:'contain'}} />
            </div>
            <div className="text-gray-800 dark:text-gray-100 space-y-1">
              <h3 className="text-lg font-semibold">{lastVehicle.nomCommercial}</h3>
              <p>Marque : <span className="font-medium">{lastVehicle.marque}</span></p>
              <p>Modèle : <span className="font-medium">{lastVehicle.modele}</span></p>
              <p>Kilométrage : <span className="font-medium">{lastVehicle.km.toLocaleString()} km</span></p>
            </div>
          </div>
        )}
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
