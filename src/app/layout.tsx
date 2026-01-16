import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { LibraryProvider } from "@/context/LibraryContext";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "BookRank - Classement de livres",
  description: "Notez et organisez vos lectures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${inter.variable} font-sans bg-slate-50 min-h-screen text-slate-900`}>
        <LibraryProvider>
          <Navbar />
          <main className="container mx-auto p-4 md:p-8">
            {children}
          </main>
        </LibraryProvider>
      </body>
    </html>
  );
}