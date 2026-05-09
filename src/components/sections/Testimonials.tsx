import { User } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "Carlos M.",
    role: "Dueño de Barbería",
    content: "Desde que uso BooklySharp, dejé de contestar WhatsApps a las 11 de la noche. Mis clientes reservan solos y yo por fin descanso.",
    gender: "male"
  },
  {
    name: "Laura G.",
    role: "Psicóloga Clínica",
    content: "El nivel de ausencias bajó drásticamente gracias a los recordatorios. La inversión se paga sola desde la primera semana.",
    gender: "female"
  },
  {
    name: "Marta R.",
    role: "Nail Artist",
    content: "Súper intuitiva. Configuré mis servicios en 10 minutos y la sincronización con mi Google Calendar funciona como por arte de magia.",
    gender: "female"
  },
  {
    name: "David V.",
    role: "Tatuador",
    content: "Antes perdía mucho dinero si alguien me dejaba tirado en una sesión larga. Ahora cobro una señal por adelantado al reservar y el compromiso del cliente es total. Una tranquilidad brutal.",
    gender: "male"
  },
  {
    name: "Elena S.",
    role: "Fisioterapeuta",
    content: "Somos tres en la clínica y antes era un caos cruzar los horarios de todas. Ahora cada una tiene su calendario en el móvil y sabemos exactamente qué toca hacer sin preguntarnos.",
    gender: "female"
  },
  {
    name: "Patricia L.",
    role: "Centro de Podología",
    content: "Mis clientes, incluso los más mayores, me dicen lo fácil que es elegir hueco desde el enlace que les paso por WhatsApp. La mejor decisión que he tomado para mi centro.",
    gender: "female"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Más de 2.000 profesionales ya han soltado la libreta
          </h2>
          <div className="w-24 h-1 bg-[#748AFA] mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {TESTIMONIALS.map((testimonial, i) => (
            <div 
              key={i} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-[#748AFA]/50 transition-colors"
            >
              <p className="text-slate-300 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                  <User className="w-6 h-6 text-[#748AFA]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
