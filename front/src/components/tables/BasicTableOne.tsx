'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  registration: string;
  vin: string;
  logo: string;
}

// Tu peux remplacer `vehicles` par des props ou données dynamiques plus tard
const vehicles: Vehicle[] = []; // Vide pour le moment

export default function BasicTableOne() {
  const hasVehicles = vehicles.length > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Mes véhicules</h2>
        <Button variant="primary">➕ Ajouter un véhicule</Button>
      </div>

      {hasVehicles ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="text-gray-500">Marque</TableCell>
                <TableCell className="text-gray-500">Modèle</TableCell>
                <TableCell className="text-gray-500">Immatriculation</TableCell>
                <TableCell className="text-gray-500">VIN</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="flex items-center gap-2 py-3">
                    {/* Une image peut être affichée ici plus tard */}
                    <span>{v.brand}</span>
                  </TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.registration}</TableCell>
                  <TableCell>{v.vin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-gray-600 text-sm">Aucun véhicule pour le moment.</div>
      )}
    </div>
  );
}
