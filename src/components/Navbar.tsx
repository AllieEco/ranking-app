import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
          BookRank
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Rechercher
          </Link>
          <Link href="/library" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Ma Bibliothèque
          </Link>
        </div>
      </div>
    </nav>
  );
}
