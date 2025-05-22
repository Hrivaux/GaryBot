"use client";

import React, { useEffect, useState } from "react";
import EntretienCards from "@/components/entretiens/EntretienCards";

type Entretien = {
  piece: string;
  description: string;
  frequence_km: number | null;
  frequence_annees: number | null;
};

export default function InfosPage() {
  const [entretiens, setEntretiens] = useState<Entretien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entretiens`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Erreur serveur : ${text}`);
        }

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

        <EntretienCards entretiens={entretiens} loading={loading} error={error} />
      </div>
    </div>
  );
}
