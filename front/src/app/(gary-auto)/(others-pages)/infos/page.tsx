'use client';

import React, { useEffect, useState } from "react";

type Entretien = {
  piece: string;
  description: string;
  frequence_km: number | null;
  frequence_annees: number | null;
};

export default function Infos() {
  const [entretiens, setEntretiens] = useState<Entretien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entretiens`);
        if (!response.ok) throw new Error("Erreur lors du chargement des données");

        const data = await response.json();
        setEntretiens(data);
      } catch (err) {
        setError("Impossible de charger les entretiens.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntretiens();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Entretien de base du véhicule
        </h1>
        <p className="text-center text-gray-600 mb-10 text-lg">
          Ces opérations sont simples et peuvent être réalisées par vous-même à intervalle régulier.
        </p>

        {loading && <p className="text-center text-gray-500">Chargement des entretiens...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && entretiens.length === 0 && (
          <p className="text-center text-gray-500">Aucun entretien à afficher.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entretiens.map((item, index) => (
            <div
              key={index}
              className="bg-purple-100 text-purple-900 border border-purple-300 rounded-xl p-8 text-center shadow-md transition transform duration-300 hover:scale-105"
              title={item.description}
            >
              <h2 className="text-3xl font-bold mb-4">{item.piece}</h2>
              <p className="text-lg font-medium mb-3">{item.description}</p>

              {(item.frequence_km || item.frequence_annees) && (
                <span className="inline-block bg-purple-200 text-purple-900 text-sm font-semibold px-3 py-1 rounded-full">
                  {item.frequence_km
                    ? `Tous les ${item.frequence_km.toLocaleString()} km`
                    : `Tous les ${item.frequence_annees} an(s)`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
