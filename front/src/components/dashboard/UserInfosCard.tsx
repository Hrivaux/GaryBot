"use client";
import { FC, useEffect, useState } from "react";
import { User } from "lucide-react"; // Icône d'avatar par défaut
import { fetchUserInfo, UserData } from "@/services/userService";

const UserInfosCard: FC = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserInfo();
      setUser(data);
    };
    fetchData();
  }, []);

  if (!user) return null;

  const fullName =
    user.firstname || user.lastname
      ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
      : user.email;

  const fullAddress =
    user.street || user.postalcode || user.city || user.country
      ? `${user.street ?? ""}${user.street ? ", " : ""}${user.postalcode ?? ""}${user.postalcode ? " " : ""}${user.city ?? ""}${user.city || user.country ? ", " : ""}${user.country ?? ""}`.trim()
      : "Non renseignée";

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-6 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${fullName}'s avatar`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {fullName}
          </h3>
        </div>
      </div>

      <div className="px-6 py-4 sm:py-5 text-gray-800 dark:text-white/90">
        <div className="mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-base">{user.email}</p>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
          <p className="text-base">{user.phone || "Non renseignée"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
          <p className="text-base">{fullAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfosCard;
