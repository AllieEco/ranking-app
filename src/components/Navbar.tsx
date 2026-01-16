"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
          BookRank
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Rechercher
          </Link>
          <Link href="/library" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Ma Bibliothèque
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              disabled={loading}
              aria-label="Se déconnecter"
            >
              {user.displayName ? `Déconnexion (${user.displayName})` : "Déconnexion"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              disabled={loading}
              aria-label="Se connecter avec Google"
            >
              Connexion Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
