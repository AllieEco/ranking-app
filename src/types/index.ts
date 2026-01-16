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

export type ReadingSheetType = 'essai' | 'roman_histoire' | 'libre';

export interface ReadingSheet {
  type: ReadingSheetType;
  responses: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryBook extends Book {
  userRating?: number;
  readDate: string;
  status: 'read' | 'reading' | 'want_to_read';
  readingSheet?: ReadingSheet;
}

export interface Cabinet {
  id: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}
