"use client";

import React, { useEffect, useState } from "react";
import UserInfosCard from "@/components/dashboard/UserInfosCard";
import VehiculesTab from "@/components/dashboard/VehiculesTab";
import UserAppointments from "@/components/dashboard/UserAppointments";
import VehicleDocuments from "@/components/dashboard/VehicleDocuments";
import { fetchUserAppointments, fetchUserInfo, UserData } from "@/services/userService";
import { Loader2 } from "lucide-react";
import { fetchVehicles, Vehicle } from "@/services/vehiculeService";

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [vehicules, setVehicules] = useState<Vehicle[] | null>(null);
  const [appointments, setAppointments] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = await fetchUserInfo();
      const vehicles = await fetchVehicles();
      const userAppointments = await fetchUserAppointments() 
      setVehicules(vehicles);
      setUser(user);
      setAppointments(userAppointments);
    };
    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700 dark:text-white">
        <Loader2 className="animate-spin h-20 w-20 mb-4 text-gray-500" />
        <p className="text-lg font-medium">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <h1 className="mt-2 mb-8 text-center text-6xl font-bold text-gray-800 dark:text-white/90">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-5 h-full">
          <UserInfosCard user={user} />
        </div>

        <div className="col-span-12 xl:col-span-7 h-full">
          <VehiculesTab vehicules={vehicules} />
        </div>

        <div className="col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
          <UserAppointments  appointments={appointments}/>
          <VehicleDocuments />
        </div>
      </div>
    </div>
  );
}
