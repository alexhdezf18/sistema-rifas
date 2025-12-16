import { Raffle } from "@/types/raffles";
import { notFound } from "next/navigation";
import TicketSelector from "@/components/TicketSelector"; // <--- Importamos el nuevo componente

// 1. Función para pedir los datos (con mejor manejo de errores)
async function getRaffle(slug: string): Promise<Raffle | null> {
  try {
    // Codificamos el slug por si tiene espacios o caracteres raros
    const cleanSlug = encodeURIComponent(slug);
    const res = await fetch(
      `http://localhost:3000/tickets/../raffles/slug/${cleanSlug}`,
      {
        // Ojo: usa la URL normal http://localhost:3000/raffles/slug/...
        cache: "no-store",
      }
    );
    // Corrijo la URL aquí abajo para evitar confusión, usa la misma que tenías antes
    // Fetch real:
    const resReal = await fetch(
      `http://localhost:3000/raffles/slug/${cleanSlug}`,
      { cache: "no-store" }
    );

    if (!resReal.ok) return null;
    return await resReal.json();
  } catch (error) {
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

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER (Igual que antes) */}
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
        {/* Aquí insertamos el componente interactivo y le pasamos los datos */}
        <TicketSelector raffle={raffle} />
      </div>
    </main>
  );
}
