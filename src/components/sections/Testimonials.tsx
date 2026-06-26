const TESTIMONIALS = [
  {
    name: 'Carlos M.',
    role: 'Dueño de Barbería',
    content: 'Desde que uso BooklySharp, dejé de contestar WhatsApps a las 11 de la noche. Mis clientes reservan solos y yo por fin descanso.',
  },
  {
    name: 'Laura G.',
    role: 'Psicóloga Clínica',
    content: 'El nivel de ausencias bajó drásticamente gracias a los recordatorios. La inversión se paga sola desde la primera semana.',
  },
  {
    name: 'Marta R.',
    role: 'Nail Artist',
    content: 'Súper intuitiva. Configuré mis servicios en 10 minutos y la sincronización con mi Google Calendar funciona de maravilla.',
  },
  {
    name: 'David V.',
    role: 'Tatuador',
    content: 'Antes perdía dinero si alguien me dejaba tirado en una sesión larga. Ahora cobro una señal al reservar y el compromiso del cliente es total.',
  },
  {
    name: 'Elena S.',
    role: 'Fisioterapeuta',
    content: 'Somos tres en la clínica y cruzar horarios era un caos. Ahora cada una tiene su calendario en el móvil y sabemos qué toca sin preguntarnos.',
  },
  {
    name: 'Patricia L.',
    role: 'Centro de Podología',
    content: 'Mis clientes, incluso los más mayores, me dicen lo fácil que es elegir hueco desde el enlace que les paso por WhatsApp.',
  },
];

const AVATAR_TINTS = [
  'bg-[#0c63ce]/10 text-[#0c63ce]',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
];

function initials(name: string) {
  return name.replace(/[^A-Za-zÁÉÍÓÚÑ. ]/g, '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function Testimonials() {
  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Más de 2.000 profesionales ya han soltado la libreta
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Esto es lo que cuentan quienes ya automatizaron su agenda con BooklySharp.
          </p>
        </div>

        <div className="mt-14 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              className="mb-6 break-inside-avoid rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <blockquote className="leading-relaxed text-slate-700">{t.content}</blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVATAR_TINTS[i % AVATAR_TINTS.length]}`}
                >
                  {initials(t.name)}
                </span>
                <span>
                  <span className="block font-bold text-slate-900">{t.name}</span>
                  <span className="block text-sm text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
