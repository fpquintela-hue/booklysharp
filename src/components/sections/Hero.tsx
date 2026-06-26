'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { HeroScrollAnimation } from './hero-animation/HeroScrollAnimation';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  
  // Track scroll progress of the entire section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Fade in the content as we start scrolling
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 0.15], [40, 0]);

  return (
    <section ref={sectionRef} className="relative h-[250vh] bg-[#f8fafc]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Full-screen background animation */}
        <div className="absolute inset-0 z-0">
          <HeroScrollAnimation />
          {/* Optional subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent pointer-events-none" />
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <motion.div 
              style={{ opacity: reduce ? 1 : contentOpacity, y: reduce ? 0 : contentY }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0c63ce]/20 bg-[#0c63ce]/5 px-4 py-1.5 text-sm font-semibold text-[#0c63ce]">
                Reservas online sin comisiones
              </span>

              <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-7xl">
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
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-700 font-medium">
                La plataforma de reservas para peluquerías, terapeutas y freelancers.
                Cero comisiones, recordatorios automáticos y configuración en 5 minutos.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
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
                  className="text-base font-semibold text-slate-800 underline-offset-4 transition-colors hover:text-[#0c63ce] hover:underline"
                >
                  Ver precios
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                {['Sin tarjeta de crédito', 'Cancela cuando quieras', '0% comisiones'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#0c63ce]" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
