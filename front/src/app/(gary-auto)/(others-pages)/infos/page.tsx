"use client";

import React from "react";

export default function Infos() {
  const entretiens = [
    {
      titre: "🔋 Batterie",
      description: "Recharge si faible. Change tous les 4–5 ans.",
      frequence: "Tous les 4–5 ans",
    },
    {
      titre: "🛢️ Huile moteur",
      description: "Vérifie le niveau avec la jauge. Complète ou change tous les 10 000 km.",
      frequence: "Tous les 10 000 km",
    },
    {
      titre: "💧 Liquide de frein",
      description: "Doit être clair et à bon niveau. À changer tous les 2 ans.",
      frequence: "Tous les 2 ans",
    },
    {
      titre: "🌬️ Filtre à air",
      description: "Remplace tous les 20 000 km ou plus souvent en milieu poussiéreux.",
      frequence: "Tous les 20 000 km",
    },
    {
      titre: "🚗 Pneus",
      description: "Vérifie la pression chaque mois. Contrôle l’usure et remplace si nécessaire.",
      frequence: "Tous les mois",
    },
    {
      titre: "💦 Essuie-glaces",
      description: "Remplace si traces ou grincements. Idéalement tous les 6 à 12 mois.",
      frequence: "6–12 mois",
    },
    {
      titre: "🌡️ Liquide de refroidissement",
      description: "Vérifie le niveau régulièrement. Change tous les 2 à 4 ans.",
      frequence: "2–4 ans",
    },
    {
      titre: "🧼 Filtre habitacle",
      description: "Change tous les 15 000 à 20 000 km. Améliore l’air intérieur.",
      frequence: "15–20 000 km",
    },
    {
      titre: "🧴 Lave-glace",
      description: "Complète régulièrement, surtout en hiver.",
      frequence: "Tous les mois",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Entretien de base du véhicule
        </h1>
        <p className="text-center text-gray-600 mb-10 text-lg">
          Ces opérations sont simples et peuvent être réalisées par vous-même à intervalle régulier.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entretiens.map((item, index) => (
            <div
              key={index}
              className="bg-purple-100 text-purple-900 border border-purple-300 rounded-xl p-8 text-center shadow-md transition transform duration-300 hover:scale-105"
              title={item.description}
            >
              <h2 className="text-3xl font-bold mb-4">{item.titre}</h2>
              <p className="text-lg font-medium mb-3">{item.description}</p>
              <span className="inline-block bg-purple-200 text-purple-900 text-sm font-semibold px-3 py-1 rounded-full">
                {item.frequence}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
