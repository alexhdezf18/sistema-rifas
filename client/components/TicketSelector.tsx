"use client"; // Le dice a Next.js que aquí sí hay interactividad

import { useState } from "react";
import { Raffle } from "@/types/raffles";

interface Props {
  raffle: Raffle;
}

export default function TicketSelector({ raffle }: Props) {
  // Estados de la aplicación (Memoria a corto plazo)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Generar lista de números (esto después vendrá del backend para saber cuáles están ocupados)
  const totalToShow = Math.min(raffle.totalTickets, 500);
  const numbers = Array.from({ length: totalToShow }, (_, i) => i);

  // Función para seleccionar/deseleccionar
  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  // Función para enviar la compra al Backend
  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNumbers.length === 0) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffle.id,
          numbers: selectedNumbers,
          clientName,
          clientPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + (data.message || "No se pudo reservar"));
      } else {
        alert(
          `¡Éxito! Has apartado los números: ${selectedNumbers.join(", ")}`
        );
        // Limpiar formulario y selección
        setSelectedNumbers([]);
        setClientName("");
        setClientPhone("");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Selecciona tus boletos 🎟️
      </h2>

      {/* 1. LA CUADRÍCULA INTERACTIVA */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          return (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`
                aspect-square border-2 rounded-lg flex items-center justify-center font-bold transition-all
                ${
                  isSelected
                    ? "bg-yellow-400 border-yellow-500 text-black scale-95 shadow-inner" // Estilo Seleccionado
                    : "border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50" // Estilo Normal
                }
              `}
            >
              {num.toString().padStart(raffle.totalTickets > 99 ? 3 : 2, "0")}
            </button>
          );
        })}
      </div>

      {/* 2. EL PANEL DE COMPRA (Solo aparece si seleccionas algo) */}
      {selectedNumbers.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            Resumen de tu apartado
          </h3>

          <div className="mb-4 text-sm text-gray-600">
            Estás apartando{" "}
            <span className="font-bold">{selectedNumbers.length}</span>{" "}
            boleto(s):
            <div className="mt-1 flex flex-wrap gap-1">
              {selectedNumbers.map((n) => (
                <span
                  key={n}
                  className="bg-white border px-2 py-1 rounded text-xs font-mono"
                >
                  {n}
                </span>
              ))}
            </div>
            <div className="mt-2 font-bold text-green-600 text-lg">
              Total: $
              {(selectedNumbers.length * Number(raffle.ticketPrice)).toFixed(2)}
            </div>
          </div>

          <form onSubmit={handleReserve} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Tu Nombre Completo"
              required
              className="p-3 border rounded-lg"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Tu Teléfono (WhatsApp)"
              required
              className="p-3 border rounded-lg"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className={`
                py-3 px-6 rounded-lg font-bold text-white transition-colors
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }
              `}
            >
              {loading ? "Apartando..." : "Confirmar Apartado"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
