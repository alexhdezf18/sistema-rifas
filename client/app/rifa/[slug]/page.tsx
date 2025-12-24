import { Raffle } from "@/types/raffles";
import { notFound } from "next/navigation";
import TicketSelector from "@/components/TicketSelector";
import Countdown from "@/components/Countdown";

async function getRaffle(slug: string): Promise<Raffle | null> {
  try {
    const cleanSlug = encodeURIComponent(slug);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/raffles/slug/${cleanSlug}`,
      { cache: "no-store" }
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
    // CAMBIO 1: El fondo principal ahora cambia a dark:bg-gray-900
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      {/* HEADER: Se mantiene oscuro (slate-900) porque es un estilo "Hero", 
          pero agregamos dark:border-b dark:border-gray-800 por si acaso. */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {raffle.imageUrl && (
            <div className="mb-8 flex justify-center">
              <img
                src={raffle.imageUrl}
                alt={raffle.name}
                // Ajuste leve: borde semitransparente que se ve bien en ambos
                className="w-full max-w-2xl rounded-2xl shadow-2xl border-4 border-white/10 object-cover aspect-video"
              />
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
            {raffle.name}
          </h1>

          {/* --- CRONÓMETRO --- */}
          <div className="mb-8">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2">
              Tiempo Restante para Participar
            </p>
            {/* Nota: Necesitaremos revisar que Countdown no tenga textos negros forzados */}
            <Countdown targetDate={raffle.endDate} />
          </div>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            {raffle.description}
          </p>

          <div className="inline-flex items-center gap-2 bg-green-500 text-black px-8 py-3 rounded-full font-black text-lg shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 transition-transform">
            <span>🎟️</span>
            <span>Boleto: ${raffle.ticketPrice}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE BOLETOS */}
      {/* Aquí es donde vive la lógica compleja de UI */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <TicketSelector raffle={raffle} />
      </div>
    </main>
  );
}
