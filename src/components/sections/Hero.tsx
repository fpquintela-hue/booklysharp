'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { HeroScrollAnimation } from './hero-animation/HeroScrollAnimation';

// La landing puede scrollear dentro de la ventana O dentro de un contenedor
// con overflow-y-auto (en esta app, el <main> de NavigationWrapper para páginas
// públicas, porque el <body> está en overflow-hidden h-[100dvh]). Buscamos el
// ancestro scrollable real para escuchar SU scroll; si no hay, usamos la ventana.
function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let el = node?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') return el;
    el = el.parentElement;
  }
  return window;
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // Progreso 0 → 1 mientras la sección está "pinneada" (sticky).
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scroller = getScrollParent(section);
    const target: HTMLElement | Window = scroller;
    let raf = 0;

    const compute = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh =
        scroller === window
          ? window.innerHeight
          : (scroller as HTMLElement).clientHeight;
      // Distancia que la sección permanece pinneada (alto total menos un viewport).
      const total = rect.height - vh;
      // Cuánto hemos scrolleado pasada la parte superior de la sección.
      const scrolled = -rect.top;
      const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      setProgress(p);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // El contenido aparece alrededor de la mitad de la animación.
  const t = Math.min(1, Math.max(0, (progress - 0.35) / 0.2));
  const contentOpacity = t;
  const contentY = (1 - t) * 40;

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#f8fafc]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Animación de fondo a pantalla completa */}
        <div className="absolute inset-0 z-0">
          <HeroScrollAnimation progress={progress} />
          {/* Degradado sutil para asegurar legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent pointer-events-none" />
        </div>

        {/* Contenido superpuesto */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div
              style={{
                opacity: contentOpacity,
                transform: `translateY(${contentY}px)`,
              }}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
