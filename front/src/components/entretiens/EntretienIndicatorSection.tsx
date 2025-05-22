'use client';

import React, { useEffect, useState } from "react";
import EntretienIndicator from "./EntretienIndicator";
import { Vehicle } from "@/services/vehiculeService";
import { differenceInYears } from "date-fns";

type Entretien = {
  id?: number;
  piece: string;
  description: string;
  frequence_km: number | null;
  frequence_annees: number | null;
};

interface Props {
  vehicle: Vehicle;
}

export default function EntretienIndicatorSection({ vehicle }: Props) {
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

  const getPosition = (entretien: Entretien): 0 | 1 | 2 => {
    // Cas kilométrique
    if (entretien.frequence_km && vehicle.km) {
      const ratio = vehicle.km / entretien.frequence_km;
      if (ratio >= 1) return 0;     // rouge
      if (ratio >= 0.8) return 1;   // orange
      return 2;                     // vert
    }

    // Cas date
    if (entretien.frequence_annees && vehicle.dateMiseCirculation) {
      const years = differenceInYears(new Date(), new Date(vehicle.dateMiseCirculation));
      const ratio = years / entretien.frequence_annees;
      if (ratio >= 1) return 0;
      if (ratio >= 0.8) return 1;
      return 2;
    }

    
    return 2;
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-3">
      {entretiens.map((entretien) => (
        <EntretienIndicator
          key={entretien.piece}
          entretien={entretien}
          position={getPosition(entretien)}
        />
      ))}
    </div>
  );
}
