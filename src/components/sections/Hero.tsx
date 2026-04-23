'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center bg-slate-950">
      {/* Background Video & Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-105"
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]"></div>
      </div>

      {/* Decorative Gradients */}
      <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/40 blur-[130px] z-[1] mix-blend-screen overflow-hidden"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[130px] z-[1] mix-blend-screen overflow-hidden"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm mb-8 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>BooklySharp 2.0 ya disponible</span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6 text-balance leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Tu agenda siempre llena. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Tus clientes siempre felices.
          </span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 text-balance"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          La plataforma de reservas online para peluquerías, terapeutas y freelancers que automatiza todo lo demás. Cero comisiones. Configuración en 5 minutos.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button size="lg" variant="accent" className="w-full sm:w-auto group shadow-xl shadow-amber-500/20" asChild>
            <Link href="/registro">
              Empieza gratis hoy
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-slate-600 text-white hover:bg-white/10 hover:text-white">
            Ver demo
          </Button>
        </motion.div>

        <motion.div 
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cancela cuando quieras</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>0% comisiones por reserva</span>
          </div>
        </motion.div>

        {/* DASHBOARD MOCKUP */}
        <motion.div 
          className="w-full max-w-5xl mx-auto mt-20 rounded-2xl md:rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden text-left flex"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 50 }}
        >
          {/* Header OS styling */}
          <div className="absolute top-0 inset-x-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2 z-20">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <div className="ml-4 text-xs font-medium text-slate-400">BooklySharp - Panel de Control</div>
          </div>

          {/* Sidebar */}
          <div className="w-20 hidden md:flex flex-col items-center py-6 pt-16 bg-slate-900/50 border-r border-white/10 z-10 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-8">
              <span className="font-bold">B</span>
            </div>
            <div className="flex flex-col gap-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center opacity-100 shadow-inner border border-white/10">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-hidden flex flex-col pt-10">
            {/* Toolbar */}
            <div className="h-16 px-6 sm:px-8 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-semibold text-white">Calendario General</h3>
                <p className="text-xs text-slate-400">Marzo 2026</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-lg p-1">
                  <div className="px-3 py-1 text-xs font-medium text-white bg-white/10 rounded-md">Semana</div>
                  <div className="px-3 py-1 text-xs font-medium text-slate-400">Mes</div>
                </div>
                <div className="h-8 px-4 bg-primary text-white text-xs font-semibold rounded-lg flex items-center hover:bg-primary-dark cursor-pointer transition-colors shadow-lg shadow-primary/20">
                  + Nueva Cita
                </div>
              </div>
            </div>

            {/* Calendar Grid Representation */}
            <div className="flex-1 p-6 sm:p-8 bg-slate-900/30 overflow-hidden relative">
              <div className="grid grid-cols-5 gap-4 h-full relative z-10">
                {/* Days header */}
                {['Lunes 16', 'Martes 17', 'Miérc 18', 'Jueves 19', 'Viernes 20'].map((day, i) => (
                  <div key={i} className="flex flex-col gap-4 h-full">
                    <div className="text-xs font-medium text-slate-400 text-center pb-2 border-b border-white/5">{day}</div>
                    <div className="flex-1 relative">
                       {/* Mock appointments */}
                       {i === 1 && (
                         <div className="absolute top-4 left-0 right-0 bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm group hover:bg-blue-500/30 transition-colors shadow-lg shadow-blue-900/20">
                           <div className="text-[10px] font-bold text-blue-400 mb-1">10:00 - 11:30</div>
                           <div className="text-xs font-semibold text-white truncate">Corte + Tinte (Ana G.)</div>
                           <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Confirmado
                           </div>
                         </div>
                       )}
                       {i === 2 && (
                         <div className="absolute top-24 left-0 right-0 bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 backdrop-blur-sm group hover:bg-amber-500/30 transition-colors shadow-lg shadow-amber-900/20">
                           <div className="text-[10px] font-bold text-amber-400 mb-1">13:00 - 14:00</div>
                           <div className="text-xs font-semibold text-white truncate">Tratamiento Facial</div>
                           <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span> Pendiente
                           </div>
                         </div>
                       )}
                       {i === 3 && (
                         <div className="absolute top-40 left-0 right-0 bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-3 backdrop-blur-sm group hover:bg-indigo-500/30 transition-colors shadow-lg shadow-indigo-900/20">
                           <div className="text-[10px] font-bold text-indigo-400 mb-1">16:00 - 18:00</div>
                           <div className="text-xs font-semibold text-white truncate">Novia (Prueba)</div>
                           <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Pagado
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Background horizontal lines to simulate hours */}
              <div className="absolute inset-x-6 sm:inset-x-8 top-16 bottom-6 flex flex-col justify-between pointer-events-none opacity-20">
                {[...Array(5)].map((_, i) => (
                   <div key={i} className="border-t border-white/20 w-full relative">
                     <span className="absolute -left-6 -mt-2 text-[8px] text-slate-400">{10 + i * 2}:00</span>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
