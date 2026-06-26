'use client';

const SECTORS = [
  'Peluquerías', 'Barberías', 'Centros de uñas', 'Cuidado de la piel',
  'Maquillaje', 'Podología', 'Masajistas', 'Nutricionistas',
  'Terapeutas', 'Entrenadores personales', 'Spa', 'Servicios para mascotas',
  'Depilación', 'Freelancers',
];

export function SocialProof() {
  return (
    <section className="overflow-hidden border-y border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-base font-semibold text-slate-500">
          El motor de reservas elegido por más de 2.000 profesionales de
        </p>
      </div>

      <div className="relative mt-10">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent md:w-32" />

        <div className="flex w-max gap-4 animate-marquee">
          {[0, 1].map((set) => (
            <div key={set} className="flex shrink-0 gap-4" aria-hidden={set === 1}>
              {SECTORS.map((sector) => (
                <span
                  key={sector}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm"
                >
                  {sector}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 0.5rem)); } }
        .animate-marquee { animation: marquee 45s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-marquee { animation: none; } }
      ` }} />
    </section>
  );
}
