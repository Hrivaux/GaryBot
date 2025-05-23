'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Vehicle, fetchVehicles } from '@/services/vehiculeService';
import EntretienIndicatorSection from "@/components/entretiens/EntretienIndicatorSection";
import { Plus } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [immat, setImmat] = useState('');
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [previsions, setPrevisions] = useState<any>(null)
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [loadingForecastVehicleId, setLoadingForecastVehicleId] = useState<number | null>(null);


  const fetchPrevisions = async (vehicleId: number) => {
    setLoadingForecastVehicleId(vehicleId);
  const token = localStorage.getItem('token');
  if (!token) {
    setLoadingForecastVehicleId(null);
    return;
  }
    
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${vehicleId}/maintenance-ai`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Erreur lors du chargement des prévisions.');

    const data = await res.json();
    setPrevisions(data.forecast);
    setIsDetailModalOpen(false); 
    setIsForecastModalOpen(true); 
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingForecastVehicleId(null);
  }
};



  const handleDeleteVehicle = async () => {
  if (!vehicleToDelete) return;
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${vehicleToDelete.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error('Erreur suppression véhicule');
      return;
    }

    setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
    setIsDeleteModalOpen(false);
    setVehicleToDelete(null);
  } catch (err) {
    console.error("Erreur réseau lors de la suppression :", err);
  }
};

  useEffect(() => {
    const loadVehicles = async () => {
      const data = await fetchVehicles();
      setVehicles(data);
    };
    loadVehicles();
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


      <Button onClick={() => setIsAddModalOpen(true)} className="text-white flex items-center gap-2">
        <Plus className="w-5 h-5 text-white" />
        Ajouter un véhicule
      </Button>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <Card key={v.id} className="relative p-5 shadow-md border rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition">
          {/* Bouton de suppression (croix) */}
          <button
            onClick={() => {
              setVehicleToDelete(v);
              setIsDeleteModalOpen(true);
            }}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl font-bold"
            title="Supprimer le véhicule"
          >
            ×
          </button>

          {/* En-tête avec logo et info principale */}
          <div className="flex items-center gap-4 mb-3">
            {v.logoMarque && (
              <img
                src={v.logoMarque}
                alt={`${v.marque} logo`}
                className="w-12 h-12 object-contain rounded"
              />
            )}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {v.marque} {v.modele}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{v.immat}</p>
            </div>
          </div>

          {/* Infos secondaires */}
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p><span className="font-medium">VIN :</span> {v.vin}</p>
            <p><span className="font-medium">Kilométrage :</span> {v.km.toLocaleString()} km</p>
          </div>

          {/* Bouton "Détails" */}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              size="sm"
              onClick={() => {
                setSelectedVehicle(v);
                setIsDetailModalOpen(true);
              }}
            >
              Détails
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchPrevisions(v.id!)}
              disabled={loadingForecastVehicleId === v.id}
            >
              {loadingForecastVehicleId === v.id ? <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
              : 'Prévisions'}
            </Button>
          </div>

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

                {/* 👇 Indicateur d'entretien placé sous le champ kilométrage */}
                <div className="mt-4">
                  <EntretienIndicatorSection vehicle={selectedVehicle} />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Fermer</Button>
              <Button onClick={handleKmUpdate}>Mettre à jour les KM</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md">
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Supprimer le véhicule ?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer ce véhicule&nbsp;?
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button variant="outline" onClick={handleDeleteVehicle}>
            Supprimer
          </Button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={isForecastModalOpen} onClose={() => setIsForecastModalOpen(false)} className="max-w-xl">
  <div className="p-6 space-y-4">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Prévisions de maintenance</h3>
    {!previsions ? (
      <p className="text-sm text-gray-600 dark:text-gray-300">Chargement en cours...</p>
    ) : previsions.length === 0 ? (
      <p className="text-sm text-gray-600 dark:text-gray-300">Aucune prévision disponible.</p>
    ) : (
      <ul className="space-y-3">
        {previsions.map((forecast: any, index: number) => (
          <li key={index} className="p-3 rounded bg-gray-100 dark:bg-gray-800">
            <p className="font-medium text-gray-800 dark:text-white">{forecast.task}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📅 {forecast.estimated_date} — 🚗 {forecast.estimated_km?.toLocaleString() ?? 'N/A'} km
            </p>

          </li>
        ))}
      </ul>
    )}
    <div className="flex justify-end pt-4">
      <Button variant="outline" onClick={() => setIsForecastModalOpen(false)}>Fermer</Button>
    </div>
  </div>
</Modal>


    </div>
  );
}
