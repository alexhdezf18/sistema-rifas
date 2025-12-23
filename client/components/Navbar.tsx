import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl group-hover:rotate-12 transition-transform">
              R
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">
              TuRifa<span className="text-blue-600">.com</span>
            </span>
          </Link>

          {/* Menú Derecha */}
          <div className="flex items-center gap-4">
            <Link
              href="/verificar"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block"
            >
              🔍 Ver mis boletos
            </Link>
            <Link
              href="#sorteos"
              className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg shadow-gray-200"
            >
              Participar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
