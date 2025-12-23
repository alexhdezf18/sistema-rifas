import Link from "next/link";
import { Raffle } from "@/types/raffles";

interface RaffleCardProps {
  raffle: Raffle;
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  // Calculamos el porcentaje vendido para la barra de progreso
  const sold = raffle._count?.tickets || 0;
  const total = raffle.totalTickets;
  const percentage = Math.min(100, Math.round((sold / total) * 100));

  // Formateamos la fecha para que se vea bonita (ej: "25 de diciembre")
  const endDateFormatted = new Date(raffle.endDate).toLocaleDateString(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <Link
      href={`/rifa/${raffle.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
    >
      {/* 1. Imagen del Premio */}
      <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
        {raffle.imageUrl ? (
          <img
            src={raffle.imageUrl}
            alt={raffle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🎁</span>
          </div>
        )}

        {/* Etiqueta de Precio */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
          <p className="text-sm font-bold text-gray-900">
            ${raffle.ticketPrice}{" "}
            <span className="text-xs font-normal text-gray-500">mxn</span>
          </p>
        </div>
      </div>

      {/* 2. Información */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {raffle.name}
        </h3>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
          {raffle.description}
        </p>

        {/* Barra de Progreso */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
            <span>Vendidos: {sold}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* Footer de la tarjeta */}
          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Juega hasta:
              </span>
              <span className="text-xs font-bold text-gray-700">
                {endDateFormatted}
              </span>
            </div>

            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
