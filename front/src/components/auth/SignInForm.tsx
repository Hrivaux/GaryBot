'use client';

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 import important

export default function SignInForm({ onSwitchMode }: { onSwitchMode: () => void }) {
  const router = useRouter(); // 👈 hook pour redirection
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur de connexion :", data.error || data);
        alert("Email ou mot de passe invalide.");
        return;
      }

      localStorage.setItem("token", data.token);
      console.log("Connexion réussie. Token :", data.token);

      // ✅ Redirection après connexion réussie
      router.push("/accueil"); // ← adapte cette route si nécessaire

    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur réseau lors de la tentative de connexion.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Connexion
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Renseignez vos identifiants pour vous connecter!
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                placeholder="info@gmail.com"
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
                  placeholder="Entrez votre mot de passe"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <Button className="w-full" size="sm" type="submit">
              Connexion
            </Button>
          </div>
        </form>
        <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
          Vous n'avez pas de compte?{" "}
          <button
            onClick={onSwitchMode}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 underline"
            type="button"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
}
