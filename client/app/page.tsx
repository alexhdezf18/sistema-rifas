import RaffleCard from "@/components/RaffleCard";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import { Raffle } from "@/types/raffles";

// Función para obtener datos (Server Side)
async function getRaffles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
      cache: "no-store", // Para que siempre muestre datos frescos
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const raffles: Raffle[] = await getRaffles();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Barra de Navegación */}
      <Navbar />

      {/* 2. Portada Impactante */}
      <Hero />

      {/* 3. Explicación */}
      <HowItWorks />

      {/* 4. Lista de Sorteos (El Producto) */}
      <div
        id="sorteos"
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex justify-between items-end mb-10">
          <div>
            {/* Título: Agregamos dark:text-white */}
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Sorteos Activos ⚡
            </h2>
            {/* Subtítulo: Agregamos dark:text-gray-400 */}
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              No dejes pasar la oportunidad, el tiempo corre.
            </p>
          </div>
        </div>

        {raffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {raffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        ) : (
          /* Estado vacío: Fondo oscuro (gray-800) y bordes oscuros (gray-700) */
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
            <p className="text-xl text-gray-400 dark:text-gray-300 font-medium">
              Actualmente estamos preparando nuevos sorteos.
              <br />
              ¡Vuelve pronto! 🕒
            </p>
          </div>
        )}
      </div>

      {/* 5. Footer Sencillo */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">TuRifa.com</h3>
          <p className="text-gray-400 mb-8">
            La forma moderna, segura y transparente de ganar.
          </p>
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
