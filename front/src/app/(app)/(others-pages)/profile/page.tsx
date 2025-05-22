"use client";

import React, { useEffect, useState } from "react";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import { fetchUserInfo, UserData } from "@/services/userService";
import UserInfosCard from "@/components/dashboard/UserInfosCard";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        const user = await fetchUserInfo();
        setUser(user);
      };
      fetchData();
    }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700 dark:text-white">
        <Loader2 className="animate-spin h-20 w-20 mb-4 text-gray-500" />
        <p className="text-lg font-medium">Chargement du profil utilisateur</p>
      </div>
    );
  }
    
  return (
    <div className="px-6 pb-6">
      <h1 className="mt-2 mb-8 text-center text-6xl font-bold text-gray-800 dark:text-white/90">
        Mon profil
      </h1>

        <div className="space-y-6">
          <UserInfosCard user={user} />
        </div>
      </div>
  );
} 