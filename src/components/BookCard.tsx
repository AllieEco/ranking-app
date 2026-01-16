"use client";

import { useState } from 'react';
import { Book } from '@/types';
import { useLibrary } from '@/context/LibraryContext';
import Link from 'next/link';

export default function BookCard({ book }: { book: Book }) {
  const { addToLibrary, isBookInLibrary, library } = useLibrary();
  const [showRating, setShowRating] = useState(false);
  
  const existingBook = library.find(b => b.id === book.id);
  const isInLib = !!existingBook;

  const handleRate = (rating: number) => {
    addToLibrary(book, rating);
    setShowRating(false);
  };

  return (
    <div className="clean-card flex flex-col h-full overflow-hidden group">
      <Link href={`/book/${book.id}`} className="flex gap-4 p-4 cursor-pointer">
        {/* Cover Image */}
        <div className="flex-shrink-0 w-24 h-36 bg-slate-100 rounded shadow-sm overflow-hidden relative">
          {book.thumbnail ? (
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs text-center p-2 bg-slate-50">
              Pas d'image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2" title={book.title}>
            {book.title}
          </h3>
          <p className="text-sm text-slate-500 mb-2 line-clamp-1">
            {book.authors.join(', ')}
          </p>
          
          <div className="mt-auto">
             {book.categories && book.categories.length > 0 && (
                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mb-2">
                  {book.categories[0]}
                </span>
             )}
            {book.publishedDate && (
              <p className="text-xs text-slate-400 font-mono">
                {book.publishedDate.substring(0, 4)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Action / Rating Section */}
      <div className="px-4 pb-4 mt-auto">
        <div className="pt-3 border-t border-slate-100">
          {isInLib ? (
            <div className="flex items-center justify-between text-green-700 bg-green-50 px-3 py-2 rounded-md">
              <span className="text-sm font-medium">Déjà lu</span>
              <span className="flex items-center gap-1 font-bold">
                {existingBook.userRating} <span className="text-yellow-500 text-sm">★</span>
              </span>
            </div>
          ) : showRating ? (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
               <p className="text-xs text-center text-slate-500 mb-2">Votre note</p>
               <div className="flex justify-center gap-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     onClick={() => handleRate(star)}
                     className="text-2xl hover:scale-110 transition-transform focus:outline-none text-slate-300 hover:text-yellow-400"
                     title={`${star} étoiles`}
                   >
                     ★
                   </button>
                 ))}
               </div>
               <button 
                 onClick={() => setShowRating(false)}
                 className="w-full text-center text-xs text-slate-400 mt-2 hover:text-slate-600"
               >
                 Annuler
               </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRating(true)}
              className="w-full clean-btn-outline text-sm flex items-center justify-center gap-2"
            >
              <span>+</span> Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
