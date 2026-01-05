"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface TicketWithState {
  id: string;
  clientState?: string | null; // El campo que agregamos
}

interface StateSalesChartProps {
  tickets: TicketWithState[];
}

export default function StateSalesChart({ tickets }: StateSalesChartProps) {
  // Lógica para agrupar y contar ventas por estado
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};

    tickets.forEach((t) => {
      // Si el boleto no tiene estado (ventas viejas), lo ponemos como "Desconocido"
      const state = t.clientState || "Desconocido";
      counts[state] = (counts[state] || 0) + 1;
    });

    // Convertir a array y ordenar de mayor a menor
    const sortedStats = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Orden descendente

    // Calcular porcentajes para las barras
    const maxVal = sortedStats.length > 0 ? sortedStats[0].count : 0;

    return sortedStats.map((item) => ({
      ...item,
      percent: maxVal > 0 ? (item.count / maxVal) * 100 : 0,
    }));
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl">
        No hay datos de ventas aún.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        🗺️ Ventas por Estado
      </h3>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {stats.map((stat, index) => (
          <div key={stat.name} className="relative">
            {/* Etiquetas: Nombre y Cantidad */}
            <div className="flex justify-between items-end mb-1 text-sm">
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {index + 1}. {stat.name}
              </span>
              <span className="font-mono text-gray-500 dark:text-gray-400">
                {stat.count} {stat.count === 1 ? "boleto" : "boletos"}
              </span>
            </div>

            {/* Barra de Progreso (Fondo) */}
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Barra de Progreso (Relleno Animado) */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.percent}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full rounded-full ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500" // Top 1 (Dorado)
                    : index === 1
                    ? "bg-gray-400" // Top 2 (Plata)
                    : index === 2
                    ? "bg-orange-700" // Top 3 (Bronce)
                    : "bg-blue-500" // Resto (Azul)
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
