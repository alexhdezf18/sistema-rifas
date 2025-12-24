import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    // Agregamos clases dark para el fondo y borde
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-black dark:bg-white text-white dark:text-black w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl group-hover:rotate-12 transition-transform">
              R
            </div>
            {/* Texto del Logo adaptable */}
            <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">
              TuRifa
              <span className="text-blue-600 dark:text-blue-400">.com</span>
            </span>
          </Link>

          {/* Menú Derecha */}
          <div className="flex items-center gap-4">
            <Link
              href="/verificar"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors hidden sm:block"
            >
              🔍 Ver mis boletos
            </Link>

            <ThemeToggle />

            <Link
              href="/#sorteos"
              className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
            >
              Participar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
