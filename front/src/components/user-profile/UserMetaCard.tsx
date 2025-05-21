import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mon profil | GaryAuto",
  description: "Gérez vos informations personnelles et votre adresse.",
};

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
