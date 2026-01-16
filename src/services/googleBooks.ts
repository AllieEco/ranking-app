import { Book } from '@/types';

const API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchBooks = async (query: string): Promise<Book[]> => {
  if (!query) return [];
  
  try {
    const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&maxResults=20&langRestrict=fr`);
    const data = await res.json();
    
    if (!data.items) return [];

    return data.items.map((item: any) => formatBookData(item));
  } catch (error) {
    console.error("Erreur lors de la recherche de livres:", error);
    return [];
  }
};

export const getBookById = async (id: string): Promise<Book | null> => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    
    if (!data.id) return null;

    return formatBookData(data);
  } catch (error) {
    console.error("Erreur lors de la récupération du livre:", error);
    return null;
  }
};

// Helper pour formater les données de l'API de manière cohérente
const formatBookData = (item: any): Book => {
  const info = item.volumeInfo;
  return {
    id: item.id,
    title: info.title,
    authors: info.authors || ['Auteur inconnu'],
    description: info.description || 'Pas de description disponible.',
    thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    isbn: info.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || info.industryIdentifiers?.[0]?.identifier,
    publishedDate: info.publishedDate,
    pageCount: info.pageCount,
    categories: info.categories,
    publisher: info.publisher,
  };
};
