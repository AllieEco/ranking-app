"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectPath =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  useEffect(() => {
    if (user) {
      router.replace(redirectPath === "/login" ? "/" : redirectPath);
    }
  }, [user, router, redirectPath]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Connexion requise</h1>
        <p className="text-slate-600">
          Pour marquer un livre comme lu, connectez-vous avec Google.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="clean-btn w-full"
          disabled={loading}
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}
