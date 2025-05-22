'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Vehicle, fetchVehicles } from '@/services/vehiculeService';


export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [immat, setImmat] = useState('');
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadVehicles = async () => {
    const data = await fetchVehicles();
    setVehicles(data);
  };
  loadVehicles();
}, []);


  const handleAddVehicle = async () => {
    const token = localStorage.getItem('token');
    if (!token || !immat || !km) return;

    const parsedKm = parseInt(km, 10);
    if (isNaN(parsedKm)) return alert('Le kilométrage doit être un nombre.');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ immat, km: parsedKm }),
      });

      const newVehicle = await res.json();
      setVehicles((prev) => [...prev, newVehicle]);
      setIsAddModalOpen(false);
      setImmat('');
      setKm('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKmUpdate = async () => {
    if (!selectedVehicle) return;

    const token = localStorage.getItem('token');
    const parsedKm = parseInt(`${selectedVehicle.km}`, 10);
    if (!token || isNaN(parsedKm)) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${selectedVehicle.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ km: parsedKm }),
    });

    if (!res.ok) {
      alert('Échec de mise à jour');
      return;
    }

    await fetchVehicles();
    setIsDetailModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Mes véhicules</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>➕ Ajouter un véhicule</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <Card key={v.id} className="p-4 shadow-md border rounded-xl bg-white dark:bg-gray-800">
            <div className="flex items-center gap-4 mb-2">
              {v.logoMarque && (
                <img src={v.logoMarque} alt="Logo" className="w-12 h-12 object-contain" />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{v.marque} {v.modele}</h3>
                <p className="text-sm text-gray-500">{v.immat}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">VIN : {v.vin}</p>
            <Button
              className="mt-4"
              size="sm"
              onClick={() => {
                setSelectedVehicle(v);
                setIsDetailModalOpen(true);
              }}
            >
              Détails
            </Button>
          </Card>
        ))}
      </div>

      {/* Modal d'ajout */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ajouter un véhicule</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddVehicle();
            }}
            className="space-y-4"
          >
            <Input
              type="text"
              placeholder="Immatriculation"
              value={immat}
              onChange={(e) => setImmat(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Kilométrage"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </form>
        </div>
      </Modal>

      {/* Modal de détail */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="max-w-2xl">
        {selectedVehicle && (
          <div className="p-6 space-y-3">
            <h3 className="text-xl font-bold">{selectedVehicle.marque} {selectedVehicle.modele}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-white">
              <p><strong>Immat:</strong> {selectedVehicle.immat}</p>
              <p><strong>VIN:</strong> {selectedVehicle.vin}</p>
              <p><strong>Énergie:</strong> {selectedVehicle.energie}</p>
              <p><strong>Couleur:</strong> {selectedVehicle.couleur}</p>
              <p><strong>Carrosserie:</strong> {selectedVehicle.carrosserie}</p>
              <p><strong>Boîte:</strong> {selectedVehicle.boiteVitesse}</p>
              <p><strong>Puissance fiscale:</strong> {selectedVehicle.puissanceFiscale} cv</p>
              <p><strong>Puissance réelle:</strong> {selectedVehicle.puissanceReelle} ch</p>
              <p><strong>CO2:</strong> {selectedVehicle.co2} g/km</p>
              <p><strong>Date mise en circulation:</strong> {selectedVehicle.dateMiseCirculation}</p>
              <p><strong>Nb passagers:</strong> {selectedVehicle.nbPassagers}</p>
              <p><strong>Nb portes:</strong> {selectedVehicle.nbPortes}</p>
              <p><strong>Nom commercial:</strong> {selectedVehicle.nomCommercial}</p>
              <div className="col-span-2">
                <label className="text-sm">Kilométrage</label>
                <Input
                  type="number"
                  value={selectedVehicle.km}
                  onChange={(e) =>
                    setSelectedVehicle({ ...selectedVehicle, km: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Fermer</Button>
              <Button onClick={handleKmUpdate}>Mettre à jour les KM</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
