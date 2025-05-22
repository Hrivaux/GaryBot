"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { Loader2 } from "lucide-react";

interface RendezVous {
  id: number;
  dateDebut: string;
  dateFin: string;
  immatriculation: string;
  modele: string;
  description: string;
  garage: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  } | null;
  price: number;
  lien?: string;
}

interface UserAppointmentsProps {
  appointments: any[] | null;
}

const MapLoader = () => (
  
  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
    <Loader2 className="animate-spin h-10 w-10 mb-4 text-gray-500" />
    <p>
    Chargement de la carte...
    </p>
  </div>
);

const UserMap = dynamic(() => import("./UserMap"), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function UserAppointments({ appointments }: UserAppointmentsProps) {
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (!appointments) return <p>Chargement...</p>;

  if (appointments.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Prochains rendez-vous
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Aucune échéances à venir.</p>
      </div>
    );
  }

  const rdvs: RendezVous[] = appointments.map((a) => ({
    id: a.id,
    dateDebut: a.startTime,
    dateFin: a.endTime,
    immatriculation: a.vehicle?.immat ?? "N/A",
    modele: a.vehicle?.modele ?? "N/A",
    description: a.operation?.name ?? "N/A",
    garage: a.garage
      ? {
          name: a.garage.name,
          address: a.garage.address,
          city: a.garage.city,
          latitude: a.garage.latitude,
          longitude: a.garage.longitude,
        }
      : null,
    price: a.operation?.price ?? 0,
    lien: `#rdv-${a.id}`,
  }));

  const openModal = (rdv: RendezVous) => {
    setSelectedRdv(rdv);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedRdv(null);
  };

  return (
    <>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Prochains rendez-vous
        </h3>
        <ul className="space-y-4">
          {rdvs.map((rdv) => (
            <li key={rdv.id}>
              <a
                onClick={() => openModal(rdv)}
                className="block rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] cursor-pointer"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📅 <strong>{new Date(rdv.dateDebut).toLocaleString("fr-FR")}</strong> — Fin:{" "}
                  {new Date(rdv.dateFin).toLocaleString("fr-FR")}
                </p>
                <p className="text-gray-800 font-medium dark:text-white">
                  🚗 {rdv.immatriculation} – {rdv.modele}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  📍 {rdv.garage ? `${rdv.garage.name}, ${rdv.garage.address}, ${rdv.garage.city}` : "N/A"}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {selectedRdv && (
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10">
            <h4 className="mb-6 text-3xl font-semibold text-gray-800 dark:text-white/90">
              📋 Détails du rendez-vous
            </h4>

            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">
              📅 <span className="font-semibold text-gray-900 dark:text-white">Début :</span>{" "}
              {new Date(selectedRdv.dateDebut).toLocaleString("fr-FR")}
            </p>
            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">
              ⏳ <span className="font-semibold text-gray-900 dark:text-white">Fin :</span>{" "}
              {new Date(selectedRdv.dateFin).toLocaleString("fr-FR")}
            </p>

            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">
              🚗 <span className="font-semibold text-gray-900 dark:text-white">Immatriculation :</span>{" "}
              {selectedRdv.immatriculation}
            </p>

            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">
              🚙 <span className="font-semibold text-gray-900 dark:text-white">Modèle :</span>{" "}
              {selectedRdv.modele}
            </p>

            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300 italic">
              📝 <span className="font-semibold text-gray-900 dark:text-white">Description :</span>{" "}
              {selectedRdv.description}
            </p>

            <p className="mb-2 text-lg text-gray-700 dark:text-gray-300 italic">
              📍 <span className="font-semibold text-gray-900 dark:text-white">Garage :</span>{" "}
              {selectedRdv.garage
                ? `${selectedRdv.garage.name}, ${selectedRdv.garage.address}, ${selectedRdv.garage.city}`
                : "N/A"}
            </p>

            <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
              💰 <span className="font-semibold text-gray-900 dark:text-white">Prix estimé :</span>{" "}
              {selectedRdv.price} €
            </p>

            <div className="h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
              {selectedRdv.garage ? (
                <UserMap
                  latitude={selectedRdv.garage.latitude}
                  longitude={selectedRdv.garage.longitude}
                  name={selectedRdv.garage.name}
                />
              ) : (
                <p className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  Localisation non disponible
                </p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
