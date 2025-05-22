'use client';

import React, { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    street: "",
    postalcode: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
            headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        if (!res.ok) {
          console.error("Erreur lors de la récupération des infos utilisateur");
          return;
        }

        const data = await res.json();
        setUser(data);
        setForm({
          street: data.street || "",
          postalcode: data.postalcode || "",
          city: data.city || "",
          country: data.country || "",
        });
      } catch (err) {
        console.error("Erreur API /api/me:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Erreur : " + (err.errors || err.message));
        return;
      }

      alert("Adresse mise à jour !");
      closeModal();
      location.reload();
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      alert("Erreur réseau");
    }
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Adresse
            </h2>

            <dl className="grid grid-cols-1 gap-4 lg:grid-cols-2 text-sm text-gray-800 dark:text-white/90">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rue</dt>
                <dd>{user.street || "—"}</dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Code postal</dt>
                <dd>{user.postalcode || "—"}</dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ville</dt>
                <dd>{user.city || "—"}</dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pays</dt>
                <dd>{user.country || "—"}</dd>
              </div>
            </dl>
          </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Modifier
        </button>
        </div>
      </section>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl m-4">
        <div className="p-6 lg:p-10 bg-white dark:bg-gray-900 rounded-3xl overflow-y-auto">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Modifier l'adresse
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Mettez à jour vos coordonnées personnelles.
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="lg:col-span-2">
                <Label>Rue</Label>
                <Input name="street" value={form.street} onChange={handleChange} />
              </div>

              <div>
                <Label>Code postal</Label>
                <Input name="postalcode" value={form.postalcode} onChange={handleChange} />
              </div>

              <div>
                <Label>Ville</Label>
                <Input name="city" value={form.city} onChange={handleChange} />
              </div>

              <div className="lg:col-span-2">
                <Label>Pays</Label>
                <Input name="country" value={form.country} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}