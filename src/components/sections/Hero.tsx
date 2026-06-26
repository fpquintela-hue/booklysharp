'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroScrollAnimation } from './hero-animation/HeroScrollAnimation';

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative overflow-hidden bg-white pt-14 md:pt-20">
      {/* Soft brand glow, single hue, subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[#0c63ce]/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(12,99,206,0.05),transparent_55%)]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 md:pb-28 lg:grid-cols-12 lg:gap-8">
        {/* Copy — left aligned, asymmetric */}
        <div className="lg:col-span-6 xl:col-span-5">
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border border-[#0c63ce]/20 bg-[#0c63ce]/5 px-4 py-1.5 text-sm font-semibold text-[#0c63ce]"
          >
            Reservas online sin comisiones
          </motion.span>

          <motion.h1
            {...rise(0.07)}
            className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-6xl"
          >
            Tu agenda se{' '}
            <span className="relative whitespace-nowrap text-[#0c63ce]">
              llena sola
              <svg
                aria-hidden
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 h-3 w-full text-[#0c63ce]/30"
                preserveAspectRatio="none"
              >
                <path d="M2 9 C 80 2, 220 2, 298 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...rise(0.14)}
            className="mt-8 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            La plataforma de reservas para peluquerías, terapeutas y freelancers.
            Cero comisiones, recordatorios automáticos y configuración en 5 minutos.
          </motion.p>

          <motion.div {...rise(0.21)} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="group h-13 rounded-full bg-[#0c63ce] px-8 text-base font-semibold text-white shadow-lg shadow-[#0c63ce]/25 transition-all hover:bg-[#0a52ab] hover:shadow-xl hover:shadow-[#0c63ce]/30 active:scale-[0.98]"
            >
              <Link href="/registro">
                Empieza gratis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="#precios"
              className="text-base font-semibold text-slate-700 underline-offset-4 transition-colors hover:text-[#0c63ce] hover:underline"
            >
              Ver precios
            </Link>
          </motion.div>

          <motion.ul {...rise(0.28)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
            {['Sin tarjeta de crédito', 'Cancela cuando quieras', '0% comisiones'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#0c63ce]" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Real product screenshot — framed, offset for asymmetry */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 lg:col-start-7 xl:col-span-7 xl:col-start-6"
        >
          <div className="relative lg:translate-x-6 xl:translate-x-12">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/50">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="ml-3 truncate text-xs font-medium text-slate-400">
                  booklysharp.com/tu-negocio
                </span>
              </div>
              <HeroScrollAnimation />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
