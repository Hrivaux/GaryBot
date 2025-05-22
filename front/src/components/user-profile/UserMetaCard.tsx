import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import React from "react";


export default function Profile() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Mon profil
      </h1>

      {/* Informations personnelles */}
      <UserInfoCard />

      {/* Adresse */}
      <UserAddressCard />
    </div>
  );
}
