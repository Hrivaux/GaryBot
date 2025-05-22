import React from "react";

import UserInfosCard from "@/components/dashboard/UserInfosCard";
import VehiculesTab from "@/components/dashboard/VehiculesTab";
import VehicleWatchlist from "@/components/dashboard/VehicleWatchlist";
import InterventionSummary from "@/components/dashboard/VehicleDocuments";
import VehicleDocuments from "@/components/dashboard/VehicleDocuments";

export default function Dashboard() {
  return (
    <>
      <h1 className="mt-2 mb-8 text-center text-6xl font-bold text-gray-800 dark:text-white/90">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-5">
          <UserInfosCard/>

        </div>

        <div className="col-span-12 xl:col-span-7">
          <VehiculesTab />
        </div>
        
        <div className="col-span-12 mt-6 flex flex-col xl:flex-row gap-4">
          <div className="w-full xl:w-1/2">
            <VehicleWatchlist />
          </div>
          <div className="w-full xl:w-1/2">
            <VehicleDocuments />
          </div>
        </div>



      </div>
    </>
  );
}
