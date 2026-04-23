'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';

export function CTASection() {
  return (
    <section className="relative py-24 bg-slate-900 overflow-hidden">
      {/* Decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] mix-blend-screen" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center border border-slate-800 bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-16 shadow-2xl">
          <motion.h2 
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Deja de ser esclavo de tu agenda
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Únete a la nueva generación de profesionales independientes que automatizan su negocio y ganan tiempo libre para hacer lo que realmente importa.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" variant="accent" className="group shadow-xl shadow-amber-500/20" asChild>
              <NextLink href="/registro">
                Crear mi cuenta gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </NextLink>
            </Button>
            <p className="mt-6 text-sm text-slate-400">
              Prueba de 14 días sin compromiso. No se requiere tarjeta de crédito.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
