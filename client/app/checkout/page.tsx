"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Raffle } from "@/types/raffles";

export default function CheckoutPage() {
  const router = useRouter();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<number[]>([]);

  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  // Cargar datos del carrito (localStorage)
  useEffect(() => {
    const savedRaffle = localStorage.getItem("cart_raffle");
    const savedTickets = localStorage.getItem("cart_tickets");

    if (!savedRaffle || !savedTickets) {
      router.push("/"); // Si no hay carrito, volver al inicio
      return;
    }

    setRaffle(JSON.parse(savedRaffle));
    setTickets(JSON.parse(savedTickets).sort((a: number, b: number) => a - b));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raffle) return;

    setLoading(true);
    const toastId = toast.loading("Procesando tu reserva...");

    try {
      // 1. Enviar datos al Backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raffleId: raffle.id,
            clientName: formData.name,
            clientPhone: formData.phone,
            ticketNumbers: tickets,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al reservar");
      }

      // 2. Éxito: Limpiar carrito y redirigir a WhatsApp
      localStorage.removeItem("cart_raffle");
      localStorage.removeItem("cart_tickets");
      toast.success("¡Boletos apartados!", { id: toastId });

      // Generar mensaje de WhatsApp
      const total = tickets.length * raffle.ticketPrice;
      const ticketString = tickets
        .map((t) => `#${t.toString().padStart(3, "0")}`)
        .join(", ");

      const message = `👋 Hola, acabo de apartar boletos en la rifa *${raffle.name}*.\n\n🎟️ *Boletos:* ${ticketString}\n👤 *A nombre de:* ${formData.name}\n💰 *Total a pagar:* $${total}\n\n¿Me ayudas con los datos de pago?`;

      // Reemplaza este número con TU número real de administrador
      const adminPhone = "5215512345678";

      const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
        message
      )}`;

      // Redirigir a WhatsApp en una pestaña nueva y al inicio en esta
      window.open(waLink, "_blank");
      router.push(`/verificar`); // Los mandamos a donde pueden ver sus boletos
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!raffle)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando carrito...
      </div>
    );

  const total = tickets.length * raffle.ticketPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-lg h-fit">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Finalizar Reserva 📝
          </h1>
          <p className="text-gray-500 mb-6">
            Ingresa tus datos para apartar los boletos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Juan Pérez"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (WhatsApp)
              </label>
              <input
                type="tel"
                required
                placeholder="Ej: 5512345678"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Lo usaremos para confirmar tu premio.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Reservando..."
              ) : (
                <>
                  <span>Confirmar Reserva</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-400">
              Al confirmar, te redirigiremos a WhatsApp para finalizar el pago.
            </p>
          </form>
        </div>

        {/* Columna Derecha: Resumen */}
        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 h-fit">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Resumen de Compra
          </h2>

          <div className="flex gap-4 items-center mb-6">
            {raffle.imageUrl && (
              <img
                src={raffle.imageUrl}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
                alt="Premio"
              />
            )}
            <div>
              <p className="font-bold text-gray-900">{raffle.name}</p>
              <p className="text-sm text-gray-500">
                Sorteo: {new Date(raffle.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Tus Números:
            </p>
            <div className="flex flex-wrap gap-2">
              {tickets.map((t) => (
                <span
                  key={t}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono font-bold text-sm"
                >
                  {t.toString().padStart(3, "0")}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-blue-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Cantidad</span>
              <span>{tickets.length} boletos</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Precio unitario</span>
              <span>${raffle.ticketPrice}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-blue-900 pt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
