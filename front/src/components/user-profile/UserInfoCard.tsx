"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const handleSave = () => {
    // TODO: appel à une API pour enregistrer les infos
    closeModal();
  };

  return (
    <>
      <section className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Informations personnelles
            </h2>

            <dl className="grid grid-cols-1 gap-4 lg:grid-cols-2 text-sm text-gray-800 dark:text-white/90">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prénom</dt>
                <dd>John</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom</dt>
                <dd>Doe</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</dt>
                <dd>john.doe@example.com</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Téléphone</dt>
                <dd>+33 6 12 34 56 78</dd>
              </div>
            </dl>
          </div>

          <Button onClick={openModal} variant="outline" className="mt-2 lg:mt-0">
            ✏️ Modifier
          </Button>
        </div>
      </section>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl m-4">
        <div className="p-6 lg:p-10 bg-white dark:bg-gray-900 rounded-3xl overflow-y-auto">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Modifier vos informations
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Veuillez mettre à jour vos données personnelles.
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <Label>Prénom</Label>
                <Input type="text" defaultValue="John" />
              </div>
              <div>
                <Label>Nom</Label>
                <Input type="text" defaultValue="Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue="john.doe@example.com" />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input type="text" defaultValue="+33 6 12 34 56 78" />
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
