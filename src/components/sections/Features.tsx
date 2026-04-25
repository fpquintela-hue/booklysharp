'use client';

import { motion } from 'framer-motion';
import { Bot, CalendarSync, ShieldCheck, Smartphone, SmartphoneNfc, Zap } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: 'Facilidad Radical',
    description: 'Tan intuitiva que no necesitas manual. Configura tus servicios y horarios en 5 minutos y empieza a recibir reservas hoy mismo.'
  },
  {
    icon: <CalendarSync className="w-6 h-6 text-primary" />,
    title: 'Sincronización Total',
    description: 'Conecta con Google Calendar, Apple y Outlook. Olvídate de citas duplicadas y solapamientos embarazosos.'
  },
  {
    icon: <Bot className="w-6 h-6 text-indigo-500" />,
    title: 'Asistente Inteligente',
    description: 'Envía recordatorios automáticos por SMS y WhatsApp. Reduce tus "no-shows" (ausencias) hasta un 90%.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    title: 'Seguridad de Grado Bancario',
    description: 'Cumplimos con RGPD. Tus datos y los de tus clientes están encriptados y protegidos con los máximos estándares.'
  },
  {
    icon: <Smartphone className="w-6 h-6 text-pink-500" />,
    title: 'Tu agenda, en tu bolsillo',
    description: 'Gestión completa desde el móvil. Aplicaciones nativas fluidas para iOS y Android.'
  },
  {
    icon: <SmartphoneNfc className="w-6 h-6 text-cyan-500" />,
    title: 'Pagos Integrados',
    description: 'Cobra fianzas por adelantado mediante Stripe o PayPal y despídete de perder dinero por cancelaciones de última hora.'
  }
];

export function Features() {
  return (
    <section id="funciones" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Por qué Booklysharp es la <span className="text-[#0c63ce]">única herramienta</span> de reservas que necesitarás
          </motion.h2>
          <motion.p 
            className="text-lg text-slate-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Sustituye a tus hojas de cálculo, a las libretas de papel y a las notas de voz de WhatsApp a las 11 de la noche.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
