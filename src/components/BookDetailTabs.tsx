"use client";

import { useMemo, useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { ReadingSheet, ReadingSheetType } from '@/types';
import { ESSAI_FIELDS, LIBRE_FIELDS, ROMAN_FIELDS } from '@/constants/readingSheets';

interface BookDetailTabsProps {
  bookId: string;
  description?: string;
}

type TabKey = 'resume' | 'fiche';

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

const renderDescription = (description?: string) => {
  const html = description || 'Aucune description disponible pour ce livre.';
  return { __html: html };
};

export default function BookDetailTabs({ bookId, description }: BookDetailTabsProps) {
  const { library, saveReadingSheet } = useLibrary();
  const libraryBook = useMemo(() => library.find((entry) => entry.id === bookId), [library, bookId]);
  const readingSheet = libraryBook?.readingSheet;
  const [activeTab, setActiveTab] = useState<TabKey>('resume');
  const [sheetType, setSheetType] = useState<ReadingSheetType | null>(null);
  const [sheetResponses, setSheetResponses] = useState<Record<string, string>>({});

  const fields = readingSheet ? getFieldsForType(readingSheet.type) : null;
  const responses = readingSheet?.responses ?? {};

  const handleStartSheet = (type: ReadingSheetType) => {
    const initialResponses = getFieldsForType(type).reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = '';
      return acc;
    }, {});
    setSheetType(type);
    setSheetResponses(initialResponses);
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
    saveReadingSheet(bookId, sheet);
    setSheetType(null);
    setActiveTab('fiche');
  };

  return (
    <div className="mb-12">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`rounded-full px-4 py-1 text-sm font-medium border ${
            activeTab === 'resume'
              ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
              : 'border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Résumé
        </button>
        {readingSheet ? (
          <button
            type="button"
            onClick={() => setActiveTab('fiche')}
            className={`rounded-full px-4 py-1 text-sm font-medium border ${
              activeTab === 'fiche'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Lire ma fiche
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('fiche')}
            className={`rounded-full px-4 py-1 text-sm font-medium border ${
              activeTab === 'fiche'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Créer ma fiche
          </button>
        )}
      </div>

      {activeTab === 'resume' ? (
        <div className="prose prose-slate max-w-none">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Résumé</h3>
          <div
            className="text-slate-600 leading-relaxed"
            dangerouslySetInnerHTML={renderDescription(description)}
          />
        </div>
      ) : readingSheet && fields ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Fiche de lecture — {getSheetLabel(readingSheet.type)}
          </h3>
          {fields.map((field) => {
            const rawValue = responses[field.id];
            const isRating = field.type === 'rating';
            const value = rawValue ? (isRating ? `${rawValue} / 5` : rawValue) : 'Non renseigné';
            return (
              <div key={field.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                {field.helper && (
                  <p className="text-xs text-slate-500 mt-1">{field.helper}</p>
                )}
                <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{value}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Créer ma fiche</h3>
            <p className="text-sm text-slate-600">
              Choisissez le format qui correspond le mieux au livre.
            </p>
          </div>
          {!sheetType ? (
            <div className="grid gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => handleStartSheet('essai')}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Essai
              </button>
              <button
                type="button"
                onClick={() => handleStartSheet('roman_histoire')}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Roman / Histoire
              </button>
              <button
                type="button"
                onClick={() => handleStartSheet('libre')}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Je fais ma propre fiche
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveSheet();
              }}
              className="space-y-4"
            >
              {getFieldsForType(sheetType).map((field) => (
                <div key={field.id}>
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
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="submit" className="clean-btn px-6 py-2 text-sm">
                  Enregistrer la fiche
                </button>
                <button
                  type="button"
                  onClick={() => setSheetType(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Changer de type
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
