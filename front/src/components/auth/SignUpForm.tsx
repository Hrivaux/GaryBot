'use client';

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";

export default function SignUpForm({ onSwitchMode }: { onSwitchMode: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur d'inscription :", data);
        alert("Erreur lors de l'inscription.");
        return;
      }

      alert("Compte créé avec succès !");
      onSwitchMode(); // Revenir à la page de connexion

    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Erreur réseau.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pt-10">
        <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-md">
          S'inscrire
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Entrez votre email et mot de passe pour créer un compte.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Email <span className="text-error-500">*</span></Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <Label>Mot de passe <span className="text-error-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                error={!!error}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 cursor-pointer right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
              </span>
            </div>
          </div>

          <div>
            <Label>Confirmation <span className="text-error-500">*</span></Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                error={!!error}
                hint={error}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute z-30 cursor-pointer right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeIcon /> : <EyeCloseIcon />}
              </span>
            </div>
          </div>

          <Button className="w-full" type="submit">
            S'inscrire
          </Button>
        </form>

        <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
          Déjà un compte ?{" "}
          <button
            onClick={onSwitchMode}
            className="text-brand-500 hover:text-brand-600 underline"
            type="button"
          >
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}
