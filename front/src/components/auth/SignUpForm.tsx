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
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; global?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide.";

    if (!password) newErrors.password = "Mot de passe requis.";
    else if (password.length < 6) newErrors.password = "Au moins 6 caractères.";

    if (!confirmPassword) newErrors.confirmPassword = "Confirmez le mot de passe.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur d'inscription :", data);
        setErrors({ global: data.message || "Erreur lors de l'inscription." });
        return;
      }

      onSwitchMode(); // Succès : passer à la connexion
    } catch (err) {
      console.error("Erreur réseau :", err);
      setErrors({ global: "Erreur réseau. Veuillez réessayer plus tard." });
    }
  };

  return (
    <div className="flex items-center justify-center rounded-2xl p-12 bg-white dark:bg-gray-900">
      <div className="flex flex-col w-full max-w-md">
        <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-md">
          S'inscrire
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Entrez votre email et mot de passe pour créer un compte.
        </p>

        {errors.global && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Email <span className="text-error-500">*</span></Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              error={!!errors.email}
              hint={errors.email}
            />
          </div>

          <div>
            <Label>Mot de passe <span className="text-error-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                error={!!errors.password}
                hint={errors.password}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                error={!!errors.confirmPassword}
                hint={errors.confirmPassword}
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
