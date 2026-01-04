"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Raffle } from "@/types/raffles";

// Lista de Estados de México
const mexicanStates = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
  "Extranjero",
];

export default function CheckoutPage() {
  const router = useRouter();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<number[]>([]);

  // 1. Agregamos el campo 'state' al estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "", // Estado inicial vacío
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos del carrito
  useEffect(() => {
    const savedRaffle = localStorage.getItem("cart_raffle");
    const savedTickets = localStorage.getItem("cart_tickets");

    if (!savedRaffle || !savedTickets) {
      router.push("/");
      return;
    }

    setRaffle(JSON.parse(savedRaffle));
    setTickets(JSON.parse(savedTickets).sort((a: number, b: number) => a - b));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raffle) return;

    // Validación simple
    if (!formData.state) {
      toast.error("Por favor selecciona tu estado de residencia");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Procesando tu reserva...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raffleId: raffle.id,
            clientName: formData.name,
            clientPhone: formData.phone,
            // Nota: Si tu backend aún no guarda el estado, no pasará nada malo,
            // pero lo enviamos por si acaso decides actualizar la base de datos después.
            clientState: formData.state,
            ticketNumbers: tickets,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al reservar");
      }

      localStorage.removeItem("cart_raffle");
      localStorage.removeItem("cart_tickets");
      toast.success("¡Boletos apartados!", { id: toastId });

      const total = tickets.length * raffle.ticketPrice;
      const ticketString = tickets
        .map((t) => `#${t.toString().padStart(3, "0")}`)
        .join(", ");

      // 2. Incluimos el Estado en el mensaje de WhatsApp
      const message = `👋 Hola, acabo de apartar boletos en la rifa *${raffle.name}*.\n\n🎟️ *Boletos:* ${ticketString}\n👤 *A nombre de:* ${formData.name}\n📍 *Estado:* ${formData.state}\n💰 *Total a pagar:* $${total}\n\n¿Me ayudas con los datos de pago?`;

      // RECUERDA: Cambiar esto por una variable de entorno en producción
      const adminPhone = "5215512345678";

      const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
        message
      )}`;

      window.open(waLink, "_blank");
      router.push(`/verificar`);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!raffle)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        Cargando carrito...
      </div>
    );

  const total = tickets.length * raffle.ticketPrice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent dark:border-gray-700 h-fit transition-all">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Finalizar Reserva 📝
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Ingresa tus datos para apartar los boletos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Campo Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Lo usaremos para confirmar tu premio.
              </p>
            </div>

            {/* 3. Nuevo Campo: ESTADO (Combo Box) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado de Residencia
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Selecciona tu estado
                  </option>
                  {mexicanStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {/* Flecha decorativa del select */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5"
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
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Al confirmar, te redirigiremos a WhatsApp para finalizar el pago.
            </p>
          </form>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN (Sin cambios estructurales) === */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800 h-fit transition-colors">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">
            Resumen de Compra
          </h2>

          <div className="flex gap-4 items-center mb-6">
            {raffle.imageUrl && (
              <img
                src={raffle.imageUrl}
                className="w-20 h-20 object-cover rounded-lg shadow-sm border border-white/20"
                alt="Premio"
              />
            )}
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                {raffle.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sorteo: {new Date(raffle.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-6 shadow-sm border border-transparent dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Tus Números:
            </p>
            <div className="flex flex-wrap gap-2">
              {tickets.map((t) => (
                <span
                  key={t}
                  className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded font-mono font-bold text-sm border border-transparent dark:border-blue-800"
                >
                  {t.toString().padStart(3, "0")}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-blue-200 dark:border-blue-800 pt-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Cantidad</span>
              <span>{tickets.length} boletos</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Precio unitario</span>
              <span>${raffle.ticketPrice}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-blue-900 dark:text-white pt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
