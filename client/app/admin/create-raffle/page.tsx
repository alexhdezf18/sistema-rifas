"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // <--- NUEVO
import { toast } from "sonner";

export default function CreateRaffle() {
  const router = useRouter();
  const { data: session, status } = useSession(); // <--- NUEVO
  const [loading, setLoading] = useState(false);

  // Protección de ruta
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Convertir fechas a ISO-8601
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      ticketPrice: Number(formData.get("ticketPrice")),
      totalTickets: Number(formData.get("totalTickets")),
      imageUrl: formData.get("imageUrl"),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    // @ts-ignore
    const token = session?.accessToken; // <--- USAMOS EL TOKEN DE SESIÓN

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <--- AUTH HEADER
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("¡Rifa creada con éxito!");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error("Error al crear la rifa");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading")
    return <p className="p-10 text-center">Verificando permisos...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">✨ Nueva Rifa</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Premio
            </label>
            <input
              name="name"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: iPhone 15 Pro Max"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL de la Imagen
            </label>
            <input
              name="imageUrl"
              type="url"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://imgur.com/..."
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles del premio..."
            />
          </div>

          {/* Precios y Boletos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio Boleto ($)
              </label>
              <input
                name="ticketPrice"
                type="number"
                required
                min="1"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Boletos
              </label>
              <input
                name="totalTickets"
                type="number"
                required
                min="10"
                max="1000"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Inicio
              </label>
              <input
                name="startDate"
                type="datetime-local"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Fin
              </label>
              <input
                name="endDate"
                type="datetime-local"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creando..." : "Lanzar Rifa 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
