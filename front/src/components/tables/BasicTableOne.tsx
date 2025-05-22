'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';

// Type du véhicule
type Vehicle = {
  id: number;
  immat: string;
  marque: string;
  modele: string;
  dateMiseCirculation: string;
  energie: string;
  co2: number;
  puissanceFiscale: number;
  puissanceReelle: number;
  carrosserie: string;
  boiteVitesse: string;
  nbPassagers: number;
  nbPortes: number;
  nomCommercial: string;
  vin: string;
  couleur: string;
  logoMarque: string;
  km: number;
};

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [immat, setImmat] = useState('');
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Erreur API /me/vehicles:', err);
        return;
      }

      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error('Erreur réseau /me/vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    const token = localStorage.getItem('token');
    setFormError(null);

    if (!token) {
      setFormError("Utilisateur non authentifié.");
      return;
    }

    if (!immat.trim()) {
      setFormError("L'immatriculation est requise.");
      return;
    }

    const parsedKm = parseInt(km, 10);
    if (!km.trim() || isNaN(parsedKm) || parsedKm < 0) {
      setFormError("Le kilométrage doit être un nombre valide.");
      return;
    }

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

      if (!res.ok) {
        const err = await res.json();
        setFormError(err.message || "Erreur lors de l'ajout du véhicule.");
        return;
      }

      const newVehicle = await res.json();
      setVehicles((prev) => [...prev, newVehicle]);
      setIsAddModalOpen(false);
      setImmat('');
      setKm('');
    } catch (err) {
      setFormError("Erreur réseau. Veuillez réessayer.");
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
            <p className="text-sm text-gray-700 dark:text-gray-300">Kilomètre : {v.km}</p>

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

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ajouter un véhicule</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleAddVehicle(); }} className="space-y-4">
            {formError && (
              <div className="text-sm text-red-600 bg-red-100 border border-red-300 rounded p-2">
                {formError}
              </div>
            )}
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
