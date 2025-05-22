"use client";

import { FC, useState } from "react";
import { User } from "lucide-react";
import { UserData } from "@/services/userService";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { usePathname } from "next/navigation";

interface Props {
  user: UserData;
}

const UserInfosCard: FC<Props> = ({ user }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const pathname = usePathname();
  const showUpdateButton = pathname === '/profile';

  const [form, setForm] = useState({
    firstname: user.firstname ?? "",
    lastname: user.lastname ?? "",
    phone: user.phone ?? "",
    street: user.street ?? "",
    postalcode: user.postalcode ?? "",
    city: user.city ?? "",
    country: user.country ?? "",
  });

  const fullName =
    user.firstname || user.lastname
      ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
      : user.email;

  const fullAddress =
    user.street || user.postalcode || user.city || user.country
      ? `${user.street ?? ""}${user.street ? ", " : ""}${user.postalcode ?? ""}${user.postalcode ? " " : ""}${user.city ?? ""}${user.city || user.country ? ", " : ""}${user.country ?? ""}`.trim()
      : "Non renseignée";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Erreur : " + (error.errors || error.message));
        return;
      }

      alert("Modifications enregistrées !");
      closeModal();
      location.reload(); // Ou déclencher un re-fetch si tu préfères une UX sans reload
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Erreur réseau.");
    }
  };

  return (
    <div className="h-full min-h-[300px] rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-6 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-4">
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
            {showUpdateButton && 
              <button
                onClick={openModal}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
          Modifier
        </button>
            }
        </div>
      </div>

      <div className="px-6 py-4 sm:py-5 text-gray-800 dark:text-white/90">
        <div className="mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-base">{user.email}</p>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
          <p className="text-base">{user.phone || "Non renseigné"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
          <p className="text-base">{fullAddress}</p>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="w-full max-w-[700px] rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Modifier les informations
          </h4>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Prénom</Label>
                <Input name="firstname" type="text" value={form.firstname} onChange={handleChange} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input name="lastname" type="text" value={form.lastname} onChange={handleChange} />
              </div>
              <div className="lg:col-span-2">
                <Label>Téléphone</Label>
                <Input name="phone" type="text" value={form.phone} onChange={handleChange} />
              </div>
              <div className="lg:col-span-2">
                <Label>Rue</Label>
                <Input name="street" type="text" value={form.street} onChange={handleChange} />
              </div>
              <div>
                <Label>Code postal</Label>
                <Input name="postalcode" type="text" value={form.postalcode} onChange={handleChange} />
              </div>
              <div>
                <Label>Ville</Label>
                <Input name="city" type="text" value={form.city} onChange={handleChange} />
              </div>
              <div className="lg:col-span-2">
                <Label>Pays</Label>
                <Input name="country" type="text" value={form.country} onChange={handleChange} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Fermer
              </Button>
              <Button size="sm" onClick={handleSave}>
                Sauvegarder
              </Button>
            </div>
          </form>

        </div>
      </Modal>
    </div>
  );
};

export default UserInfosCard;
