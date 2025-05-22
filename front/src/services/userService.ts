export interface UserData {
  firstname?: string;
  lastname?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  street?: string,
  postalcode?:string,
  city?: string,
  country?: string
}

export const fetchUserInfo = async (): Promise<UserData | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Erreur lors de la récupération des données utilisateur.");
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Erreur API /api/me:", error);
    return null;
  }
};


export const fetchUserAppointments = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Erreur API /me/appointments:', err);
      return [];
    }

    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Erreur réseau /me/vehicles:', error);
    return [];
  }
};
