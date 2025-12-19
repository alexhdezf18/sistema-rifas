// Archivo: client/app/admin/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // <--- Importante para el botón volver
import { useParams } from "next/navigation"; // Usamos useParams para leer el ID

interface Client {
  name: string;
  phone: string;
}

interface Ticket {
  id: string;
  ticketNumber: number;
  status: "RESERVED" | "PAID";
  client: Client;
}

export default function RaffleDetailsPage() {
  const params = useParams();
  // Aseguramos que id sea un string (puede venir como array en algunos casos raros)
  const raffleId = typeof params?.id === "string" ? params.id : "";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  const fetchTickets = async () => {
    if (!raffleId) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      console.error("No hay token de administrador");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/raffle/${raffleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        alert("Tu sesión expiró.");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (raffleId) {
      fetchTickets();
    }
  }, [raffleId]);

  // Función para marcar como pagado
  const handleMarkPaid = async (ticketId: string) => {
    if (!confirm("¿Confirmar pago?")) return;
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}/pay`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchTickets(); // Recargar tabla
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="p-10">Cargando boletos...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* BOTÓN VOLVER - Para regresar a la lista de rifas */}
        <Link
          href="/admin"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors"
        >
          &larr; Volver al Panel Principal
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Gestionar Boletos
        </h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Boleto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">
                    #{ticket.ticketNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {ticket.status === "PAID" ? "PAGADO" : "PENDIENTE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {ticket.status === "RESERVED" && (
                      <button
                        onClick={() => handleMarkPaid(ticket.id)}
                        className="text-green-600 hover:text-green-900 font-bold"
                      >
                        Confirmar Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No hay boletos apartados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
