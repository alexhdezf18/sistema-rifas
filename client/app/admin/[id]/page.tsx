"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Client {
  name: string;
  phone: string;
}

interface Ticket {
  id: string;
  ticketNumber: number;
  status: "RESERVED" | "PAID";
  clientState?: string; // <--- 1. Agregamos el campo nuevo aquí
  client: Client;
}

export default function RaffleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
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
        console.log("🎟️ Tickets recibidos:", data); // <--- DEBUG: Mira la consola para ver qué llega

        // Ordenar por número de boleto
        data.sort((a: Ticket, b: Ticket) => a.ticketNumber - b.ticketNumber);
        setTickets(data);
      } else {
        console.error("Error fetching tickets:", await res.text());
      }
    } catch (error) {
      console.error("Error de conexión", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchTickets();
  }, [raffleId, status, session]); // session agregado a dependencias

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
        fetchTickets(); // Recargar la lista
      } else {
        toast.error("Error al actualizar", { id: confirmToast });
      }
    } catch (error) {
      toast.error("Error conexión", { id: confirmToast });
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    // Filtro por Estado (Pagado/Pendiente)
    if (filterStatus !== "ALL" && ticket.status !== filterStatus) return false;

    // Filtro por Búsqueda
    const searchLower = searchTerm.toLowerCase();
    const clientName = ticket.client?.name?.toLowerCase() || "";
    const clientPhone = ticket.client?.phone || "";
    const ticketNum = ticket.ticketNumber.toString();
    const clientState = ticket.clientState?.toLowerCase() || "";

    return (
      clientName.includes(searchLower) ||
      clientPhone.includes(searchLower) ||
      ticketNum.includes(searchLower) ||
      clientState.includes(searchLower)
    );
  });

  const stats = {
    total: tickets.length,
    paid: tickets.filter((t) => t.status === "PAID").length,
    pending: tickets.filter((t) => t.status === "RESERVED").length,
  };

  if (status === "loading" || loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
        Cargando boletos...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-2 transition-colors mb-4"
          >
            &larr; Volver al Panel
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestionar Boletos
            </h1>
            <div className="flex gap-4 text-sm">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                <span className="font-bold block text-lg">{stats.paid}</span>{" "}
                Pagados
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <span className="font-bold block text-lg">{stats.pending}</span>{" "}
                Pendientes
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, estado o boleto..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {(["ALL", "RESERVED", "PAID"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filterStatus === s
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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

        {/* Tabla de Resultados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    # Boleto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  {/* 2. Columna nueva */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono font-bold px-2 py-1 rounded text-lg">
                          {ticket.ticketNumber.toString().padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {ticket.client?.name || "Anónimo"}
                      </td>
                      {/* 3. Celda nueva con el Estado */}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {ticket.clientState || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {ticket.client?.phone ? (
                          <>
                            <a
                              href={`https://wa.me/${ticket.client.phone.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 p-1 rounded-full transition-colors"
                            >
                              📱
                            </a>
                            {ticket.client.phone}
                          </>
                        ) : (
                          "S/N"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            ticket.status === "PAID"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
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
                          <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                            Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6} // Ajustado a 6 columnas
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No hay boletos que coincidan.
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
