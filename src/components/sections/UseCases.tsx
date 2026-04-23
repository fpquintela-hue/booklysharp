'use client';
import { motion } from 'framer-motion';
import { Scissors, HeartPulse, Palette, Dog, Laptop } from 'lucide-react';

const niches = [
  { icon: <Scissors className="w-6 h-6"/>, name: "Peluquerías y Barberías" },
  { icon: <HeartPulse className="w-6 h-6"/>, name: "Psicología y Nutrición" },
  { icon: <Palette className="w-6 h-6"/>, name: "Uñas, Tattoos y Maquillaje" },
  { icon: <Dog className="w-6 h-6"/>, name: "Centros Caninos" },
  { icon: <Laptop className="w-6 h-6"/>, name: "Freelancers y Asesores" },
];

export function UseCases() {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Adaptado a la realidad de tu negocio
        </h2>
        <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
          No importa qué servicio ofrezcas, BooklySharp se adapta a tus reglas, tiempos de reserva y políticas de cancelación.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {niches.map((niche, i) => (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              key={i} 
              className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-6 py-4 rounded-full"
            >
              <span className="text-primary-light">{niche.icon}</span>
              <span className="font-medium">{niche.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
