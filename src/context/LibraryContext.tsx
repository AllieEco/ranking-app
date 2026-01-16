"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Book, Cabinet, LibraryBook, ReadingSheet } from "@/types";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";

interface LibraryContextType {
  library: LibraryBook[];
  cabinets: Cabinet[];
  addToLibrary: (book: Book, rating: number) => void;
  saveReadingSheet: (bookId: string, sheet: ReadingSheet) => void;
  removeFromLibrary: (bookId: string) => void;
  isBookInLibrary: (bookId: string) => boolean;
  createCabinet: (name: string) => void;
  moveBookToCabinet: (bookId: string, cabinetId: string | null) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
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

  const readLocalCabinets = (): Cabinet[] => {
    const savedCabinets = localStorage.getItem("my_book_cabinets");
    if (!savedCabinets) {
      return [];
    }
    try {
      return JSON.parse(savedCabinets) as Cabinet[];
    } catch (e) {
      console.error("Erreur de lecture des armoires locales", e);
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

  const mergeCabinets = (primary: Cabinet[], secondary: Cabinet[]) => {
    const map = new Map<string, Cabinet>();
    const addOrUpdate = (cabinet: Cabinet) => {
      const existing = map.get(cabinet.id);
      if (!existing) {
        map.set(cabinet.id, cabinet);
        return;
      }
      const mergedBookIds = Array.from(new Set([...existing.bookIds, ...cabinet.bookIds]));
      map.set(cabinet.id, {
        ...existing,
        ...cabinet,
        bookIds: mergedBookIds,
        name: existing.name || cabinet.name,
      });
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
        setCabinets(readLocalCabinets());
        setIsLoaded(true);
        return;
      }

      try {
        const docRef = doc(db, "libraries", user.uid);
        const snapshot = await getDoc(docRef);
        const remoteLibrary = snapshot.exists()
          ? ((snapshot.data().library ?? []) as LibraryBook[])
          : [];
        const remoteCabinets = snapshot.exists()
          ? ((snapshot.data().cabinets ?? []) as Cabinet[])
          : [];
        const localLibrary = readLocalLibrary();
        const localCabinets = readLocalCabinets();
        const mergedLibrary = mergeLibraries(remoteLibrary, localLibrary);
        const mergedCabinets = mergeCabinets(remoteCabinets, localCabinets);
        setLibrary(mergedLibrary);
        setCabinets(mergedCabinets);
        if (mergedLibrary.length !== remoteLibrary.length || mergedCabinets.length !== remoteCabinets.length) {
          await setDoc(docRef, { library: mergedLibrary, cabinets: mergedCabinets }, { merge: true });
        }
      } catch (e) {
        console.error("Erreur de chargement de la bibliothèque distante", e);
        setLibrary(readLocalLibrary());
        setCabinets(readLocalCabinets());
      } finally {
        setIsLoaded(true);
      }
    };

    if (user?.uid !== lastUserIdRef.current) {
      lastUserIdRef.current = user?.uid ?? null;
      void loadLibrary();
    } else if (!user && lastUserIdRef.current === null) {
      setLibrary(readLocalLibrary());
      setCabinets(readLocalCabinets());
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    localStorage.setItem("my_book_library", JSON.stringify(library));
    localStorage.setItem("my_book_cabinets", JSON.stringify(cabinets));
    if (user) {
      const docRef = doc(db, "libraries", user.uid);
      void setDoc(docRef, { library, cabinets }, { merge: true });
    }
  }, [library, cabinets, user, isLoaded]);

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

  const saveReadingSheet = (bookId: string, sheet: ReadingSheet) => {
    setLibrary((prev) =>
      prev.map((book) => {
        if (book.id !== bookId) {
          return book;
        }
        const now = new Date().toISOString();
        const existingCreatedAt = book.readingSheet?.createdAt ?? sheet.createdAt;
        return {
          ...book,
          readingSheet: {
            ...sheet,
            createdAt: existingCreatedAt,
            updatedAt: now,
          },
        };
      })
    );
  };

  const removeFromLibrary = (bookId: string) => {
    setLibrary((prev) => prev.filter((b) => b.id !== bookId));
    setCabinets((prev) =>
      prev.map((cabinet) => ({
        ...cabinet,
        bookIds: cabinet.bookIds.filter((id) => id !== bookId),
      }))
    );
  };

  const isBookInLibrary = (bookId: string) => {
    return library.some((b) => b.id === bookId);
  };

  const createCabinet = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const cabinetId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newCabinet: Cabinet = {
      id: cabinetId,
      name: trimmedName,
      bookIds: [],
      createdAt: new Date().toISOString(),
    };
    setCabinets((prev) => [...prev, newCabinet]);
  };

  const moveBookToCabinet = (bookId: string, cabinetId: string | null) => {
    setCabinets((prev) =>
      prev.map((cabinet) => {
        const shouldContain = cabinetId !== null && cabinet.id === cabinetId;
        const withoutBook = cabinet.bookIds.filter((id) => id !== bookId);
        if (!shouldContain) {
          return { ...cabinet, bookIds: withoutBook };
        }
        return {
          ...cabinet,
          bookIds: Array.from(new Set([...withoutBook, bookId])),
        };
      })
    );
  };

  return (
    <LibraryContext.Provider
      value={{
        library,
        cabinets,
        addToLibrary,
        saveReadingSheet,
        removeFromLibrary,
        isBookInLibrary,
        createCabinet,
        moveBookToCabinet,
      }}
    >
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

