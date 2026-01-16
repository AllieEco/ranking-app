import { getBookById } from '@/services/googleBooks';
import BookActions from '@/components/BookActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: 'Livre introuvable' };
  return {
    title: `${book.title} - BookRank`,
    description: book.description?.substring(0, 160) || `Détails sur ${book.title}`,
  };
}

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors text-sm font-medium">
        ← Retour à la recherche
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="md:flex">
          {/* Colonne Image */}
          <div className="md:w-1/3 bg-slate-50 p-8 flex flex-col items-center border-r border-slate-100">
            <div className="w-48 shadow-lg rounded-lg overflow-hidden mb-8">
              {book.thumbnail ? (
                <img 
                  src={book.thumbnail.replace('zoom=1', 'zoom=2')} 
                  alt={book.title} 
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-slate-200 flex items-center justify-center text-slate-400 font-medium">
                  Pas d'image
                </div>
              )}
            </div>
            
            <div className="w-full">
              <BookActions book={book} />
            </div>
          </div>

          {/* Colonne Infos */}
          <div className="md:w-2/3 p-8 md:p-12">
            <div className="mb-8 border-b border-slate-100 pb-8">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-slate-600 font-medium">
                par {book.authors.join(', ')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {book.categories?.map((cat) => (
                <span key={cat} className="bg-indigo-50 text-indigo-700 px-3 py-1 text-sm font-medium rounded-full">
                  {cat}
                </span>
              ))}
              {book.pageCount && (
                <span className="bg-slate-100 text-slate-600 px-3 py-1 text-sm font-medium rounded-full">
                  {book.pageCount} pages
                </span>
              )}
              {book.publishedDate && (
                <span className="bg-slate-100 text-slate-600 px-3 py-1 text-sm font-medium rounded-full">
                  {book.publishedDate.substring(0, 4)}
                </span>
              )}
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Résumé</h3>
              <div 
                className="text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={createMarkup(book.description || "Aucune description disponible pour ce livre.")}
              />
            </div>

            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 text-sm">
              <div>
                <span className="block text-slate-500 font-medium mb-1">ISBN</span>
                <span className="text-slate-900 font-mono select-all">{book.isbn || 'Non disponible'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium mb-1">Éditeur</span>
                <span className="text-slate-900">{book.publisher || 'Non spécifié'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
