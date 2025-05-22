"use client";

import React from "react";

type Entretien = {
  piece: string;
  description: string;
  frequence_km: number | null;
  frequence_annees: number | null;
};

interface EntretienCardsProps {
  entretiens: Entretien[];
  loading?: boolean;
  error?: string;
}

export default function EntretienCards({ entretiens, loading = false, error = "" }: EntretienCardsProps) {
  return (
    <>
      {loading && <p className="text-center text-gray-500">Chargement des entretiens...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && entretiens.length === 0 && (
        <p className="text-center text-gray-500">Aucun entretien à afficher.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {entretiens.map((item, index) => (
          <div
            key={index}
            className="bg-[#e6ebff] text-[#3c4fcb] border border-[#c4ceff] rounded-xl p-8 text-center shadow-md transition transform duration-300 hover:scale-105"
            title={item.description}
          >
            <h2 className="text-3xl font-bold mb-4">{item.piece}</h2>
            <p className="text-lg font-medium mb-3">{item.description}</p>

            {(item.frequence_km || item.frequence_annees) && (
              <span className="inline-block bg-[#d6dcff] text-[#3c4fcb] text-sm font-semibold px-3 py-1 rounded-full">
                {item.frequence_km
                  ? `Tous les ${item.frequence_km.toLocaleString()} km`
                  : `Tous les ${item.frequence_annees} an(s)`}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
