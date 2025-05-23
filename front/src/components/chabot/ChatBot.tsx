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

// ⬇️ ⬇️ ⬇️ Place-la ici avant le composant principal ⬇️ ⬇️ ⬇️
async function detectIntentAndGarage(userInput: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/detect-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message: userInput })
  });

  if (!res.ok) return null;
  return await res.json(); // { intent: "take_appointment", garageName: "Peugeot Marseille" }
}

async function getSuggestedOperation(message: string): Promise<{
  operation: string | null;
  price: number | null;
  time_unit: string | null;
  additional_help: string | null;
  additional_comment: string | null;
  questions: string[];
  alternatives: string[];
} | null> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) return null;
  return await res.json();
}


const ChatBot: React.FC = () => {
    const [garageList, setGarageList] = useState<Array<{
    id: number; // ← AJOUT
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
const [garageMessages, setGarageMessages] = useState<{ from: 'bot' | 'user'; text?: string; type?: 'map' }[]>([]);
  const [selectedGarage, setSelectedGarage] = useState<typeof garageList[0] | null>(null);
const [selectedOperation, setSelectedOperation] = useState<{
  id: number;
  piece: string;
  description: string;
} | null>(null);

const [userVehicles, setUserVehicles] = useState<Array<{
  id: number;
  immat: string;
  marque: string;
  modele: string;
  nomCommercial: string;
}>>([]);
const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
const [lastSuggestedOperation, setLastSuggestedOperation] = useState<typeof operations[0] | null>(null);


useEffect(() => {
  const fetchUserVehicles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Erreur lors du chargement des véhicules');

      const data = await res.json();
      setUserVehicles(data);
    } catch (err) {
      console.error("❌ Chargement des véhicules échoué :", err);
    }
  };

  fetchUserVehicles();
}, []);


const operations = [
  { id: 1, piece: "🔧 Service Huile Moteur", description: "Compléter ou changer tous les 10 000 km." },
  { id: 2, piece: "🧼 Service microfiltre d'habitacle", description: "Changer tous les 15 000 à 20 000 km." },
  { id: 3, piece: "🛢️ Service filtre à carburant", description: "À remplacer tous les 40 000 à 60 000 km." },
  { id: 4, piece: "🌬️ Service filtre à air", description: "Changer tous les 20 000 km." },
  { id: 5, piece: "💧 Service liquide de freins", description: "À changer tous les 2 ans." },
  { id: 6, piece: "🌫️ Service filtre à pollen", description: "Changer tous les 15 000 à 20 000 km." },
  { id: 7, piece: "🛑 Service plaquettes de frein", description: "Remplacer si usées ou en cas de grincement." },
  { id: 8, piece: "🔋 Service batterie", description: "Remplacer tous les 4 à 5 ans." },
  { id: 9, piece: "🧭 Diagnostic panne", description: "Identification de pannes électroniques ou mécaniques." },
  { id: 10, piece: "⛓️ Service courroie de distribution", description: "À changer tous les 100 000 à 160 000 km." },
  { id: 11, piece: "🔥 Service bougies d'allumage", description: "À remplacer tous les 30 000 à 60 000 km." },
  { id: 12, piece: "🌡️ Service liquide de refroidissement", description: "Changer tous les 2 à 4 ans." },
  { id: 13, piece: "⚙️ Service liquide de transmission", description: "Changer selon les recommandations du constructeur." },
  { id: 14, piece: "🌀 Service filtre de transmission", description: "À remplacer pour préserver la boîte de vitesses." },
  { id: 15, piece: "🔧 Service plaquettes arrière", description: "Remplacer si usées." },
  { id: 16, piece: "🛞 Service disques de frein", description: "Remplacer si usés ou voilés." },
  { id: 17, piece: "🛠️ Service amortisseurs avant", description: "Changer en cas de fuite ou d'usure." },
  { id: 18, piece: "🔧 Service amortisseurs arrière", description: "Changer en cas de défaillance." },
  { id: 19, piece: "🔩 Service rotules de suspension", description: "Remplacer si jeu ou bruit." },
  { id: 20, piece: "🧱 Service silentblocs", description: "Changer pour améliorer le confort de conduite." },
  { id: 21, piece: "⚙️ Service embrayage", description: "Remplacer si patinage ou bruit." },
  { id: 22, piece: "⚙️ Service volant moteur", description: "À changer avec l’embrayage si nécessaire." },
  { id: 23, piece: "🛠️ Service joints spy", description: "Changer en cas de fuite d'huile." },
  { id: 24, piece: "🧩 Service rotule de direction", description: "Changer en cas de jeu dans la direction." },
  { id: 25, piece: "🧱 Service biellettes de barre stab.", description: "Changer si bruit ou usure." },
  { id: 26, piece: "⚙️ Service crémaillère de direction", description: "Remplacer si fuite ou jeu important." },
  { id: 27, piece: "⛓️ Service kit distribution complet", description: "Changer à l'intervalle recommandé." },
  { id: 28, piece: "⚙️ Service embrayage + distribution", description: "Opération combinée pour les gros entretiens." },
  { id: 29, piece: "🔌 Service alternateur", description: "Remplacer si charge insuffisante." },
  { id: 30, piece: "🔑 Service démarreur", description: "Changer si démarrage difficile ou impossible." },
  { id: 31, piece: "💦 Service pompe à eau", description: "Changer en cas de fuite ou surchauffe." },
  { id: 32, piece: "🛢️ Service pompe à carburant", description: "Remplacer si panne d'alimentation." },
  { id: 33, piece: "🧪 Service sonde lambda", description: "Changer pour optimiser la combustion." },
  { id: 34, piece: "🧬 Service injecteurs", description: "Remplacer en cas de défaillance d’injection." },
  { id: 35, piece: "🔥 Service bougies de préchauffage", description: "Changer pour faciliter le démarrage à froid." },
  { id: 36, piece: "🔧 Service joint de culasse", description: "Changer si surchauffe ou fuite." },
  { id: 37, piece: "🛠️ Service culasse", description: "Nécessite un démontage moteur complet." },
  { id: 38, piece: "🧱 Service moteur complet", description: "Remplacement total du moteur (sur devis)." },
  { id: 39, piece: "⚙️ Service boîte automatique", description: "Vidange et entretien de la transmission auto." },
  { id: 40, piece: "⚙️ Service boîte manuelle", description: "Remplacer embrayage et synchros si besoin." },
  { id: 41, piece: "🛞 Service transmission intégrale", description: "Entretien ponts avant et arrière inclus." },
  { id: 42, piece: "⚙️ Service différentiel", description: "Remplacer ou entretenir selon l’usure." },
  { id: 43, piece: "🛞 Service cardans", description: "Remplacer si bruit ou jeu dans la transmission." },
  { id: 44, piece: "🔩 Service couronnes et pignons", description: "Changer en cas d'usure dans le différentiel." },
  { id: 45, piece: "⚙️ Service convertisseur de couple", description: "Remplacer si perte de puissance." },
  { id: 46, piece: "🌀 Service turbocompresseur", description: "Contrôle de la géométrie variable inclus." },
  { id: 47, piece: "🛢️ Service EGR", description: "Nettoyer ou remplacer en cas d’encrassement." },
  { id: 48, piece: "🧪 Service FAP", description: "Remplacer si colmaté." },
  { id: 49, piece: "🔄 Service vanne EGR", description: "Remplacer pour limiter la pollution." },
  { id: 50, piece: "🔧 Service catalyseur", description: "Changer si émission excessive de CO2." },
  { id: 51, piece: "🧪 Service sondes", description: "Changer si données incorrectes au calculateur." },
  { id: 52, piece: "⚡ Service faisceau électrique", description: "Remplacer si fils abîmés ou défectueux." },
  { id: 53, piece: "⚙️ Service amortisseur de turbo", description: "Remplacer en cas de claquement ou fuite." },
  { id: 54, piece: "🛠️ Service soupapes", description: "Réglage ou remplacement si perte de compression." },
  { id: 55, piece: "🔧 Service injecteur pompe", description: "Changer si perte de puissance ou surconsommation." },
  { id: 56, piece: "🛢️ Service réservoir carburant", description: "Remplacer si fuite ou rouille." },
  { id: 57, piece: "🧪 Passage au banc de diagnostic", description: "Analyse approfondie des performances." }
];

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
  const raw = input.trim();
  if (!raw) return;
  setInput('');

  // 1️⃣ — Si on est en mode ajout véhicule
  if (addingVehicle) {
    const upper = raw.toUpperCase();
    setVehicleMessages(ms => [...ms, { from: 'user', text: upper }]);

    if (vehicleStep === 1) {
      const valid = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(upper);
      if (!valid) {
        const msg = await getDynamicPrompt('invalidPlate');
        setVehicleMessages(ms => [...ms, { from: 'bot', text: msg }]);
        return;
      }
      setVehicleData(d => ({ ...d, immat: upper }));
      setVehicleStep(2);
      const msg = await getDynamicPrompt('askKm');
      setVehicleMessages(ms => [...ms, { from: 'bot', text: msg }]);
      return;
    }

    if (vehicleStep === 2) {
      const valid = /^\d+$/.test(upper);
      if (!valid) {
        const msg = await getDynamicPrompt('invalidKm');
        setVehicleMessages(ms => [...ms, { from: 'bot', text: msg }]);
        return;
      }

      const km = parseInt(upper, 10);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json',
            Accept: 'application/ld+json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ immat: vehicleData.immat, km })
        });

        if (!res.ok) throw new Error(await res.text());
        const json = await res.json() as VehicleResponse;

        setLastVehicle({
          nomCommercial: json.nomCommercial,
          marque: json.marque,
          modele: json.modele,
          km: json.km,
          logoMarque: json.logoMarque
        });

        const msg = await getDynamicPrompt('success');
        setVehicleMessages(ms => [...ms, { from: 'bot', text: msg }]);
      } catch (err) {
        const msg = await getDynamicPrompt('error');
        const message = err instanceof Error ? err.message : String(err);
        setVehicleMessages(ms => [...ms, { from: 'bot', text: `${msg} ${message}` }]);
      }

      return;
    }
  }

  // 2️⃣ — Si on cherche un garage par localisation
  if (findingGarage && !garageList) {
    setGarageMessages(ms => [...ms, { from: 'user', text: raw }]);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/find-garage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: raw })
      });

      const data = await res.json();
      if (!res.ok) {
        setGarageMessages(ms => [...ms, { from: 'bot', text: data.reply || "Erreur lors de la recherche." }]);
        return;
      }

      if (Array.isArray(data.garages)) {
        setGarageList(data.garages);
        setGarageMessages(ms => [
          ...ms,
          { from: 'bot', text: data.reply },
          { from: 'bot', type: 'map' }
        ]);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      setGarageMessages(ms => [...ms, { from: 'bot', text: "❌ Erreur réseau, réessaie." }]);
    }
    return;
  }

  // 3️⃣ — Si garageList existe mais pas encore de sélection : choix garage par texte
  if (findingGarage && garageList && !selectedGarage) {
  const intentData = await detectIntentAndGarage(raw);

  if (intentData?.intent === 'take_appointment' && intentData.garageName) {
    const match = garageList.find(g =>
      g.name.toLowerCase().includes(intentData.garageName.toLowerCase()) ||
      intentData.garageName.toLowerCase().includes(g.name.toLowerCase())
    );

    if (match) {
      setSelectedGarage(match);
      setGarageMessages(ms => [...ms, { from: 'user', text: raw }]);

      // 👇 Affiche immédiatement les prestations
      setGarageMessages(ms => [
        ...ms,
        {
          from: 'bot',
          type: 'operations',
          text: "Bonjour, avez-vous un problème avec votre voiture ?"
        }
      ]);

      return;
    }
  }

  // 🔄 fallback simple si pas d’intent mais nom proche du garage
  const fallbackMatch = garageList.find(g =>
    raw.toLowerCase().includes(g.name.toLowerCase())
  );

  if (fallbackMatch) {
    setSelectedGarage(fallbackMatch);
    setGarageMessages(ms => [...ms, { from: 'user', text: raw }]);
    setGarageMessages(ms => [
      ...ms,
      {
        from: 'bot',
        type: 'operations',
        text: "Bonjour, avez-vous un problème avec votre voiture ?"
      }
    ]);
    return;
  }
}


 if (findingGarage && selectedGarage && !selectedOperation) {
  const responses = [{ from: 'user', text: raw }];

  // 🔁 Cas où l’utilisateur confirme un choix précédent
  if (raw.toLowerCase().trim() === "oui" && lastSuggestedOperation) {
    setSelectedOperation(lastSuggestedOperation);
    responses.push({
      from: 'bot',
      text: `🔧 ${lastSuggestedOperation.piece} — ${lastSuggestedOperation.description}`
    });
    responses.push({
      from: 'bot',
      text: "Merci, veuillez maintenant choisir le véhicule concerné 👇"
    });
    setGarageMessages(ms => [...ms, ...responses]);
    return;
  }

  // 🤖 Sinon : on interroge GPT
  const opData = await getSuggestedOperation(raw);
  console.log("🎯 Suggestions GPT :", opData);

  let matchedOperation: typeof operations[0] | null = null;

  if (opData?.operation) {
    matchedOperation = operations.find(o =>
      opData.operation.toLowerCase().includes(o.piece.toLowerCase()) ||
      o.piece.toLowerCase().includes(opData.operation.toLowerCase())
    ) ?? null;

    if (!matchedOperation) {
      console.warn("❌ Aucune opération locale ne correspond à :", opData.operation);
    }
  }

  if (matchedOperation) {
    setLastSuggestedOperation(matchedOperation); // 👉 seulement stocké pour l’instant
    responses.push({
      from: 'bot',
      text: `🔧 ${matchedOperation.piece} — ${matchedOperation.description}`
    });
    responses.push({
      from: 'bot',
      text: "Souhaitez-vous prendre rendez-vous pour cette intervention ?"
    });
    setGarageMessages(ms => [...ms, ...responses]);
    return;
  }

  // ❓ Questions complémentaires de GPT
  if (opData?.questions?.length) {
    responses.push({ from: 'bot', text: opData.questions.join(' ') });
  }

  // 💡 Suggestions alternatives
  if (opData?.alternatives?.length) {
    responses.push({
      from: 'bot',
      text: `Interventions possibles : ${opData.alternatives.join(', ')}`
    });
  }

  setGarageMessages(ms => [...ms, ...responses]);
  return;
}







  // 5️⃣ — Sinon, fallback sur le chat standard
  sendMessage();
};

  

  // Menu principal
if (!chatStarted && !addingVehicle && !findingGarage) {
    return (
<div className="w-full h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
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
<div className="w-full h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-md flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">      <header className="flex items-center gap-3 bg-brand-500 text-white px-5 py-3 rounded-t-xl">
        <button onClick={handleBack} aria-label="Retour au menu" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 transition text-white">←</button>
        <span className="text-2xl">💬</span><span>GaryBot</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-800 flex flex-col">
        {activeMessages.map((msg, idx) => {
          if (msg.type === 'map' && garageList) {
          return (
            <div key={idx} className="flex justify-start">
              <div className="w-full space-y-4">
                {/* Liste des garages */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md border">
                  <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">📍 Garages les plus proches :</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                    {garageList.map((g, i) => (
                      <li key={i}>
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
            </div>
          );
        }

        if (msg.type === 'operations' && selectedGarage && !selectedOperation) {
  return (
    <div key={idx} className="flex justify-start">
      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md border max-w-full">
        <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">
          {msg.text ?? `🧰 Quel est le type d'intervention à faire ?`}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {operations.slice(0, 8).map(op => (
            <button
              key={op.id}
              onClick={() => setSelectedOperation(op)}
              className="p-3 border rounded-lg bg-white dark:bg-gray-800 hover:shadow text-left"
            >
              <div className="text-lg font-bold">{op.piece}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{op.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


  // Message texte classique
  return (
    <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] px-4 py-2 rounded-lg break-words ${msg.from === 'user' ? 'bg-brand-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
        {msg.text}
      </div>
    </div>
  );
})}



      
{selectedGarage && selectedOperation && selectedVehicleId && (
  <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
  <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
    📅 Rendez-vous pour <span className="text-brand-500">{selectedOperation.piece}</span> chez <span className="text-brand-500">{selectedGarage.name}</span>
  </h4>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date souhaitée</label>
      <input
        type="date"
        className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => setAppointmentDate(e.target.value)}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heure souhaitée</label>
      <select
        className="w-full px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
        onChange={(e) => setAppointmentTime(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Choisissez une heure</option>
        {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
    </div>
  </div>



    {appointmentDate && appointmentTime && (
  <button
    onClick={async () => {
      if (!selectedGarage || !selectedOperation || !selectedVehicleId || !appointmentDate || !appointmentTime) {
        console.warn("❌ Donnée manquante pour la prise de RDV :", {
          garage_id: selectedGarage?.id,
          operation_id: selectedOperation?.id,
          vehicle_id: selectedVehicleId,
          date: `${appointmentDate}T${appointmentTime}:00`
        });
        alert("Merci de remplir toutes les étapes avant de confirmer : garage, opération, véhicule, date et heure.");
        return;
      }

      const payload = {
        garage_id: selectedGarage.id,
        operation_id: selectedOperation.id,
        vehicle_id: selectedVehicleId,
        date: `${appointmentDate}T${appointmentTime}:00`
      };

      console.log("📦 Envoi du RDV à l'API avec :", payload);

      const token = localStorage.getItem('token');
      try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  let result;
  try {
    result = await res.json(); // 👈 ici peut planter
  } catch (err) {
    console.error("❌ Impossible de parser JSON", err);
    const raw = await res.text();
    console.error("↪️ Réponse brute de l’API :", raw);
    setGarageMessages(ms => [...ms, { from: 'bot', text: "❌ Réponse serveur invalide, voir console." }]);
    return;
  }

  if (res.ok) {
    setGarageMessages(ms => [...ms, {
      from: 'bot',
      text: `✅ Rendez-vous confirmé pour le ${appointmentDate} à ${appointmentTime} chez ${selectedGarage.name} pour ${selectedOperation.piece}`
    }]);
  } else {
    setGarageMessages(ms => [...ms, { from: 'bot', text: `❌ Erreur : ${result.error || 'Inconnue'}` }]);
  }
} catch (err) {
  console.error("💥 Erreur réseau :", err);
  setGarageMessages(ms => [...ms, { from: 'bot', text: "❌ Erreur réseau lors de la réservation." }]);
}


      // Réinitialisation après soumission
      setSelectedGarage(null);
      setSelectedOperation(null);
      setSelectedVehicleId(null);
      setAppointmentDate(null);
      setAppointmentTime(null);
    }}
    className="mt-4 bg-brand-500 text-white px-4 py-2 rounded hover:bg-brand-600 transition"
  >
    Confirmer le rendez-vous
  </button>
)}

  </div>
)}

{selectedGarage && selectedOperation && !selectedVehicleId && (
  <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded shadow">
    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
      🚗 Choisissez le véhicule concerné
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {userVehicles.map(v => (
        <button
          key={v.id}
          onClick={() => setSelectedVehicleId(v.id)}
          className="p-3 border rounded-lg bg-white dark:bg-gray-800 hover:shadow text-left"
        >
          <div className="font-bold">{v.nomCommercial}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {v.immat} — {v.marque} {v.modele}
          </div>
        </button>
      ))}
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
