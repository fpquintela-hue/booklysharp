'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';

export function CTASection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#0c63ce]/25 blur-[140px]"
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        >
          Deja de ser esclavo de tu agenda
        </motion.h2>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
        >
          Únete a los profesionales independientes que automatizan su negocio y recuperan
          tiempo libre para lo que de verdad importa.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <Button
            size="lg"
            asChild
            className="group h-13 rounded-full bg-[#0c63ce] px-8 text-base font-semibold text-white shadow-xl shadow-[#0c63ce]/30 transition-all hover:bg-[#0a52ab] active:scale-[0.98]"
          >
            <NextLink href="/registro">
              Crear mi cuenta gratis
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NextLink>
          </Button>
          <p className="mt-6 text-sm text-slate-400">
            Prueba sin compromiso. No se requiere tarjeta de crédito.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
