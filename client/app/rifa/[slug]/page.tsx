import { Raffle } from "@/types/raffles";
import { notFound } from "next/navigation";

// 1. Función para pedir los datos (con mejor manejo de errores)
async function getRaffle(slug: string): Promise<Raffle | null> {
  try {
    // Codificamos el slug por si tiene espacios o caracteres raros
    const cleanSlug = encodeURIComponent(slug);

    const res = await fetch(`http://localhost:3000/raffles/slug/${cleanSlug}`, {
      cache: "no-store",
    });

    // Si el backend dice 404 o 500, retornamos null
    if (!res.ok) return null;

    // Intentamos leer el JSON
    return await res.json();
  } catch (error) {
    console.error("Error al obtener la rifa:", error);
    return null;
  }
}

// 2. Definimos el tipo de las Props correctamente para Next.js 15
// params ahora es una PROMESA (Promise)
type Props = {
  params: Promise<{ slug: string }>;
};

// 3. Componente principal
export default async function RafflePage({ params }: Props) {
  // PASO CRÍTICO: Primero "desempaquetamos" los params usando await
  const { slug } = await params;

  // Ahora sí, usamos el slug limpio para buscar en la base de datos
  const raffle = await getRaffle(slug);

  // Si no existe la rifa o hubo error, mandamos a 404
  if (!raffle) {
    notFound();
  }

  // Lógica de la cuadrícula
  const totalToShow = Math.min(raffle.totalTickets, 500);
  const numbers = Array.from({ length: totalToShow }, (_, i) => i);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-slate-900 text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{raffle.name}</h1>
        <p className="text-xl opacity-80 max-w-2xl mx-auto">
          {raffle.description}
        </p>
        <div className="mt-6 inline-block bg-green-500 px-6 py-2 rounded-full font-bold text-black shadow-lg">
          Precio por boleto: ${raffle.ticketPrice}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Selecciona tu número de la suerte 🍀
          </h2>

          {/* CUADRÍCULA */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {numbers.map((num) => (
              <button
                key={num}
                className="
                  aspect-square border-2 border-gray-200 rounded-lg 
                  flex items-center justify-center font-bold text-gray-600
                  hover:border-blue-500 hover:bg-blue-50 transition-all
                "
              >
                {/* Formato de ceros (ej. 005) */}
                {num.toString().padStart(raffle.totalTickets > 99 ? 3 : 2, "0")}
              </button>
            ))}
          </div>

          {raffle.totalTickets > 500 && (
            <p className="text-center text-gray-400 mt-4 italic">
              Mostrando solo los primeros 500 números
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
