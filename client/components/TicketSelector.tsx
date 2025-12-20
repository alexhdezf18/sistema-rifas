"use client";

import { useState, useEffect } from "react";
import { Raffle } from "@/types/raffles";

interface Props {
  raffle: Raffle;
}

export default function TicketSelector({ raffle }: Props) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [occupiedNumbers, setOccupiedNumbers] = useState<number[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para el Modal de Pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastReservedNumbers, setLastReservedNumbers] = useState<number[]>([]);
  const [lastTotal, setLastTotal] = useState(0);

  // Generar lista de números
  const totalToShow = Math.min(raffle.totalTickets, 500);
  const numbers = Array.from({ length: totalToShow }, (_, i) => i);

  // 1. CARGAR NÚMEROS OCUPADOS AL INICIO
  useEffect(() => {
    const fetchOccupied = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tickets/occupied/${raffle.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setOccupiedNumbers(data);
        }
      } catch (error) {
        console.error("Error cargando tickets ocupados:", error);
      }
    };

    fetchOccupied();
  }, [raffle.id]);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
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
        // --- ÉXITO: Preparamos el Modal ---
        const total = selectedNumbers.length * Number(raffle.ticketPrice);
        setLastReservedNumbers(selectedNumbers);
        setLastTotal(total);

        // Actualizamos visualmente
        setOccupiedNumbers([...occupiedNumbers, ...selectedNumbers]);

        // Limpiamos formulario
        setSelectedNumbers([]);
        setClientName("");
        setClientPhone("");

        // ¡ABRIMOS EL MODAL!
        setShowPaymentModal(true);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el modal
  const closeModal = () => setShowPaymentModal(false);

  // --- DATOS BANCARIOS (Personaliza esto) ---
  const BANK_INFO = {
    bankName: "BBVA Bancomer",
    accountNumber: "1234 5678 9012 3456",
    beneficiary: "Alex Hernández",
    clabe: "012345678901234567",
  };

  // --- MENSAJE DE WHATSAPP ---
  // Cambia este número por el tuyo real
  const ADMIN_PHONE = "5216141234567"; // Ej: 52 + 1 + Lada + Número
  const whatsappMessage = encodeURIComponent(
    `Hola, acabo de apartar los boletos: ${lastReservedNumbers.join(
      ", "
    )} de la rifa "${
      raffle.name
    }".\n\nTotal a pagar: $${lastTotal}.\n\nAquí envío mi comprobante de pago 👇`
  );
  const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Selecciona tus boletos 🎟️
      </h2>

      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isOccupied = occupiedNumbers.includes(num);

          return (
            <button
              key={num}
              disabled={isOccupied}
              onClick={() => toggleNumber(num)}
              className={`
                aspect-square border-2 rounded-lg flex items-center justify-center font-bold transition-all
                ${
                  isOccupied
                    ? "bg-red-100 border-red-200 text-red-300 cursor-not-allowed line-through"
                    : isSelected
                    ? "bg-yellow-400 border-yellow-500 text-black scale-95 shadow-inner"
                    : "border-gray-200 text-gray-600 hover:border-blue-500 hover:bg-blue-50"
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
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Tu Teléfono (WhatsApp)"
              required
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className={`
                py-3 px-6 rounded-lg font-bold text-white transition-colors shadow-md
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

      {/* --- MODAL DE PAGO (Overlay) --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            {/* Header del Modal */}
            <div className="bg-green-600 p-6 text-white text-center">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-3 text-3xl">
                🎉
              </div>
              <h3 className="text-2xl font-bold">¡Boletos Apartados!</h3>
              <p className="text-green-100 mt-1">
                Tienes 24 horas para completar tu pago.
              </p>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 space-y-6">
              {/* Resumen */}
              <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                <p className="text-sm text-gray-500">Total a pagar:</p>
                <p className="text-3xl font-extrabold text-gray-800">
                  ${lastTotal.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Por {lastReservedNumbers.length} boletos
                </p>
              </div>

              {/* Datos Bancarios */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-700 flex items-center gap-2">
                  🏦 Datos de Transferencia:
                </p>
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
                  <div className="flex justify-between">
                    <span>Banco:</span>
                    <span className="font-bold">{BANK_INFO.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficiario:</span>
                    <span className="font-bold">{BANK_INFO.beneficiary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cuenta:</span>
                    <span className="font-mono font-bold select-all">
                      {BANK_INFO.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLABE:</span>
                    <span className="font-mono font-bold select-all">
                      {BANK_INFO.clabe}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl text-center shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Enviar Comprobante
              </a>

              <button
                onClick={closeModal}
                className="w-full py-3 text-gray-500 font-medium hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cerrar y volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
