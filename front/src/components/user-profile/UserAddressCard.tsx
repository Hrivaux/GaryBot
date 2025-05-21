"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const handleSave = () => {
    // TODO: Enregistrer les données en BDD (via mutation ou API call)
    closeModal();
  };

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
                <dd>12 Avenue des Lilas</dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Code postal</dt>
                <dd>75010</dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ville</dt>
                <dd>Paris</dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pays</dt>
                <dd>France</dd>
              </div>
            </dl>
          </div>

          <Button onClick={openModal} variant="outline" className="mt-2 lg:mt-0">
            ✏️ Modifier
          </Button>
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
                <Input type="text" defaultValue="12 Avenue des Lilas" />
              </div>

              <div>
                <Label>Code postal</Label>
                <Input type="text" defaultValue="75010" />
              </div>

              <div>
                <Label>Ville</Label>
                <Input type="text" defaultValue="Paris" />
              </div>

              <div className="lg:col-span-2">
                <Label>Pays</Label>
                <Input type="text" defaultValue="France" />
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
