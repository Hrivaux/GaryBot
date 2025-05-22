export interface Vehicle {
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
}

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Erreur API /me/vehicles:', err);
      return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Erreur réseau /me/vehicles:', error);
    return [];
  }
};


// export const addVehicle = async (immat: string, km: number): Promise<Vehicle | null> => {
//   const token = localStorage.getItem('token');
//   if (!token) return null;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/ld+json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ immat, km }),
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       console.error('Erreur API /vehicles:', err);
//       return null;
//     }

//     return await res.json();
//   } catch (error) {
//     console.error('Erreur réseau /vehicles:', error);
//     return null;
//   }
// };

// export const updateVehicleKm = async (vehicleId: number, km: number): Promise<boolean> => {
//   const token = localStorage.getItem('token');
//   if (!token) return false;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${vehicleId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/merge-patch+json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ km }),
//     });

//     return res.ok;
//   } catch (error) {
//     console.error('Erreur réseau PATCH /vehicles:', error);
//     return false;
//   }
// };