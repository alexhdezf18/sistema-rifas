export default function Hero() {
  return (
    // Fondo principal cambia a Slate-900 (gris azulado oscuro)
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white dark:bg-slate-950 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
          <div className="sm:text-center lg:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide mb-4">
              🔥 Sorteos 100% Verificados
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Gana premios soñados</span>{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                con muy poco dinero
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-auto">
              La plataforma más segura y transparente para participar en rifas.
              Elige tu número de la suerte, paga seguro y espera el gran día.
            </p>
            {/* Botones */}
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
              <a
                href="#sorteos"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-1"
              >
                Ver Premios Disponibles
              </a>
              <a
                href="/verificar"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-200 dark:border-gray-700 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 md:py-4 md:text-lg transition-colors"
              >
                Ya compré boleto
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho (Imagen/Decoración) */}
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full text-gray-200 dark:text-slate-800 opacity-20"
          fill="currentColor"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0 100 C 20 0 50 0 100 100 Z"></path>
        </svg>
        <div className="relative text-9xl animate-bounce-slow filter dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          🎁
        </div>
      </div>
    </div>
  );
}
