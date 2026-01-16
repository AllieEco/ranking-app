"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, LibraryBook } from '@/types';

interface LibraryContextType {
  library: LibraryBook[];
  addToLibrary: (book: Book, rating: number) => void;
  removeFromLibrary: (bookId: string) => void;
  isBookInLibrary: (bookId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [library, setLibrary] = useState<LibraryBook[]>([]);

  // Charger depuis le localStorage au démarrage
  useEffect(() => {
    const savedLibrary = localStorage.getItem('my_book_library');
    if (savedLibrary) {
      try {
        setLibrary(JSON.parse(savedLibrary));
      } catch (e) {
        console.error("Erreur de lecture de la bibliothèque locale", e);
      }
    }
  }, []);

  // Sauvegarder à chaque modification
  useEffect(() => {
    localStorage.setItem('my_book_library', JSON.stringify(library));
  }, [library]);

  const addToLibrary = (book: Book, rating: number) => {
    setLibrary((prev) => {
      const existingIndex = prev.findIndex((b) => b.id === book.id);
      const newBook: LibraryBook = {
        ...book,
        userRating: rating,
        readDate: new Date().toISOString(),
        status: 'read',
      };

      if (existingIndex >= 0) {
        const newLib = [...prev];
        newLib[existingIndex] = newBook;
        return newLib;
      }
      return [...prev, newBook];
    });
  };

  const removeFromLibrary = (bookId: string) => {
    setLibrary((prev) => prev.filter((b) => b.id !== bookId));
  };

  const isBookInLibrary = (bookId: string) => {
    return library.some((b) => b.id === bookId);
  };

  return (
    <LibraryContext.Provider value={{ library, addToLibrary, removeFromLibrary, isBookInLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

