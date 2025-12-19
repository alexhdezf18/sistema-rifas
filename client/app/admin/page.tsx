"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Tipo simple para la lista
interface Raffle {
  id: string;
  name: string;
  slug: string;
  totalTickets: number;
  ticketPrice: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar token
    const token = localStorage.getItem("adminToken"); // Usamos adminToken como en tu otro archivo
    if (!token) {
      router.push("/login");
      return;
    }

    fetchRaffles(token);
  }, [router]);

  const fetchRaffles = async (token: string) => {
    try {
      // OJO: Asegúrate de que tu backend tenga un endpoint GET /raffles público o protegido
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

  if (loading)
    return <div className="p-10 flex justify-center">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Rifas</h1>
            <p className="text-gray-500">
              Selecciona una rifa para gestionar sus boletos.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="text-red-500 font-medium hover:underline"
            >
              Salir
            </button>
            <Link
              href="/admin/create-raffle"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow transition-colors flex items-center gap-2"
            >
              + Nueva Rifa
            </Link>
          </div>
        </div>

        {/* Grid de Rifas */}
        {raffles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg mb-4">
              No tienes ninguna rifa activa.
            </p>
            <Link
              href="/admin/create-raffle"
              className="text-blue-600 font-bold hover:underline"
            >
              ¡Crea la primera aquí!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <Link
                key={raffle.id}
                href={`/admin/${raffle.id}`} // <--- ESTO CONECTA CON TU CÓDIGO ACTUAL
                className="group block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">
                    {raffle.name}
                  </h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    Activa
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>💰 ${raffle.ticketPrice} por boleto</p>
                  <p>🎟️ {raffle.totalTickets} boletos totales</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-blue-600 font-semibold text-sm flex justify-end group-hover:translate-x-1 transition-transform">
                  Gestionar Boletos &rarr;
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
