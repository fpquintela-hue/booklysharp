'use client';
import { useState } from 'react';
import { ChevronDown, MessageCircle, Calendar, Mail, CreditCard, Sparkles, HelpCircle } from 'lucide-react';

const faqs = [
  {
    icon: Sparkles,
    q: 'Me da miedo pagar por algo que no sé si me servirá. ¿Puedo probarlo?',
    a: 'Totalmente. Entendemos que cambiar tu forma de trabajar da vértigo. Por eso tienes un plan 100% gratis para siempre, sin pedirte tarjeta. Configura tu perfil en 5 minutos, comparte tu link y comprueba tú mismo cómo empiezan a entrar las reservas. Sin trucos.',
  },
  {
    icon: Calendar,
    q: 'Si ya uso Google Calendar, ¿tengo que cambiar mi forma de organizarme?',
    a: 'Para nada, BooklySharp trabaja para ti. Tenemos sincronización bidireccional en tiempo real con Google Calendar, Apple y Outlook. Si anotas una "cita en el dentista" en tu calendario personal, BooklySharp bloqueará ese espacio automáticamente para que ningún cliente pueda reservarte a esa hora.',
  },
  {
    icon: MessageCircle,
    q: '¿Se puede integrar con WhatsApp para avisar a mis clientes?',
    a: 'Por supuesto. Sabemos que el correo a veces se ignora, pero un WhatsApp se lee casi al instante. En los planes premium, BooklySharp envía recordatorios automáticos por WhatsApp horas antes de cada cita. Es la forma más eficaz de reducir las cancelaciones de última hora a cero.',
  },
  {
    icon: Mail,
    q: '¿Y qué hay de los emails de confirmación?',
    a: 'Todo automatizado. En el segundo exacto en que un cliente agenda un servicio, recibe un email profesional con todos los detalles, tu ubicación y la política de cancelación. Tú también recibes un aviso inmediato para que no se te escape nada.',
  },
  {
    icon: CreditCard,
    q: 'Otras plataformas cobran comisiones por cada reserva. ¿Vosotros también?',
    a: 'Absolutamente no. Pagas una cuota mensual fija (que amortizas con la primera cita que salvas de una cancelación) y ya está. No te penalizamos por tener éxito: tengas 10 o 500 reservas al mes, todo el dinero que generes es íntegramente tuyo.',
  },
  {
    icon: HelpCircle,
    q: '¿Tengo que instalar algo en mi ordenador o móvil?',
    a: 'Cero instalaciones. BooklySharp funciona 100% en la nube. Accedes a tu panel desde el navegador del móvil o el PC, y tus clientes solo hacen clic en el enlace que pongas en tu biografía de Instagram, TikTok o tu web. Tan fácil como entrar a una página.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Resolvemos tus dudas para que des el paso hacia la digitalización de tu negocio con total tranquilidad.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen ? 'border-[#0c63ce]/40 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  className="flex w-full items-center gap-4 px-6 py-5 text-left focus:outline-none"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0c63ce]/10 text-[#0c63ce]">
                    <faq.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-grow text-lg font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0c63ce]' : ''}`}
                  />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 pl-[4.75rem] leading-relaxed text-slate-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
