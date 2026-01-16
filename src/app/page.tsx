"use client";

import { useState } from "react";
import { searchBooks } from "@/services/googleBooks";
import { Book } from "@/types";
import BookCard from "@/components/BookCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setBooks([]);

    const results = await searchBooks(query);
    setBooks(results);
    setLoading(false);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header / Search Section */}
      <div className="max-w-3xl mx-auto text-center space-y-8 py-16">
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
          Classez vos lectures
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Trouvez un livre par son titre ou ISBN, notez-le et organisez votre collection personnelle.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8 flex shadow-sm rounded-lg overflow-hidden border border-slate-300">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un livre, un auteur, un ISBN..."
            className="flex-1 px-6 py-4 bg-white focus:outline-none text-lg text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-4 font-medium hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {loading ? "..." : "Rechercher"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full mb-4"></div>
            <p className="text-slate-500">Recherche en cours...</p>
          </div>
        ) : hasSearched && books.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-lg max-w-lg mx-auto">
            <p className="text-xl font-medium text-slate-900 mb-2">Aucun résultat</p>
            <p className="text-slate-500">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
