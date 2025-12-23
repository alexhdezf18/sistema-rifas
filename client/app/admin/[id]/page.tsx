"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // Agregamos useRouter
import { useSession } from "next-auth/react"; // <--- NUEVO
import { toast } from "sonner";

// ... Interfaces iguales ...
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
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession(); // <--- NUEVO
  const raffleId = typeof params?.id === "string" ? params.id : "";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "RESERVED" | "PAID">(
    "ALL"
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchTickets = async () => {
    // @ts-ignore
    const token = session?.accessToken;
    if (!token || !raffleId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/raffle/${raffleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        data.sort((a: Ticket, b: Ticket) => a.ticketNumber - b.ticketNumber);
        setTickets(data);
      }
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchTickets();
  }, [raffleId, status, session]);

  const handleMarkPaid = async (ticketId: string) => {
    const confirmToast = toast.loading("Procesando pago...");
    // @ts-ignore
    const token = session?.accessToken;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}/pay`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Pago registrado", { id: confirmToast });
        fetchTickets();
      } else {
        toast.error("Error", { id: confirmToast });
      }
    } catch (error) {
      toast.error("Error conexión", { id: confirmToast });
    }
  };

  // ... Lógica de filtros y renderizado IGUAL que antes ...
  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== "ALL" && ticket.status !== filterStatus) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.client.name.toLowerCase().includes(searchLower) ||
      ticket.client.phone.includes(searchLower) ||
      ticket.ticketNumber.toString().includes(searchLower)
    );
  });

  const stats = {
    total: tickets.length,
    paid: tickets.filter((t) => t.status === "PAID").length,
    pending: tickets.filter((t) => t.status === "RESERVED").length,
  };

  if (status === "loading" || loading)
    return <div className="p-10 text-center text-gray-500">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      {/* ... El JSX es exactamente el mismo que tenías, solo cambiamos la lógica de arriba ... */}
      {/* ... Copia aquí todo el contenido del return que tenías antes ... */}
      {/* Para simplificar, te paso el bloque de return COMPLETO para evitar errores de copy-paste */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors mb-4"
          >
            &larr; Volver al Panel
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestionar Boletos
            </h1>
            <div className="flex gap-4 text-sm">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-200">
                <span className="font-bold block text-lg">{stats.paid}</span>{" "}
                Pagados
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200">
                <span className="font-bold block text-lg">{stats.pending}</span>{" "}
                Pendientes
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, tel o boleto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(["ALL", "RESERVED", "PAID"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filterStatus === s
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "ALL"
                  ? "Todos"
                  : s === "RESERVED"
                  ? "Pendientes"
                  : "Pagados"}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Boleto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-800 font-mono font-bold px-2 py-1 rounded text-lg">
                          {ticket.ticketNumber.toString().padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {ticket.client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 flex items-center gap-2">
                        <a
                          href={`https://wa.me/${ticket.client.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-600 hover:bg-green-100 p-1 rounded-full"
                        >
                          📱
                        </a>
                        {ticket.client.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            ticket.status === "PAID"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {ticket.status === "PAID"
                            ? "✅ PAGADO"
                            : "⏳ PENDIENTE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {ticket.status === "RESERVED" && (
                          <button
                            onClick={() => handleMarkPaid(ticket.id)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors shadow-sm"
                          >
                            Confirmar Pago
                          </button>
                        )}
                        {ticket.status === "PAID" && (
                          <span className="text-gray-400 text-xs italic">
                            Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No hay boletos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
