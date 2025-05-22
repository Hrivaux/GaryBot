import React from "react";

interface RendezVous {
  id: number;
  dateDebut: string;
  dateFin: string;
  immatriculation: string;
  modele: string;
  description: string;
  garage: string;
  price: number;
  lien?: string;
}

interface UserAppointmentsProps {
  appointments: any[] | null;
}

export default function UserAppointments({ appointments }: UserAppointmentsProps) {
  if (!appointments) return <p>Chargement...</p>;

  const rdvs: RendezVous[] = appointments.map(a => ({
  id: a.id,
  dateDebut: a.startTime,
  dateFin: a.endTime,
  immatriculation: a.vehicle?.immat ?? "N/A",
  modele: a.vehicle?.modele ?? "N/A",
  description: a.operation?.name ?? "N/A",
  garage: a.garage ? `${a.garage.name}, ${a.garage.address}, ${a.garage.city}` : "N/A",
  price: a.operation?.price ?? 0,
  lien: `#rdv-${a.id}`,
}));


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
                📅 <strong>{new Date(rdv.dateDebut).toLocaleString("fr-FR")}</strong> — Fin: {new Date(rdv.dateFin).toLocaleString("fr-FR")}
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
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                💰 Prix estimé : {rdv.price} €
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
