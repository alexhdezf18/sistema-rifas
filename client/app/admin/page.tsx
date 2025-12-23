"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Raffle } from "@/types/raffles";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar datos
  const fetchRaffles = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchRaffles();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    name: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        `¿Estás SEGURO de eliminar la rifa "${name}"?\nEsta acción no se puede deshacer y borrará los boletos asociados.`
      )
    ) {
      return;
    }

    const toastId = toast.loading("Eliminando rifa...");
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/raffles/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Rifa eliminada correctamente", { id: toastId });
        fetchRaffles();
      } else {
        toast.error("No se pudo eliminar (quizás tiene ventas activas)", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Error de conexión", { id: toastId });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando estadísticas...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Control 📈
            </h1>
            <p className="text-gray-500">
              Resumen de ventas y gestión de rifas.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 font-medium transition-colors px-4"
            >
              Salir
            </button>
            <Link
              href="/admin/create-raffle"
              className="bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
            >
              <span>+</span> Crear Rifa
            </Link>
          </div>
        </div>

        {/* Grid de Rifas */}
        {raffles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg mb-4">
              No tienes ninguna rifa activa.
            </p>
            <Link
              href="/admin/create-raffle"
              className="text-blue-600 font-bold hover:underline"
            >
              ¡Empieza tu negocio aquí!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => {
              const sold = raffle._count?.tickets || 0;
              const total = raffle.totalTickets;
              const percentage = Math.round((sold / total) * 100);
              const moneyRaised = sold * Number(raffle.ticketPrice);

              let barColor = "bg-blue-600";
              if (percentage > 50) barColor = "bg-yellow-500";
              if (percentage > 90) barColor = "bg-green-500";

              return (
                <div key={raffle.id} className="relative group">
                  {/* --- CORRECCIÓN AQUÍ: CONTENEDOR DE BOTONES --- */}
                  <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Botón Editar */}
                    <Link
                      href={`/admin/edit-raffle/${raffle.id}`}
                      className="bg-white/90 p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm backdrop-blur-sm"
                      title="Editar rifa"
                    >
                      ✏️
                    </Link>

                    {/* Botón Borrar */}
                    <button
                      onClick={(e) => handleDelete(e, raffle.id, raffle.name)}
                      className="bg-white/90 p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 shadow-sm backdrop-blur-sm"
                      title="Eliminar rifa"
                    >
                      🗑️
                    </button>
                  </div>
                  {/* ------------------------------------------------ */}

                  <Link
                    href={`/admin/${raffle.id}`}
                    className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden h-full"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10 pr-8">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 line-clamp-1">
                        {raffle.name}
                      </h3>
                      <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md whitespace-nowrap">
                        ${raffle.ticketPrice} c/u
                      </span>
                    </div>

                    {raffle.imageUrl && (
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 -mr-4 -mt-4 rounded-full overflow-hidden pointer-events-none">
                        <img
                          src={raffle.imageUrl}
                          className="w-full h-full object-cover"
                          alt="Fondo decorativo"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-bold">
                          Vendidos
                        </p>
                        <p className="text-xl font-black text-gray-900">
                          {sold}{" "}
                          <span className="text-gray-400 text-sm font-normal">
                            / {total}
                          </span>
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-green-600 uppercase font-bold">
                          Recaudado
                        </p>
                        <p className="text-xl font-black text-green-700">
                          ${moneyRaised.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                        <span>Progreso</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
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
