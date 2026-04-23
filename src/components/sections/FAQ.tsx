'use client';
import { useState } from 'react';
import { ChevronDown, MessageCircle, Calendar, Mail, CreditCard, Sparkles } from 'lucide-react';

const faqs = [
  { 
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    q: "Me da miedo pagar por algo que no sé si me servirá. ¿Puedo probarlo?", 
    a: "Totalmente. Entendemos que cambiar la forma en la que trabajas da vértigo. Por eso tienes un plan 100% Gratis para siempre, sin pedirte tarjeta de crédito. Configura tu perfil en 5 minutos, comparte tu link y comprueba tú mismo cómo empiezan a entrar las reservas. Sin trucos." 
  },
  { 
    icon: <Calendar className="w-5 h-5 text-primary" />,
    q: "Si ya uso Google Calendar, ¿tengo que cambiar mi forma de organizarme?", 
    a: "Para nada, BooklySharp trabaja para ti, no al revés. Tenemos sincronización bidireccional en tiempo real con Google Calendar, Apple y Outlook. Esto significa que si anotas una 'Cita en el dentista' en tu Google Calendar personal, BooklySharp bloqueará ese espacio automáticamente para que ningún cliente pueda reservarte en esa hora." 
  },
  { 
    icon: <MessageCircle className="w-5 h-5 text-primary" />,
    q: "¿Se puede integrar con WhatsApp para avisar a mis clientes?", 
    a: "¡Por supuesto! Sabemos que el correo a veces se ignora, pero un WhatsApp se lee casi al instante. En nuestros planes premium, BooklySharp envía recordatorios automáticos por WhatsApp a tus clientes horas antes de su cita. Es la forma más letal de reducir las cancelaciones de última hora (los famosos 'no-shows') a cero." 
  },
  { 
    icon: <Mail className="w-5 h-5 text-primary" />,
    q: "¿Y qué hay de los emails de confirmación?", 
    a: "Todo automatizado. En el segundo exacto en que un cliente agenda un servicio, recibe un email profesional con todos los detalles de su cita, tu ubicación y la política de cancelación. Tú, por supuesto, también recibes un aviso inmediato en tu bandeja de entrada para que no se te escape nada." 
  },
  { 
    icon: <CreditCard className="w-5 h-5 text-primary" />,
    q: "Otras plataformas cobran comisiones por cada reserva, ¿vosotros también?", 
    a: "Absolutamente no. Somos una herramienta 'low cost' real y transparente. Pagas una cuota mensual fija (que amortizas con la primera cita que salvas de una cancelación) y ya está. No te castigamos por tener éxito: ya tengas 10 o 500 reservas al mes, todo el dinero que generes es íntegramente tuyo." 
  },
  { 
    icon: <ChevronDown className="w-5 h-5 text-primary opacity-0" />, // Espaciador
    q: "¿Tengo que instalar algo en mi ordenador o móvil?", 
    a: "Cero instalaciones. BooklySharp funciona 100% en la nube. Tú accedes a tu panel de control desde el navegador de tu móvil o PC, y tus clientes simplemente hacen clic en el enlace que pongas en tu biografía de Instagram, TikTok o en tu web. Tan fácil como entrar a una página." 
  }
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Resolvemos todas tus dudas para que des el paso hacia la digitalización de tu negocio con total tranquilidad.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open === i ? 'border-primary shadow-md bg-slate-50' : 'border-slate-200 bg-white hover:border-primary/50'}`}
            >
              <button 
                className="w-full px-6 py-5 text-left flex items-start sm:items-center gap-4 focus:outline-none"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="mt-1 sm:mt-0 flex-shrink-0">
                  {faq.icon}
                </div>
                <span className="flex-grow font-semibold text-lg text-slate-900">
                  {faq.q}
                </span>
                <ChevronDown 
                  className={`flex-shrink-0 text-slate-400 transform transition-transform duration-300 mt-1 sm:mt-0 ${open === i ? 'rotate-180 text-primary' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pt-2 pl-[3.25rem] text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
