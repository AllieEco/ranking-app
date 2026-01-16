"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Book } from '@/types';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';

export default function BookActions({ book }: { book: Book }) {
  const { addToLibrary, library } = useLibrary();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showRating, setShowRating] = useState(false);
  
  const existingBook = library.find(b => b.id === book.id);
  const isInLib = !!existingBook;

  const handleRate = (rating: number) => {
    addToLibrary(book, rating);
    setShowRating(false);
  };

  if (isInLib) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium mb-2">Livre lu</p>
        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-700 mb-2">
          {existingBook.userRating} <span className="text-yellow-500 text-2xl">★</span>
        </div>
        <p className="text-sm text-green-600">
          Ajouté le {new Date(existingBook.readDate).toLocaleDateString()}
        </p>
      </div>
    );
  }

  if (showRating) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-lg animate-in fade-in slide-in-from-bottom-2">
        <p className="text-center font-medium text-slate-900 mb-4">Votre note</p>
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              className="text-3xl hover:scale-110 transition-transform focus:outline-none text-slate-300 hover:text-yellow-400"
              title={`${star} étoiles`}
            >
              ★
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowRating(false)}
          className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (!user) {
          const redirectPath = encodeURIComponent(pathname);
          router.push(`/login?redirect=${redirectPath}`);
          return;
        }
        setShowRating(true);
      }}
      className="clean-btn w-full py-3 text-lg"
    >
      J'ai lu ce livre
    </button>
  );
}
