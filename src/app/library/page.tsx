"use client";

import { useLibrary } from '@/context/LibraryContext';
import BookCard from '@/components/BookCard';
import Link from 'next/link';

export default function LibraryPage() {
  const { library } = useLibrary();

  // Calculs simples pour le profil
  const totalBooks = library.length;
  const averageRating = totalBooks > 0
    ? (library.reduce((acc, book) => acc + (book.userRating || 0), 0) / totalBooks).toFixed(1)
    : '0';

  if (totalBooks === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-slate-400">
          📚
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Votre bibliothèque est vide</h2>
        <p className="text-slate-500 mb-8">Vous n'avez pas encore noté de livres.</p>
        <Link 
          href="/"
          className="clean-btn"
        >
          Chercher un livre
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Profil Header */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl">
          👤
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Mon Profil</h1>
          <p className="text-sm text-slate-500 font-medium bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">Membre depuis 2026</p>
        </div>
        
        <div className="flex gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 pl-0 md:pl-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{totalBooks}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Livres Lus</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{averageRating}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Moyenne</div>
          </div>
        </div>
      </div>

      {/* Grid de livres */}
      <div>
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Vos livres</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {library.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
