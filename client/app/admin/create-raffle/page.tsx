"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRafflePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      setFormData((prev) => ({ ...prev, name: value, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const payload = {
        ...formData,
        ticketPrice: Number(formData.ticketPrice),
        totalTickets: Number(formData.totalTickets),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/raffles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la rifa");
      }

      alert("¡Rifa creada con éxito!");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Nueva Rifa 📸</h2>
          <p className="text-gray-500 mt-2">
            Completa los detalles para lanzar una nueva rifa.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la Rifa
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
                placeholder="Ej. iPhone 15 Pro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* URL de Imagen (NUEVA SECCIÓN) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL de la Imagen (Opcional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
              placeholder="https://i.imgur.com/..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Pega aquí el link directo de la imagen (debe terminar en .jpg,
              .png, etc.)
            </p>

            {/* PREVISUALIZACIÓN DE LA IMAGEN */}
            {formData.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={formData.imageUrl}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")} // Si falla el link, se oculta
                  />
                </div>
              </div>
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
              placeholder="Detalles del premio..."
            />
          </div>

          {/* Precios y Boletos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio por Boleto ($)
              </label>
              <input
                type="number"
                name="ticketPrice"
                required
                min="1"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total de Boletos
              </label>
              <input
                type="number"
                name="totalTickets"
                required
                min="10"
                value={formData.totalTickets}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Fin
              </label>
              <input
                type="datetime-local"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 outline-none"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Guardando..." : "Crear Rifa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
