import { Raffle } from "@/types/raffles";
import Link from "next/link";

// Función para pedir datos al Backend
async function getRaffles(): Promise<Raffle[]> {
  // Nota: Usamos 'no-store' para que NO guarde caché y siempre muestre datos frescos
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Fallo al obtener las rifas");
  }

  return res.json();
}

export default async function Home() {
  // Aquí ocurre la magia: Esperamos los datos antes de dibujar la página
  const raffles = await getRaffles();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Sorteos Disponibles
          </h1>
          <p className="text-gray-500 mt-2">
            Elige tu número de la suerte y gana premios increíbles.
          </p>
        </header>

        {/* GRID DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => (
            <div
              key={raffle.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Encabezado de la tarjeta (Color aleatorio simulado con degradado) */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl opacity-90">
                  🏆
                </span>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {raffle.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {raffle.description || "Sin descripción disponible"}
                </p>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-semibold">
                      Boleto
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${raffle.ticketPrice}
                    </span>
                  </div>
                  <Link
                    href={`/rifa/${raffle.slug}`}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors inline-block text-center"
                  >
                    Ver Boletos
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay rifas */}
        {raffles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No hay sorteos activos en este momento.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
