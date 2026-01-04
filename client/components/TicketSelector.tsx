"use client";

import { useState, useMemo } from "react";
import { Raffle } from "@/types/raffles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  ticketNumber: number;
  status: "AVAILABLE" | "RESERVED" | "PAID";
}

interface TicketSelectorProps {
  raffle: Raffle;
}

export default function TicketSelector({ raffle }: TicketSelectorProps) {
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Estados para el Modal de Suerte
  const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);
  const [luckyCount, setLuckyCount] = useState(1);
  const [previewLuckyTickets, setPreviewLuckyTickets] = useState<number[]>([]);

  // Simulación de generación de boletos
  const allTickets = useMemo(() => {
    const occupiedNumbers = new Set(
      raffle.tickets?.map((t: any) => t.ticketNumber) || []
    );

    return Array.from({ length: raffle.totalTickets }, (_, i) => {
      const number = i + 1;
      const isOccupied = occupiedNumbers.has(number);

      return {
        ticketNumber: number,
        status: isOccupied ? "PAID" : "AVAILABLE",
      } as Ticket;
    });
  }, [raffle.totalTickets, raffle.tickets]);

  const filteredTickets = useMemo(() => {
    return allTickets.filter((t) => {
      // Filtro por búsqueda (input de texto)
      const matchesSearch = t.ticketNumber.toString().includes(searchTerm);

      // Filtro por disponibilidad (botón "Solo Libres")
      const matchesAvailability = showOnlyAvailable
        ? t.status === "AVAILABLE"
        : true;

      return matchesSearch && matchesAvailability;
    });
  }, [allTickets, searchTerm, showOnlyAvailable]);

  const toggleTicket = (number: number) => {
    if (selectedTickets.includes(number)) {
      setSelectedTickets(selectedTickets.filter((n) => n !== number));
    } else {
      if (selectedTickets.length >= 50) {
        toast.warning("Límite de boletos alcanzado");
        return;
      }
      setSelectedTickets([...selectedTickets, number]);
    }
  };

  // --- LÓGICA DEL GOLPE DE SUERTE ---
  const generatePreview = () => {
    const available = allTickets.filter(
      (t) =>
        t.status === "AVAILABLE" && !selectedTickets.includes(t.ticketNumber)
    );

    if (available.length < luckyCount) {
      toast.warning(`Solo quedan ${available.length} boletos disponibles`);
      return;
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, luckyCount).map((t) => t.ticketNumber);
    setPreviewLuckyTickets(picked.sort((a, b) => a - b));
  };

  const confirmLuckyTickets = () => {
    const totalSelected = selectedTickets.length + previewLuckyTickets.length;
    if (totalSelected > 50) {
      toast.warning("Límite total de boletos excedido");
      return;
    }
    setSelectedTickets([...selectedTickets, ...previewLuckyTickets]);

    confetti({
      particleCount: 100, // Cantidad de papelitos
      spread: 70, // Qué tan abierto es el disparo
      origin: { y: 0.6 }, // Desde dónde sale (0.6 es un poco más abajo de la mitad)
    });

    toast.success("¡Boletos agregados con éxito! 🍀");
    setPreviewLuckyTickets([]);
    setIsLuckyModalOpen(false);
  };

  const handleCheckout = () => {
    if (selectedTickets.length === 0) return;
    localStorage.setItem("cart_raffle", JSON.stringify(raffle));
    localStorage.setItem("cart_tickets", JSON.stringify(selectedTickets));
    router.push(`/checkout`);
  };

  return (
    // CONTENEDOR PRINCIPAL: bg-white -> dark:bg-gray-800
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 relative transition-colors duration-300">
      {/* --- MODAL "GOLPE DE SUERTE" --- */}
      <AnimatePresence>
        {isLuckyModalOpen && (
          // 1. EL FONDO OSCURO (OVERLAY)
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Nota: Quitamos "transition-all" para dejar que framer maneje la animación
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            {/* 2. LA TARJETA DEL MODAL */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              // Nota: Cambiamos <div> por <motion.div> y QUITAMOS "animate-in fade-in zoom-in duration-200"
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-transparent dark:border-gray-700 overflow-hidden"
            >
              <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">🎰</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Golpe de Suerte
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Deja que el destino elija por ti.
                </p>
              </div>

              {/* SECCIÓN 1: Elegir Cantidad */}
              {previewLuckyTickets.length === 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    ¿Cuántos boletos quieres?
                  </label>

                  {/* SELECT: Adaptado a modo oscuro */}
                  <div className="relative">
                    <select
                      value={luckyCount}
                      onChange={(e) => setLuckyCount(Number(e.target.value))}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-8 outline-none font-bold text-center"
                    >
                      {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Boleto" : "Boletos"}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 dark:text-gray-400">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  <button
                    onClick={generatePreview}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all active:scale-95"
                  >
                    ✨ Ver mis Números de la Suerte
                  </button>
                </div>
              ) : (
                // SECCIÓN 2: Vista Previa
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-3 text-sm font-medium">
                    ¡Mira lo que encontramos para ti!
                  </p>

                  {/* Grid de números: Adaptado a azul oscuro en dark mode */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto custom-scrollbar border border-blue-100 dark:border-blue-800">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {previewLuckyTickets.map((num) => (
                        <span
                          key={num}
                          // Números: bg-white -> dark:bg-gray-800
                          className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-mono font-bold px-2 py-1 rounded shadow-sm text-sm"
                        >
                          {num.toString().padStart(3, "0")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmLuckyTickets}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      <span>❤️ Me gustan, ¡agregalos!</span>
                    </button>

                    <button
                      onClick={generatePreview}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>🔄 Mmm, prueba otros</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setIsLuckyModalOpen(false);
                  setPreviewLuckyTickets([]);
                }}
                className="w-full mt-4 text-gray-400 dark:text-gray-500 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER DEL SELECTOR --- */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Elige tu Suerte 🍀
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Selecciona tus números favoritos o deja que el destino decida.
        </p>
      </div>

      {/* --- BARRA DE HERRAMIENTAS (Sticky) --- */}
      {/* bg-white/95 -> dark:bg-gray-800/95 */}
      <div className="sticky top-20 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
        <div className="relative w-full md:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          {/* Input de Búsqueda */}
          <input
            type="number"
            placeholder="Buscar número..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setLuckyCount(1);
              setPreviewLuckyTickets([]);
              setIsLuckyModalOpen(true);
            }}
            // Botón Azar: Fondo morado suave -> Fondo morado oscuro suave
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
          >
            ⚡ Al Azar
          </button>
          <button
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold border transition-colors ${
              showOnlyAvailable
                ? "bg-gray-800 dark:bg-gray-600 text-white border-gray-800 dark:border-gray-600"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            {showOnlyAvailable ? "Ver Todos" : "Solo Libres"}
          </button>
        </div>
      </div>

      {/* --- GRID DE BOLETOS --- */}
      <div className="mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 md:gap-3">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTickets.includes(ticket.ticketNumber);
              const isSold =
                ticket.status === "PAID" || ticket.status === "RESERVED";

              return (
                <button
                  key={ticket.ticketNumber}
                  disabled={isSold}
                  onClick={() => toggleTicket(ticket.ticketNumber)}
                  className={`
                    relative group flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200
                    ${
                      isSold
                        ? // VENDIDO: bg-gray-100 -> dark:bg-gray-900 (Se funde con el fondo)
                          "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? // SELECCIONADO: Se mantiene azul brillante (funciona en ambos)
                          "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 scale-105 transform z-10"
                        : // DISPONIBLE: bg-white -> dark:bg-gray-700 (Gris medio para resaltar)
                          "bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 hover:border-blue-400 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }
                  `}
                >
                  <span
                    className={`text-sm md:text-base font-bold font-mono ${
                      isSelected
                        ? "text-white"
                        : isSold
                        ? "text-gray-400 dark:text-gray-600" // Texto apagado para vendidos
                        : "text-gray-900 dark:text-white" // Texto brillante para disponibles
                    }`}
                  >
                    {ticket.ticketNumber.toString().padStart(3, "0")}
                  </span>
                  {isSold && (
                    <span className="text-[8px] uppercase font-bold text-gray-400 dark:text-gray-600 mt-1">
                      Ocupado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No encontramos boletos con ese criterio 😢
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 dark:text-blue-400 font-bold mt-2 hover:underline"
            >
              Ver todos
            </button>
          </div>
        )}
      </div>

      {/* --- BARRA INFERIOR FLOTANTE (Checkout) --- */}
      <div
        className={`
        fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-all duration-300 z-40
        ${selectedTickets.length > 0 ? "translate-y-0" : "translate-y-full"}
      `}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {/* Lista horizontal de boletos seleccionados */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap mr-2">
              Tus boletos:
            </span>
            {selectedTickets
              .sort((a, b) => a - b)
              .map((num) => (
                <button
                  key={num}
                  onClick={() => toggleTicket(num)}
                  // Chips: Azul claro -> Azul oscuro
                  className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 px-3 py-1 rounded-full text-sm font-mono font-bold flex items-center gap-2 transition-colors group"
                >
                  #{num.toString().padStart(3, "0")}
                  <span className="text-blue-300 group-hover:text-red-400 text-xs">
                    ✕
                  </span>
                </button>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-2">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                {selectedTickets.length}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                  Total a pagar
                </span>
                <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                  $
                  {(
                    selectedTickets.length * raffle.ticketPrice
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSelectedTickets([])}
                className="px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-green-200 dark:shadow-green-900/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <span>Apartar Boletos</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-40"></div>
    </div>
  );
}
