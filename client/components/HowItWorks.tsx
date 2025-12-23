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
    <div className="bg-gray-50 py-16 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            ¿Cómo participar?
          </h2>
          <p className="mt-4 text-gray-500">
            Es tan fácil como contar hasta tres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-6">{step.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
