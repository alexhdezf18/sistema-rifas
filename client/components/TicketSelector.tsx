"use client";

import { useState, useEffect } from "react";
import { Raffle } from "@/types/raffles";

interface Props {
  raffle: Raffle;
}

export default function TicketSelector({ raffle }: Props) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [occupiedNumbers, setOccupiedNumbers] = useState<number[]>([]); // <--- Nuevo estado
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Generar lista de números
  const totalToShow = Math.min(raffle.totalTickets, 500);
  const numbers = Array.from({ length: totalToShow }, (_, i) => i);

  // 1. CARGAR NÚMEROS OCUPADOS AL INICIO
  useEffect(() => {
    const fetchOccupied = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/tickets/occupied/${raffle.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setOccupiedNumbers(data); // Guardamos la lista negra: [5, 20, 99...]
        }
      } catch (error) {
        console.error("Error cargando tickets ocupados:", error);
      }
    };

    fetchOccupied();
  }, [raffle.id]); // Se ejecuta cada vez que cambia la rifa

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

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
        // Actualizamos visualmente los ocupados agregando los que acabamos de comprar
        setOccupiedNumbers([...occupiedNumbers, ...selectedNumbers]);

        setSelectedNumbers([]);
        setClientName("");
        setClientPhone("");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Selecciona tus boletos 🎟️
      </h2>

      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isOccupied = occupiedNumbers.includes(num); // <--- ¿Está vendido?

          return (
            <button
              key={num}
              disabled={isOccupied} // <--- Bloquear clic si está ocupado
              onClick={() => toggleNumber(num)}
              className={`
                aspect-square border-2 rounded-lg flex items-center justify-center font-bold transition-all
                ${
                  isOccupied
                    ? "bg-red-100 border-red-200 text-red-300 cursor-not-allowed line-through" // Estilo OCUPADO (Rojo tachado)
                    : isSelected
                    ? "bg-yellow-400 border-yellow-500 text-black scale-95 shadow-inner" // Estilo SELECCIONADO
                    : "border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50" // Estilo DISPONIBLE
                }
              `}
            >
              {num.toString().padStart(raffle.totalTickets > 99 ? 3 : 2, "0")}
            </button>
          );
        })}
      </div>

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
