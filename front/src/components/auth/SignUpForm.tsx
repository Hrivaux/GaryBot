'use client';

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";

export default function SignUpForm({ onSwitchMode }: { onSwitchMode: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // état pour message d'erreur

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError(''); // clear error if passwords match

    console.log("Credentials:", {
      fullName,
      email,
      password,
      confirmPassword
    });

    // Ici tu peux continuer la logique de création de compte (ex: appel API)
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pt-10">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            S'inscrire
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Remplissez le formulaire pour créer un compte !
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>Nom complet <span className="text-error-500">*</span></Label>
              <Input
                placeholder="John Doe"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                placeholder="exemple@email.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Mot de passe <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Choisissez un mot de passe"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!error}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            <div>
              <Label>Confirmation du mot de passe <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Répétez votre mot de passe"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!error}
                  hint={error} // Affiche le message d'erreur ici
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirm ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            <Button className="w-full" size="sm" type="submit">
              S'inscrire
            </Button>
          </div>
        </form>
        <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
          Vous avez déjà un compte ?{" "}
          <button
            onClick={onSwitchMode}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 underline"
            type="button"
          >
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}
