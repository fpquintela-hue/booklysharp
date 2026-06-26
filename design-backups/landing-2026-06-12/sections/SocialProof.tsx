'use client';

import { motion } from 'framer-motion';

export function SocialProof() {
  return (
    <section className="py-20 bg-slate-900 overflow-hidden relative border-t border-slate-800/50">
      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <p className="text-center text-sm font-semibold text-slate-300 uppercase tracking-widest mb-12">
          ES EL MOTOR DE RESERVAS ELEGIDO POR +2,000 PROFESIONALES DE
        </p>
        
        {/* Infinite scroll carousel effect using Framer Motion */}
        <div className="flex space-x-6 animate-scroll w-max">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex space-x-6 items-center justify-between transition-all duration-300">
              {[
                "Peluquerías", "Barberías", "Centros de Uñas", "Cuidado de la piel",
                "Maquillaje", "Podología", "Masajistas", "Nutricionistas",
                "Terapeutas", "Entrenador personal", "Spa", "Servicios para mascotas",
                "Depilación", "Freelancers"
              ].map((sector) => (
                <div key={sector} className="px-6 py-3 rounded-full bg-slate-800/50 backdrop-blur-sm shadow-sm border border-slate-700/50 text-slate-200 font-medium whitespace-nowrap hover:bg-slate-700/80 hover:border-slate-600 transition-all">
                  {sector}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS For the infite scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1.5rem)); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}} />
    </section>
  );
}
