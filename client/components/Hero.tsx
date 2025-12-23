export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
          <div className="sm:text-center lg:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-4">
              🔥 Sorteos 100% Verificados
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Gana premios soñados</span>{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                con muy poco dinero
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-auto">
              La plataforma más segura y transparente para participar en rifas.
              Elige tu número de la suerte, paga seguro y espera el gran día.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
              <a
                href="#sorteos"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
              >
                Ver Premios Disponibles
              </a>
              <a
                href="/verificar"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 md:py-4 md:text-lg transition-colors"
              >
                Ya compré boleto
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen Decorativa Derecha */}
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 flex items-center justify-center">
        {/* Usamos un patrón SVG de fondo para que cargue rápido y se vea tech */}
        <svg
          className="absolute inset-0 h-full w-full text-gray-200 opacity-20"
          fill="currentColor"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0 100 C 20 0 50 0 100 100 Z"></path>
        </svg>
        <div className="relative text-9xl animate-bounce-slow">🎁</div>
      </div>
    </div>
  );
}
