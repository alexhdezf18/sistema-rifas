"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface TicketResult {
  id: string;
  ticketNumber: number;
  status: "RESERVED" | "PAID";
  raffle: {
    name: string;
    slug: string;
    ticketPrice: number;
    imageUrl?: string;
  };
}

export default function VerifyPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TicketResult[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.warning("Por favor ingresa un número de teléfono");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/search/${phone}`
      );

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.length === 0) {
          toast.info("No encontramos boletos con ese número.");
        }
      } else {
        toast.error("Error al buscar. Intenta de nuevo.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Simple */}
      <nav className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-blue-600">
            TU RIFA
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-black">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-start pt-16 px-4">
        <div className="max-w-md w-full text-center mb-8">
          <span className="text-4xl mb-4 block">🔍</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificador de Boletos
          </h1>
          <p className="text-gray-500">
            Ingresa tu número de teléfono para ver el estado de tus boletos
            (Pagados o Pendientes).
          </p>
        </div>

        {/* Formulario de Búsqueda */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="Ej: 5512345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Buscar"}
            </button>
          </div>
        </form>

        {/* Resultados */}
        {results && (
          <div className="w-full max-w-md space-y-4 pb-20">
            {results.length > 0 ? (
              results.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`bg-white p-5 rounded-xl border-l-4 shadow-sm flex justify-between items-center ${
                    ticket.status === "PAID"
                      ? "border-l-green-500"
                      : "border-l-yellow-400"
                  }`}
                >
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      {ticket.raffle.name}
                    </p>
                    <p className="text-2xl font-mono font-black text-gray-800">
                      Boleto #{ticket.ticketNumber.toString().padStart(3, "0")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${ticket.raffle.ticketPrice} MXN
                    </p>
                  </div>

                  <div className="text-right">
                    {ticket.status === "PAID" ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 block">
                        ✅ PAGADO
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 block">
                          ⏳ PENDIENTE
                        </span>
                        <Link
                          href={`/rifa/${ticket.raffle.slug}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Ir a Pagar &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-gray-100 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">
                  No encontramos boletos asociados a este número.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
