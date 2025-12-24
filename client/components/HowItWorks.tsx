export default function HowItWorks() {
  const steps = [
    {
      emoji: "🎟️",
      title: "1. Elige tu Boleto",
      desc: "Busca entre los sorteos activos y selecciona tu número de la suerte o usa el generador al azar.",
    },
    {
      emoji: "💬",
      title: "2. Confirma por WhatsApp",
      desc: "Llena tus datos y envía el mensaje automático para coordinar el pago de forma segura.",
    },
    {
      emoji: "🏆",
      title: "3. ¡Gana!",
      desc: "Sigue la transmisión en vivo en la fecha indicada. ¡Si sale tu número, el premio es tuyo!",
    },
  ];

  return (
    // 1. Contenedor principal: bg-gray-50 (claro) -> dark:bg-gray-900 (oscuro)
    // Agregamos transition-colors para que el cambio sea suave
    <div className="bg-gray-50 dark:bg-gray-900 py-16 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* 2. Título principal: text-gray-900 -> dark:text-white */}
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            ¿Cómo participar?
          </h2>
          {/* Subtítulo: text-gray-500 -> dark:text-gray-400 (para que se lea bien sobre negro) */}
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Es tan fácil como contar hasta tres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              // 3. Tarjetas: bg-white -> dark:bg-gray-800 (gris oscuro para resaltar sobre el fondo negro)
              // Bordes: dark:border-gray-700
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
            >
              <div className="text-5xl mb-6">{step.emoji}</div>
              {/* Título de la tarjeta */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              {/* Descripción de la tarjeta */}
              <p className="text-gray-500 dark:text-gray-300 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
