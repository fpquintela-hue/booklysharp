'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, CalendarSync, ShieldCheck, Smartphone, SmartphoneNfc, Zap, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: 'Facilidad Radical',
    description: 'Tan intuitiva que no necesitas manual. Configura tus servicios y horarios en 5 minutos y empieza a recibir reservas hoy mismo.',
    image: '/assets/semana.png'
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
    title: 'Estadísticas Avanzadas',
    description: 'Toma el control absoluto de tu negocio. Visualiza la evolución de tus reservas, analiza tus ganancias y mide tu rendimiento diario con gráficas claras para tomar decisiones basadas en datos reales.',
    image: '/assets/estadistica.png'
  },
  {
    icon: <CalendarSync className="w-6 h-6 text-[#0c63ce]" />,
    title: 'Sincronización Total',
    description: 'Conecta con Google Calendar, Apple y Outlook. Olvídate de citas duplicadas y solapamientos embarazosos.',
    image: '/assets/sincronizacion.png'
  },
  {
    icon: <Bot className="w-6 h-6 text-indigo-500" />,
    title: 'Asistente Inteligente',
    description: 'Envía recordatorios automáticos por email y WhatsApp. Reduce tus "no-shows" (ausencias) hasta un 90%.',
    image: '/assets/asistente.png'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    title: 'Seguridad de Grado Bancario',
    description: 'Cumplimos con RGPD. Tus datos y los de tus clientes están encriptados y protegidos con los máximos estándares.',
    image: '/assets/seguridad.png'
  },
  {
    icon: <Smartphone className="w-6 h-6 text-pink-500" />,
    title: 'Tu agenda, en tu bolsillo',
    description: 'Gestión completa desde el móvil. Aplicaciones nativas fluidas para iOS y Android.',
    image: '/assets/agenda_movil.png'
  },
  {
    icon: <SmartphoneNfc className="w-6 h-6 text-cyan-500" />,
    title: 'Pagos Integrados',
    description: 'Cobra fianzas por adelantado mediante Stripe o PayPal y despídete de perder dinero por cancelaciones de última hora.'
  }
];

export function Features() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    // Autoplay implementation
    const autoScrollTimer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // if reached the end, reset to 0
        if (scrollLeft >= scrollWidth - clientWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // scroll forward by one feature card width (approx 350+24 gap)
          scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => {
      window.removeEventListener('resize', checkScroll);
      clearInterval(autoScrollTimer);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <section id="funciones" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-3xl">
            <motion.h2 
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 text-balance"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Por qué Booklysharp es la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0c63ce] to-indigo-600">única herramienta</span> de reservas que necesitarás
            </motion.h2>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#0c63ce] hover:border-[#0c63ce] hover:bg-blue-50 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:hover:bg-white transition-all shadow-sm"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#0c63ce] hover:border-[#0c63ce] hover:bg-blue-50 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:hover:bg-white transition-all shadow-sm"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full relative px-4 md:px-6">
        {/* Gradients to indicate scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
        
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-12 pt-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Spacer for initial margin alignment with container */}
          <div className="w-[calc((100vw-min(100vw,1536px))/2)] md:w-[calc((100vw-min(100vw,1536px)+24px)/2)] shrink-0 snap-start hidden 2xl:block"></div>
          <div className="w-0 md:w-2 shrink-0 snap-start 2xl:hidden"></div>

          {features.map((feature, i) => (
            <motion.div
              key={i}
              className={`shrink-0 snap-center rounded-[2rem] border border-slate-200/60 bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 group flex overflow-hidden min-h-[420px] md:min-h-[520px] ${
                feature.image 
                  ? 'w-[320px] md:w-[850px] flex-col md:flex-row' 
                  : 'w-[280px] md:w-[380px] flex-col p-8 md:p-10'
              }`}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {feature.image ? (
                <>
                  <div className="p-8 md:p-12 md:w-[40%] flex flex-col justify-center bg-white z-10 shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                  <div className="relative w-full md:w-[60%] min-h-[250px] md:min-h-full bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 overflow-hidden">
                    <Image 
                      src={feature.image} 
                      alt={feature.title} 
                      fill
                      className="object-cover object-left-top md:object-left p-4 md:p-8 transform group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </>
              )}
            </motion.div>
          ))}
          
          {/* End spacer */}
          <div className="w-4 md:w-12 shrink-0 snap-end"></div>
        </div>
      </div>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
