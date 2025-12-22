import Link from "next/link";
import { Raffle } from "@/types/raffles";

// Función para traer las rifas desde el servidor (Server Component)
async function getActiveRaffles(): Promise<Raffle[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
      cache: "no-store", // Para que siempre muestre datos frescos
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error al cargar rifas:", error);
    return [];
  }
}

export default async function LandingPage() {
  const raffles = await getActiveRaffles();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- NAVBAR SIMPLE --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="text-2xl font-black text-blue-600 tracking-tighter">
            TU RIFA
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Soy Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (Portada) --- */}
      <div className="bg-slate-900 text-white py-20 px-4 text-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block">
            ¡Participa y Gana!
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Los mejores premios <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              al alcance de un boleto
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Seguridad, transparencia y oportunidades reales. Elige tu número de
            la suerte y prepárate para ganar.
          </p>
          <a
            href="#rifas"
            className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-transform hover:scale-105 inline-block"
          >
            Ver Rifas Disponibles 👇
          </a>
        </div>
      </div>

      {/* --- LISTA DE RIFAS (GRID) --- */}
      <div id="rifas" className="max-w-7xl mx-auto px-4 py-16 w-full flex-grow">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Rifas Activas 🔥</h2>
          <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
        </div>

        {raffles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <p className="text-xl text-gray-400 font-medium">
              Aún no hay rifas activas.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              ¡Vuelve pronto para ver nuevos premios!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {raffles.map((raffle) => (
              <Link
                href={`/rifa/${raffle.slug}`}
                key={raffle.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full hover:-translate-y-1"
              >
                {/* IMAGEN DE LA TARJETA */}
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {raffle.imageUrl ? (
                    <img
                      src={raffle.imageUrl}
                      alt={raffle.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <span className="text-4xl">🎁</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {raffle.totalTickets} boletos
                  </div>
                </div>

                {/* CONTENIDO DE LA TARJETA */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {raffle.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                    {raffle.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-bold">
                        Precio
                      </span>
                      <span className="text-2xl font-black text-green-600">
                        ${raffle.ticketPrice}
                      </span>
                    </div>
                    <span className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold group-hover:bg-blue-600 transition-colors">
                      Participar &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Sistema de Rifas. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
