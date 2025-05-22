import React from "react";

interface RendezVous {
  id: number;
  date: string;
  immatriculation: string;
  modele: string;
  description: string;
  garage: string;
  lien?: string; // lien vers plus d'infos si besoin
}

const rdvs: RendezVous[] = [
  {
    id: 1,
    date: "2025-06-05",
    immatriculation: "AB-123-CD",
    modele: "Peugeot 208",
    description: "Contrôle technique",
    garage: "Garage AutoTech - Paris 15e",
    lien: "#rdv-1",
  },
  {
    id: 2,
    date: "2025-06-10",
    immatriculation: "EF-456-GH",
    modele: "Tesla Model 3",
    description: "Révision annuelle",
    garage: "Tesla Service Center - Nanterre",
    lien: "#rdv-2",
  },
  {
    id: 3,
    date: "2025-06-15",
    immatriculation: "IJ-789-KL",
    modele: "Renault Clio",
    description: "Changement des pneus",
    garage: "Norauto - Boulogne-Billancourt",
    lien: "#rdv-3",
  },
  
  
];

export default function VehicleWatchlist() {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Prochains rendez-vous
      </h3>
      <ul className="space-y-4">
        {rdvs.map((rdv) => (
          <li key={rdv.id}>
            <a
              href={rdv.lien}
              className="block rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] cursor-pointer"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📅 <strong>{new Date(rdv.date).toLocaleDateString("fr-FR")}</strong>
              </p>
              <p className="text-gray-800 font-medium dark:text-white">
                🚗 {rdv.immatriculation} – {rdv.modele}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                📝 {rdv.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                📍 {rdv.garage}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
