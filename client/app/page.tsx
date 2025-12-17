import { Raffle } from "@/types/raffles";
import Link from "next/link";

async function getRaffles(): Promise<Raffle[]> {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // --- LIMPIEZA PROFUNDA DE LA VARIABLE ---

  // 1. Quitar comillas simples o dobles si las hubiera
  apiUrl = apiUrl.replace(/['"]+/g, "");

  // 2. Quitar espacios al inicio y al final
  apiUrl = apiUrl.trim();

  // 3. Quitar barra al final si existe
  if (apiUrl.endsWith("/")) {
    apiUrl = apiUrl.slice(0, -1);
  }

  // 4. Si después de limpiar no empieza con http, se lo ponemos
  if (apiUrl && !apiUrl.startsWith("http")) {
    apiUrl = `https://${apiUrl}`;
  }

  // --- FIN LIMPIEZA ---

  console.log("URL FINAL LIMPIA:", apiUrl); // Mira esto en los logs si falla

  if (!apiUrl) {
    return [];
  }

  try {
    const res = await fetch(`${apiUrl}/raffles`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error("Error fetching raffles:", error);
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
          Participa y gana premios increíbles.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Rifas Disponibles
        </h2>

        {raffles.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              Cargando rifas o no hay disponibles...
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
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-sm font-bold">
                      ${raffle.ticketPrice}
                    </span>
                    <span className="text-blue-600 font-semibold">
                      Ver &rarr;
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
