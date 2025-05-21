import React from "react";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>

        <div className="space-y-6">
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
