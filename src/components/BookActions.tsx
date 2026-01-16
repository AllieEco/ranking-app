"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Book, ReadingSheet, ReadingSheetType } from '@/types';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { ESSAI_FIELDS, LIBRE_FIELDS, ROMAN_FIELDS, SheetFieldType, SheetField } from '@/constants/readingSheets';



export default function BookActions({ book }: { book: Book }) {
  const { addToLibrary, library, saveReadingSheet } = useLibrary();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showRating, setShowRating] = useState(false);
  const [showSheetPrompt, setShowSheetPrompt] = useState(false);
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [sheetType, setSheetType] = useState<ReadingSheetType | null>(null);
  const [sheetResponses, setSheetResponses] = useState<Record<string, string>>({});
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  
  const existingBook = library.find(b => b.id === book.id);
  const isInLib = !!existingBook;

  const handleRate = (rating: number) => {
    addToLibrary(book, rating);
    setShowRating(false);
    setPendingRating(rating);
    setShowSheetPrompt(true);
  };

  const getFieldsForType = (type: ReadingSheetType) => {
    if (type === 'essai') {
      return ESSAI_FIELDS;
    }
    if (type === 'roman_histoire') {
      return ROMAN_FIELDS;
    }
    return LIBRE_FIELDS;
  };

  const getSheetLabel = (type: ReadingSheetType) => {
    if (type === 'essai') {
      return 'Essai';
    }
    if (type === 'roman_histoire') {
      return 'Roman / Histoire';
    }
    return 'Fiche libre';
  };

  const startSheet = (type: ReadingSheetType) => {
    const fields = getFieldsForType(type);
    const initialResponses = fields.reduce<Record<string, string>>((acc, field) => {
      if (field.type === 'rating' && pendingRating !== null) {
        acc[field.id] = String(pendingRating);
      } else {
        acc[field.id] = '';
      }
      return acc;
    }, {});
    setSheetType(type);
    setSheetResponses(initialResponses);
    setShowSheetPrompt(false);
    setShowSheetForm(true);
  };

  const handleCloseSheet = () => {
    setShowSheetPrompt(false);
    setShowSheetForm(false);
    setSheetType(null);
    setPendingRating(null);
  };

  const handleSaveSheet = () => {
    if (!sheetType) {
      return;
    }
    const now = new Date().toISOString();
    const sheet: ReadingSheet = {
      type: sheetType,
      responses: sheetResponses,
      createdAt: now,
      updatedAt: now,
    };
    saveReadingSheet(book.id, sheet);
    setShowSheetForm(false);
    setSheetType(null);
    setPendingRating(null);
  };

  const renderContent = () => {
    if (isInLib && existingBook) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-medium mb-2">Livre lu</p>
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-700 mb-2">
            {existingBook.userRating} <span className="text-yellow-500 text-2xl">★</span>
          </div>
          <p className="text-sm text-green-600">
            Ajouté le {new Date(existingBook.readDate).toLocaleDateString()}
          </p>
          {!existingBook.readingSheet && (
            <button
              onClick={() => setShowSheetPrompt(true)}
              className="mt-4 w-full text-sm font-medium text-green-700 hover:text-green-900"
            >
              Rédiger une fiche de lecture
            </button>
          )}
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
  };

  return (
    <div className="relative">
      {renderContent()}

      {showSheetPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Rédiger une fiche de lecture ?
            </h3>
            <p className="text-sm text-slate-600">
              Choisissez le format qui correspond le mieux au livre.
            </p>
            <div className="mt-5 grid gap-3">
              <button
                onClick={() => startSheet('essai')}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Essai
              </button>
              <button
                onClick={() => startSheet('roman_histoire')}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Roman / Histoire
              </button>
              <button
                onClick={() => startSheet('libre')}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Je fais ma propre fiche
              </button>
            </div>
            <button
              onClick={handleCloseSheet}
              className="mt-6 w-full text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {showSheetForm && sheetType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Fiche de lecture — {getSheetLabel(sheetType)}
              </h3>
              <button
                onClick={handleCloseSheet}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveSheet();
              }}
            >
              {getFieldsForType(sheetType).map((field) => (
                <div key={field.id} className="mb-4">
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    {field.label}
                  </label>
                  {field.helper && (
                    <p className="text-xs text-slate-500 mb-2">{field.helper}</p>
                  )}
                  {field.type === 'rating' ? (
                    <select
                      value={sheetResponses[field.id] ?? ''}
                      onChange={(event) =>
                        setSheetResponses((prev) => ({
                          ...prev,
                          [field.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="">Choisir une note</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  ) : (
                    <textarea
                      value={sheetResponses[field.id] ?? ''}
                      onChange={(event) =>
                        setSheetResponses((prev) => ({
                          ...prev,
                          [field.id]: event.target.value,
                        }))
                      }
                      rows={sheetType === 'libre' ? 10 : 3}
                      placeholder={field.placeholder}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  )}
                </div>
              ))}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="submit" className="clean-btn px-6 py-2 text-sm">
                  Enregistrer la fiche
                </button>
                <button
                  type="button"
                  onClick={handleCloseSheet}
                  className="px-6 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
