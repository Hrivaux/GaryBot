'use client';

import React, { useEffect, useState } from "react";
import EntretienCards from "./EntretienCards";

type Entretien = {
  piece: string;
  description: string;
  frequence_km: number | null;
  frequence_annees: number | null;
};

export default function EntretienSection() {
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
    <EntretienCards entretiens={entretiens} loading={loading} error={error} />
  );
}
