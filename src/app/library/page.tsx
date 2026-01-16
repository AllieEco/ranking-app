"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import BookCard from '@/components/BookCard';
import Link from 'next/link';

export default function LibraryPage() {
  const { library, cabinets, createCabinet, moveBookToCabinet } = useLibrary();
  const [showCreate, setShowCreate] = useState(false);
  const [newCabinetName, setNewCabinetName] = useState('');
  const [dragOverCabinetId, setDragOverCabinetId] = useState<string | null>(null);
  const [dragOverUnassigned, setDragOverUnassigned] = useState(false);
  const [animalEmoji, setAnimalEmoji] = useState('🐶');

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

  const { unassignedBooks, cabinetsWithBooks } = useMemo(() => {
    const bookMap = new Map(library.map((book) => [book.id, book]));
    const assignedIds = new Set<string>();
    const mappedCabinets = cabinets.map((cabinet) => {
      const books = cabinet.bookIds
        .map((bookId) => bookMap.get(bookId))
        .filter((book): book is NonNullable<typeof book> => Boolean(book));
      books.forEach((book) => assignedIds.add(book.id));
      return { ...cabinet, books };
    });
    return {
      unassignedBooks: library.filter((book) => !assignedIds.has(book.id)),
      cabinetsWithBooks: mappedCabinets,
    };
  }, [library, cabinets]);

  const handleDragStart = (bookId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', bookId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (cabinetId: string | null) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bookId = event.dataTransfer.getData('text/plain');
    if (!bookId) {
      return;
    }
    moveBookToCabinet(bookId, cabinetId);
    setDragOverCabinetId(null);
    setDragOverUnassigned(false);
  };

  const animalEmojis = [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
    '🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆',
    '🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋',
    '🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐠','🐟',
    '🐬','🐳','🦈','🦭','🦦','🦥','🐘','🦒','🦓','🦛',
  ];

  const getRandomAnimal = (exclude?: string) => {
    if (animalEmojis.length === 0) {
      return '🐶';
    }
    if (animalEmojis.length === 1) {
      return animalEmojis[0];
    }
    let next = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
    while (next === exclude) {
      next = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
    }
    return next;
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const saved = window.localStorage.getItem('profileAnimalEmoji');
    if (saved) {
      setAnimalEmoji(saved);
      return;
    }
    const initial = getRandomAnimal();
    setAnimalEmoji(initial);
    window.localStorage.setItem('profileAnimalEmoji', initial);
  }, []);

  const handleChangeAnimal = () => {
    const next = getRandomAnimal(animalEmoji);
    setAnimalEmoji(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('profileAnimalEmoji', next);
    }
  };

  return (
    <div className="space-y-12">
      {/* Profil Header */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl overflow-hidden">
            <span aria-hidden="true">{animalEmoji}</span>
          </div>
          <button type="button" onClick={handleChangeAnimal} className="clean-btn-outline text-xs">
            Changer d'animal
          </button>
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

      {/* Armoires */}
      <div className="space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Vos armoires</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {showCreate ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  createCabinet(newCabinetName);
                  setNewCabinetName('');
                  setShowCreate(false);
                }}
                className="flex gap-2"
              >
                <input
                  value={newCabinetName}
                  onChange={(event) => setNewCabinetName(event.target.value)}
                  placeholder="Nom de l'armoire"
                  className="clean-input"
                />
                <button type="submit" className="clean-btn">
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setNewCabinetName('');
                  }}
                  className="clean-btn-outline"
                >
                  Annuler
                </button>
              </form>
            ) : (
              <button onClick={() => setShowCreate(true)} className="clean-btn">
                + Nouvelle armoire
              </button>
            )}
          </div>
        </div>

        {cabinetsWithBooks.length === 0 ? (
          <div className="text-sm text-slate-500">
            Créez votre première armoire puis glissez-déposez vos livres dedans.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cabinetsWithBooks.map((cabinet) => {
              const isDragOver = dragOverCabinetId === cabinet.id;
              return (
                <div
                  key={cabinet.id}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverCabinetId(cabinet.id);
                  }}
                  onDragLeave={() => setDragOverCabinetId((prev) => (prev === cabinet.id ? null : prev))}
                  onDrop={handleDrop(cabinet.id)}
                  className={`rounded-xl border p-4 transition-colors ${
                    isDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-slate-900">{cabinet.name}</h3>
                      <p className="text-xs text-slate-500">{cabinet.books.length} livre(s)</p>
                    </div>
                    <div className="text-xs text-slate-400">Déposez ici</div>
                  </div>
                  {cabinet.books.length === 0 ? (
                    <div className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg p-4 text-center">
                      Glissez un livre pour l'ajouter
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cabinet.books.map((book) => (
                        <div
                          key={book.id}
                          draggable
                          onDragStart={handleDragStart(book.id)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <BookCard book={book} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid de livres sans armoire */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Livres sans armoire</h2>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOverUnassigned(true);
          }}
          onDragLeave={() => setDragOverUnassigned(false)}
          onDrop={handleDrop(null)}
          className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
            dragOverUnassigned ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'
          }`}
        >
          {unassignedBooks.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">
              Tous vos livres sont dans des armoires.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {unassignedBooks.map((book) => (
                <div
                  key={book.id}
                  draggable
                  onDragStart={handleDragStart(book.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
