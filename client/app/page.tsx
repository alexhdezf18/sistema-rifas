import { Raffle } from "@/types/raffles";
import Link from "next/link";

// Función para obtener las rifas con manejo de errores
async function getRaffles(): Promise<Raffle[]> {
  // 1. Obtenemos la URL y nos aseguramos de que no sea undefined
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  console.log("INTENTANDO CONECTAR A:", apiUrl); // <--- Esto saldría en los logs de Vercel

  if (!apiUrl) {
    console.error("ERROR CRÍTICO: La variable NEXT_PUBLIC_API_URL no existe.");
    return [];
  }

  try {
    // 2. Hacemos el fetch
    const res = await fetch(`${apiUrl}/raffles`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Error del servidor: ${res.status} ${res.statusText}`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Error de conexión:", error);
    return [];
  }
}

export default async function Home() {
  const raffles = await getRaffles();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Grandes Rifas, Grandes Premios 🎁
        </h1>
        <p className="text-xl opacity-80 max-w-2xl mx-auto">
          Participa en nuestras rifas exclusivas y gana premios increíbles.
          Selecciona tu número de la suerte hoy mismo.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Rifas Disponibles
        </h2>

        {raffles.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              No hay rifas activas en este momento o hubo un error de conexión.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              (Revisa los logs de Vercel para ver la URL)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {raffles.map((raffle) => (
              <Link
                href={`/rifa/${raffle.slug}`}
                key={raffle.id}
                className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                  🎟️
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {raffle.name}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4 text-sm">
                    {raffle.description}
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-sm font-bold">
                      ${raffle.ticketPrice} / boleto
                    </span>
                    <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Ver boletos &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
