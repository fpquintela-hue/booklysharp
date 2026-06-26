'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, CalendarX, Clock } from 'lucide-react';

const PROBLEMS = [
  {
    icon: MessageCircle,
    title: 'Mensajes a las 11 de la noche',
    body: 'Clientes escribiendo por WhatsApp a deshoras esperando respuesta inmediata para reservar.',
  },
  {
    icon: CalendarX,
    title: 'Los clientes que no aparecen',
    body: 'Ese hueco en la agenda que nadie ocupa y que no puedes cobrar, una y otra vez.',
  },
  {
    icon: Clock,
    title: 'Horas perdidas cuadrando citas',
    body: 'El interminable "¿qué día te viene bien?" que te roba tiempo de atender a quien tienes delante.',
  },
];

export function Problem() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Gestionar la agenda a mano te cuesta dinero y tranquilidad
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Conocemos tu día a día: atiendes a un cliente mientras el teléfono no para de sonar.
            Estos tres problemas se repiten en cada negocio antes de automatizar.
          </p>
        </div>

        <ul className="lg:col-span-7">
          {PROBLEMS.map((problem, i) => (
            <motion.li
              key={problem.title}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-5 border-t border-slate-200 py-7 first:border-t-0 first:pt-0"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0c63ce]/10 text-[#0c63ce]">
                <problem.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{problem.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{problem.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
