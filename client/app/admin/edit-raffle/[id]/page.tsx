"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditRafflePage() {
  const router = useRouter();
  const params = useParams();
  const raffleId = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    ticketPrice: "",
    totalTickets: "",
    startDate: "",
    endDate: "",
  });

  // 1. Cargar datos existentes
  useEffect(() => {
    const fetchRaffle = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/raffles/${raffleId}`
        );
        if (!res.ok) throw new Error("No se encontró la rifa");

        const data = await res.json();

        // Formatear fechas para el input datetime-local (YYYY-MM-DDTHH:mm)
        const formatForInput = (dateString: string) => {
          return new Date(dateString).toISOString().slice(0, 16);
        };

        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl || "",
          ticketPrice: data.ticketPrice,
          totalTickets: data.totalTickets,
          startDate: formatForInput(data.startDate),
          endDate: formatForInput(data.endDate),
        });
      } catch (error) {
        toast.error("Error al cargar datos");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (raffleId) fetchRaffle();
  }, [raffleId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Guardando cambios...");

    try {
      const token = localStorage.getItem("adminToken");

      const payload = {
        ...formData,
        ticketPrice: Number(formData.ticketPrice),
        totalTickets: Number(formData.totalTickets),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/raffles/${raffleId}`,
        {
          method: "PATCH", // Usamos PATCH para actualizar
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success("¡Rifa actualizada!", { id: toastId });
      router.push("/admin");
    } catch (err) {
      toast.error("Error al guardar cambios", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Editar Rifa ✏️
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Slug (Solo lectura, cambiar URL rompe enlaces viejos) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Slug (URL) -{" "}
              <span className="text-gray-400 font-normal">
                No editable para evitar errores
              </span>
            </label>
            <input
              type="text"
              value={formData.slug}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL Imagen
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Vista previa"
                className="mt-2 h-32 object-cover rounded-lg"
              />
            )}
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
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Precios y Boletos */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio ($)
              </label>
              <input
                type="number"
                name="ticketPrice"
                required
                value={formData.ticketPrice}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Boletos
              </label>
              <input
                type="number"
                name="totalTickets"
                required
                disabled // Cambiar el total de boletos a media rifa es peligroso
                value={formData.totalTickets}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 text-gray-500 px-3 py-2 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                No se puede cambiar el total una vez creada.
              </p>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inicio
              </label>
              <input
                type="datetime-local"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fin
              </label>
              <input
                type="datetime-local"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
