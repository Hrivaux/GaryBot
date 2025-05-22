import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";

// Interface des véhicules
interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  energy: string;
  puissance: string;
  logo_marque: string;
  kilometrage: number | null;
}

// Données de véhicules
const vehiclesData: Vehicle[] = [
  {
    id: 1,
    marque: "Tesla",
    modele: "Model S",
    energy: "Électrique",
    puissance: "670 ch",
    logo_marque: "/images/cars/tesla.png",
    kilometrage: 15000,
  },
  {
    id: 2,
    marque: "Renault",
    modele: "Clio",
    energy: "Essence",
    puissance: "90 ch",
    logo_marque: "/images/cars/renault.png",
    kilometrage: null,
  },
  {
    id: 3,
    marque: "Peugeot",
    modele: "208",
    energy: "Diesel",
    puissance: "110 ch",
    logo_marque: "/images/cars/peugeot.png",
    kilometrage: 34000,
  },
];

export default function VehiculesTab() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Véhicules
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Marque / Modèle
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Énergie
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Puissance
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Kilométrage
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {vehiclesData.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={vehicle.logo_marque}
                        className="h-[50px] w-[50px]"
                        alt={vehicle.marque}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {vehicle.marque}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {vehicle.modele}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {vehicle.energy}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {vehicle.puissance}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {vehicle.kilometrage !== null
                    ? `${vehicle.kilometrage.toLocaleString()} km`
                    : "Non renseigné"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
