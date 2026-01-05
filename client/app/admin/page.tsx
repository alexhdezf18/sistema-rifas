"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Raffle } from "@/types/raffles";
import { toast } from "sonner";
import RevenueChart from "@/components/RevenueChart";
import StateSalesChart from "@/components/admin/StateSalesChart";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Verificar Sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRaffles();
    }
  }, [status, router]);

  // 2. Cargar Datos
  const fetchRaffles = async () => {
    // @ts-ignore
    const token = session?.accessToken;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRaffles(data);
      }
    } catch (error) {
      console.error("Error cargando rifas:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVO: Agrupar tickets para la gráfica de estados ---
  // Aplanamos el array: Dejamos de ver rifas individuales y vemos un solo "mar" de tickets vendidos
  const allTickets = raffles.flatMap((r) => r.tickets || []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    name: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`¿Eliminar "${name}"?`)) return;

    const toastId = toast.loading("Eliminando...");
    // @ts-ignore
    const token = session?.accessToken;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/raffles/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Eliminada", { id: toastId });
        fetchRaffles();
      } else {
        toast.error("Error al eliminar", { id: toastId });
      }
    } catch (error) {
      toast.error("Error de conexión", { id: toastId });
    }
  };

  // Loader
  if (status === "loading" || (loading && status === "authenticated"))
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors">
        Cargando panel seguro...
      </div>
    );

  if (status === "unauthenticated") return null;

  return (
    // FONDO: bg-gray-50 -> dark:bg-gray-900
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Control 🔒
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Hola,{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {session?.user?.name}
              </span>
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleLogout}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors px-4"
            >
              Cerrar Sesión
            </button>
            <Link
              href="/admin/create-raffle"
              className="bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2"
            >
              <span>+</span> Crear Rifa
            </Link>
          </div>
        </div>

        {/* --- SECCIÓN DE GRÁFICAS (Grid de 2 columnas) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfica de Ingresos (Ya la tenías) */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <RevenueChart />
          </div>

          {/* NUEVO: Gráfica de Estados */}
          <StateSalesChart tickets={allTickets} />
        </div>

        {/* Grid de Rifas */}
        {raffles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 dark:text-gray-500 text-lg mb-4">
              No hay rifas activas.
            </p>
            <Link
              href="/admin/create-raffle"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Crear una ahora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => {
              const sold = raffle._count?.tickets || 0;
              const total = raffle.totalTickets;
              const percentage = Math.round((sold / total) * 100);
              const moneyRaised = sold * Number(raffle.ticketPrice);

              let barColor = "bg-blue-600 dark:bg-blue-500";
              if (percentage > 50) barColor = "bg-yellow-500";
              if (percentage > 90) barColor = "bg-green-500";

              return (
                <div key={raffle.id} className="relative group">
                  {/* Botones Flotantes (Edit/Delete) */}
                  <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      href={`/admin/edit-raffle/${raffle.id}`}
                      className="bg-white/90 dark:bg-gray-700/90 p-2 rounded-full text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-sm backdrop-blur-sm"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, raffle.id, raffle.name)}
                      className="bg-white/90 dark:bg-gray-700/90 p-2 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm backdrop-blur-sm"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Tarjeta de Rifa */}
                  <Link
                    href={`/admin/${raffle.id}`}
                    className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:dark:shadow-blue-900/10 transition-all hover:-translate-y-1 relative overflow-hidden h-full"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10 pr-8">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors">
                        {raffle.name}
                      </h3>
                      <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md whitespace-nowrap">
                        ${raffle.ticketPrice} c/u
                      </span>
                    </div>

                    {raffle.imageUrl && (
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 -mr-4 -mt-4 rounded-full overflow-hidden pointer-events-none">
                        <img
                          src={raffle.imageUrl}
                          className="w-full h-full object-cover"
                          alt="bg"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                          Vendidos
                        </p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">
                          {sold}{" "}
                          <span className="text-gray-400 dark:text-gray-500 text-sm font-normal">
                            / {total}
                          </span>
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold">
                          Recaudado
                        </p>
                        <p className="text-xl font-black text-green-700 dark:text-green-300">
                          ${moneyRaised.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                        <span>Progreso</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
