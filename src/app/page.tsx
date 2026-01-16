"use client";

import { useEffect, useState } from "react";
import { searchBooks } from "@/services/googleBooks";
import { Book } from "@/types";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [topBooks, setTopBooks] = useState<
    Array<Book & { totalStars: number; voteCount: number; averageRating: number }>
  >([]);
  const [loadingTop, setLoadingTop] = useState(true);

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

  useEffect(() => {
    const addLibraryEntries = (
      entries: Array<Book & { userRating?: number }>,
      aggregate: Map<string, { book: Book; totalStars: number; voteCount: number }>
    ) => {
      entries.forEach((entry) => {
        if (!entry?.id || typeof entry.userRating !== "number") {
          return;
        }
        const existing = aggregate.get(entry.id);
        if (!existing) {
          aggregate.set(entry.id, {
            book: {
              id: entry.id,
              title: entry.title,
              authors: entry.authors ?? [],
              description: entry.description,
              thumbnail: entry.thumbnail,
              isbn: entry.isbn,
              publishedDate: entry.publishedDate,
              pageCount: entry.pageCount,
              categories: entry.categories,
              publisher: entry.publisher,
            },
            totalStars: entry.userRating,
            voteCount: 1,
          });
          return;
        }
        existing.totalStars += entry.userRating;
        existing.voteCount += 1;
      });
    };

    const loadTopBooks = async () => {
      const aggregate = new Map<
        string,
        { book: Book; totalStars: number; voteCount: number }
      >();
      const loadLocalFallback = () => {
        if (typeof window === "undefined") {
          return;
        }
        try {
          const local = window.localStorage.getItem("my_book_library");
          const parsed = local
            ? (JSON.parse(local) as Array<Book & { userRating?: number }>)
            : [];
          if (Array.isArray(parsed)) {
            addLibraryEntries(parsed, aggregate);
          }
        } catch (error) {
          console.error("Erreur lecture bibliothèque locale", error);
        }
      };

      try {
        setLoadingTop(true);
        const snapshot = await getDocs(collection(db, "libraries"));
        snapshot.forEach((doc) => {
          const data = doc.data();
          const library = Array.isArray(data.library) ? data.library : [];
          addLibraryEntries(library as Array<Book & { userRating?: number }>, aggregate);
        });

        if (aggregate.size === 0) {
          loadLocalFallback();
        }

        const ranked = Array.from(aggregate.values())
          .map(({ book, totalStars, voteCount }) => ({
            ...book,
            totalStars,
            voteCount,
            averageRating: totalStars / voteCount,
          }))
          .sort((a, b) => {
            if (b.totalStars !== a.totalStars) {
              return b.totalStars - a.totalStars;
            }
            return b.voteCount - a.voteCount;
          })
          .slice(0, 3);

        setTopBooks(ranked);
      } catch (error) {
        console.error("Erreur chargement top livres", error);
        loadLocalFallback();
        const ranked = Array.from(aggregate.values())
          .map(({ book, totalStars, voteCount }) => ({
            ...book,
            totalStars,
            voteCount,
            averageRating: totalStars / voteCount,
          }))
          .sort((a, b) => {
            if (b.totalStars !== a.totalStars) {
              return b.totalStars - a.totalStars;
            }
            return b.voteCount - a.voteCount;
          })
          .slice(0, 3);
        setTopBooks(ranked);
      } finally {
        setLoadingTop(false);
      }
    };

    void loadTopBooks();
  }, []);

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

      {/* Top 3 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-heading">
            Top 3 des livres les mieux notés
          </h2>
          <span className="text-sm text-slate-500">Communauté BookRank</span>
        </div>
        {loadingTop ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="clean-card p-6 h-40 animate-pulse bg-slate-50"
              />
            ))}
          </div>
        ) : topBooks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-lg">
            Aucun livre noté pour l'instant.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topBooks.map((book, index) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="clean-card p-6 flex gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-20 h-28 bg-slate-100 rounded-md overflow-hidden">
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Pas d'image
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-xs font-semibold text-indigo-600 mb-1">
                    #{index + 1}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {book.authors.join(", ")}
                  </p>
                  <div className="mt-auto text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {book.averageRating.toFixed(1)}
                    </span>{" "}
                    ★ · {book.voteCount} vote{book.voteCount > 1 ? "s" : ""} ·{" "}
                    {book.totalStars} étoiles
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
