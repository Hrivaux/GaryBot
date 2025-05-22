'use client';

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from 'nookies';   
export default function SignInForm({ onSwitchMode }: { onSwitchMode: () => void }) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalide.";

    if (!password) newErrors.password = "Mot de passe requis.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur de connexion :", data.error || data);
        setErrors({ global: data.error || "Email ou mot de passe invalide." });
        return;
      }

      setCookie(null, 'auth_token', data.token, {
        maxAge: 60 * 60 * 24,
        path: '/',           
      });
      router.push('/accueil');

      localStorage.setItem("token", data.token);
      console.log("Connexion réussie. Token :", data.token);
      router.push("/accueil");
    } catch (error) {
      console.error("Erreur réseau :", error);
      setErrors({ global: "Erreur réseau. Veuillez réessayer plus tard." });
    }
  };

  return (
    <div className="flex items-center justify-center rounded-2xl p-12 bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center w-full max-w-md">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Connexion
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Renseignez vos identifiants pour vous connecter!
          </p>
        </div>

        {errors.global && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                placeholder="info@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                hint={errors.email}
              />
            </div>

            <div>
              <Label>Mot de passe <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  hint={errors.password}
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
          Vous n'avez pas de compte ?{" "}
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
