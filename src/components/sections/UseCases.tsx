'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Scissors, HeartPulse, Palette, Dog, Laptop } from 'lucide-react';

const NICHES = [
  { icon: Scissors, name: 'Peluquerías y Barberías' },
  { icon: HeartPulse, name: 'Psicología y Nutrición' },
  { icon: Palette, name: 'Uñas, Tattoos y Maquillaje' },
  { icon: Dog, name: 'Centros Caninos' },
  { icon: Laptop, name: 'Freelancers y Asesores' },
];

export function UseCases() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 md:py-32">
      {/* Vídeo de fondo (decorativo). Se pausa con prefers-reduced-motion. */}
      <video
        autoPlay={!reduce}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src="/assets/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Capas de oscurecimiento para legibilidad */}
      <div aria-hidden className="absolute inset-0 bg-slate-950/80" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0c63ce]/20 blur-[150px]"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Se adapta a la realidad de tu negocio
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          No importa qué servicio ofrezcas: BooklySharp se ajusta a tus reglas, tiempos de
          reserva y políticas de cancelación.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {NICHES.map((niche, i) => (
            <motion.div
              key={niche.name}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { y: -3 }}
              className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-6 py-3.5 shadow-lg backdrop-blur-md"
            >
              <span className="text-[#7aa7ee]">
                <niche.icon className="h-5 w-5" />
              </span>
              <span className="font-semibold text-white">{niche.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
