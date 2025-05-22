import React from "react";
import { FileText } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";

interface Document {
  id: number;
  vehicle: string;
  registration: string;
  factureUrl: string;
  rapportUrl: string;
}

const documents: Document[] = [
  {
    id: 1,
    vehicle: "Peugeot 208",
    registration: "AB-123-CD",
    factureUrl: "/docs/facture1.pdf",
    rapportUrl: "/docs/rapport1.pdf",
  },
  {
    id: 2,
    vehicle: "Renault Clio",
    registration: "EF-456-GH",
    factureUrl: "/docs/facture2.pdf",
    rapportUrl: "/docs/rapport2.pdf",
  },
];

export default function VehicleDocuments() {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Synthèses & Documents
      </h3>
      <ul className="space-y-4">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.02]"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {doc.vehicle} – {doc.registration}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Documents disponibles
              </p>
            </div>
            <div className="mt-2 flex gap-4 sm:mt-0">
              <a
                href={doc.factureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-red-600 hover:underline"
              >
                <FaFilePdf className="mr-1 h-4 w-4" /> Facture
              </a>
              <a
                href={doc.rapportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
              >
                <FileText className="mr-1 h-4 w-4" /> Rapport
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
