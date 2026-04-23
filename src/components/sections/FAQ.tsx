'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "¿Tengo que instalar algo?", a: "No, BooklySharp funciona 100% en la nube. Tus clientes acceden a través de un enlace web desde cualquier dispositivo." },
  { q: "¿Me cobráis comisiones por las reservas o pagos?", a: "No. Solo pagas tu cuota mensual. Si decides usar Stripe para cobrar adelantos, ellos aplicarán su tarifa estándar de pasarela de pago, pero nosotros no nos quedamos nada." },
  { q: "¿Puedo cancelar en cualquier momento?", a: "Sí, sin compromisos ni letra pequeña. Puedes cancelar tu suscripción con un solo clic desde tu panel de control." },
  { q: "¿Mis clientes mayores sabrán usarlo?", a: "Hemos diseñado la interfaz de reserva para que sea tan fácil como mandar un WhatsApp. Solo eligen servicio, día, hora y ponen su nombre." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left flex justify-between items-center font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {faq.q}
                <ChevronDown className={`transform transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 py-4 bg-white text-slate-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
