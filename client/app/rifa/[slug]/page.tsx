import { Raffle } from "@/types/raffles";
import { notFound } from "next/navigation";
import TicketSelector from "@/components/TicketSelector";

// 1. Función para pedir los datos
async function getRaffle(slug: string): Promise<Raffle | null> {
  try {
    const cleanSlug = encodeURIComponent(slug);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/raffles/slug/${cleanSlug}`,
      { cache: "no-store" } // Importante para que no guarde caché vieja
    );

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function RafflePage({ params }: Props) {
  const { slug } = await params;
  const raffle = await getRaffle(slug);

  if (!raffle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER CON IMAGEN */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* --- AQUÍ ESTÁ LA MAGIA DE LA IMAGEN --- */}
          {raffle.imageUrl && (
            <div className="mb-8 flex justify-center">
              <img
                src={raffle.imageUrl}
                alt={raffle.name}
                className="w-full max-w-2xl rounded-2xl shadow-2xl border-4 border-white/20 object-cover aspect-video"
              />
            </div>
          )}
          {/* --------------------------------------- */}

          <h1 className="text-3xl md:text-5xl font-bold mb-4">{raffle.name}</h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            {raffle.description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-green-500 px-6 py-2 rounded-full font-bold text-black shadow-lg hover:scale-105 transition-transform">
            <span>🎟️</span>
            <span>Precio por boleto: ${raffle.ticketPrice}</span>
          </div>
        </div>

        {/* Decoración de fondo (opcional) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[100px]"></div>
        </div>
      </div>

      {/* SECCIÓN DE BOLETOS (superpuesta un poco hacia arriba para efecto visual) */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <TicketSelector raffle={raffle} />
      </div>
    </main>
  );
}
