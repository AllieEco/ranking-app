export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  thumbnail?: string;
  isbn?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  publisher?: string;
}

export interface LibraryBook extends Book {
  userRating?: number;
  readDate: string;
  status: 'read' | 'reading' | 'want_to_read';
}

export interface Cabinet {
  id: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}
