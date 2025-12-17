"use client";

import { useEffect, useState } from "react";

// Definimos tipos rápidos para no complicarnos
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

export default function AdminDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [raffleId, setRaffleId] = useState<string>("");

  // Desempaquetar params (Next.js 15)
  useEffect(() => {
    params.then((p) => setRaffleId(p.id));
  }, [params]);

  // Cargar datos
  // Cargar datos
  const fetchTickets = async () => {
    if (!raffleId) return;

    // 1. Recuperamos el token
    const token = localStorage.getItem("adminToken");

    // Si no hay token, no tiene caso intentar (o podrías redirigir al login)
    if (!token) {
      console.error("No hay token de administrador");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/tickets/raffle/${raffleId}`,
        {
          // 2. AGREGAMOS EL HEADER DE AUTORIZACIÓN AQUÍ TAMBIÉN
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        alert("Tu sesión expiró. Por favor inicia sesión de nuevo.");
        // Opcional: window.location.href = '/login';
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
    fetchTickets();
  }, [raffleId]);

  // Función para marcar como pagado
  const handleMarkPaid = async (ticketId: string) => {
    if (!confirm("¿Confirmar que recibiste el pago de este boleto?")) return;

    // RECUPERAR EL TOKEN
    const token = localStorage.getItem("adminToken");

    if (!token) {
      alert("No tienes sesión iniciada. Ve a /login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/tickets/${ticketId}/pay`, {
        method: "PATCH",
        headers: {
          // AQUÍ ENVIAMOS LA LLAVE
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Pago registrado exitosamente");
        fetchTickets();
      } else {
        // Si el token expiró o es inválido
        if (res.status === 401)
          alert("Tu sesión expiró. Vuelve a hacer login.");
        else alert("Error al actualizar");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="p-10">Cargando panel...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Panel de Administración
        </h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Boleto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold">
                      #{ticket.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                    {ticket.client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
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
                        className="text-green-600 hover:text-green-900 font-bold border border-green-200 px-3 py-1 rounded hover:bg-green-50"
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
                    Aún no hay boletos vendidos.
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
