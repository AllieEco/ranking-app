"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Book, LibraryBook } from "@/types";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";

interface LibraryContextType {
  library: LibraryBook[];
  addToLibrary: (book: Book, rating: number) => void;
  removeFromLibrary: (bookId: string) => void;
  isBookInLibrary: (bookId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);

  const readLocalLibrary = (): LibraryBook[] => {
    const savedLibrary = localStorage.getItem("my_book_library");
    if (!savedLibrary) {
      return [];
    }
    try {
      return JSON.parse(savedLibrary) as LibraryBook[];
    } catch (e) {
      console.error("Erreur de lecture de la bibliothèque locale", e);
      return [];
    }
  };

  const mergeLibraries = (primary: LibraryBook[], secondary: LibraryBook[]) => {
    const map = new Map<string, LibraryBook>();
    const addOrUpdate = (book: LibraryBook) => {
      const existing = map.get(book.id);
      if (!existing) {
        map.set(book.id, book);
        return;
      }
      const existingDate = Date.parse(existing.readDate ?? "");
      const incomingDate = Date.parse(book.readDate ?? "");
      if (Number.isNaN(existingDate) || incomingDate > existingDate) {
        map.set(book.id, book);
      }
    };
    primary.forEach(addOrUpdate);
    secondary.forEach(addOrUpdate);
    return Array.from(map.values());
  };

  useEffect(() => {
    const loadLibrary = async () => {
      setIsLoaded(false);
      if (!user) {
        setLibrary(readLocalLibrary());
        setIsLoaded(true);
        return;
      }

      try {
        const docRef = doc(db, "libraries", user.uid);
        const snapshot = await getDoc(docRef);
        const remoteLibrary = snapshot.exists()
          ? ((snapshot.data().library ?? []) as LibraryBook[])
          : [];
        const localLibrary = readLocalLibrary();
        const mergedLibrary = mergeLibraries(remoteLibrary, localLibrary);
        setLibrary(mergedLibrary);
        if (mergedLibrary.length !== remoteLibrary.length) {
          await setDoc(docRef, { library: mergedLibrary }, { merge: true });
        }
      } catch (e) {
        console.error("Erreur de chargement de la bibliothèque distante", e);
        setLibrary(readLocalLibrary());
      } finally {
        setIsLoaded(true);
      }
    };

    if (user?.uid !== lastUserIdRef.current) {
      lastUserIdRef.current = user?.uid ?? null;
      void loadLibrary();
    } else if (!user && lastUserIdRef.current === null) {
      setLibrary(readLocalLibrary());
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    localStorage.setItem("my_book_library", JSON.stringify(library));
    if (user) {
      const docRef = doc(db, "libraries", user.uid);
      void setDoc(docRef, { library }, { merge: true });
    }
  }, [library, user, isLoaded]);

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

export default LibraryProvider;

