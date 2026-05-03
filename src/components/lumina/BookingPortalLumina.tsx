'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    User, 
    CalendarDays, 
    CheckCircle2, 
    Loader2
} from 'lucide-react';

type Step = 'ENTRANCE' | 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'FORM' | 'SUCCESS';

interface BookingPortalLuminaProps {
    alias: string;
    tenantName?: string;
    services: any[];
    professionals: any[];
    settings?: any;
}

export function BookingPortalLumina({ alias, tenantName, services, professionals, settings }: BookingPortalLuminaProps) {
    const [step, setStep] = useState<Step>('ENTRANCE');
    const [selectedService, setSelectedService] = useState<any>(null);

    const displayTitle = settings?.appTitle || tenantName || "Lumina Booking";
    const welcomeMessage = settings?.welcomeMessage || "Experimenta el siguiente nivel en cuidado personal. Precisión, estilo y un ambiente diseñado para ti.";

    const nextStep = () => {
        if (step === 'ENTRANCE') setStep('SERVICE');
        else if (step === 'SERVICE') setStep('DATETIME');
        else if (step === 'DATETIME') setStep('FORM');
        else if (step === 'FORM') setStep('SUCCESS');
    };

    if (step === 'ENTRANCE') {
        return (
            <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col md:flex-row font-inter overflow-hidden">
                <div className="relative w-full md:w-1/2 h-64 md:h-screen hidden md:flex items-center justify-center p-12 bg-[#1e1e1e]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#131313] z-10"></div>
                    {settings?.logoUrl ? (
                        <img alt="Logo" className="w-full h-full max-w-sm max-h-[50vh] object-contain relative z-10" src={settings.logoUrl} />
                    ) : (
                        <div className="w-40 h-40 rounded-full bg-[#131313] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                            <Sparkles size={64} className="text-[#8B5CF6]" />
                        </div>
                    )}
                </div>
                <div className="relative w-full h-64 md:hidden flex items-center justify-center bg-[#1e1e1e] p-8">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent z-10"></div>
                    {settings?.logoUrl ? (
                        <img alt="Logo" className="w-48 h-48 object-contain relative z-10" src={settings.logoUrl} />
                    ) : (
                        <Sparkles size={48} className="text-[#8B5CF6] relative z-10" />
                    )}
                </div>
                <div className="w-full md:w-1/2 min-h-[calc(100vh-16rem)] md:h-screen flex flex-col justify-center px-6 md:px-20 py-12 md:py-0 relative z-20">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#d0bcff]/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4cd7f6]/5 rounded-full blur-[80px]"></div>
                    </div>
                    <div className="max-w-md mx-auto w-full relative z-30">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff] font-semibold text-xs tracking-wide mb-6">
                            <span>★</span>
                            PREMIUM SERVICE
                        </div>
                        <h1 className="font-extrabold text-4xl md:text-5xl text-[#e5e2e1] mb-4 tracking-tight leading-tight">
                            Bienvenido a <br />
                            <span className="text-[#d0bcff] bg-clip-text text-transparent bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6]">{displayTitle}</span>
                        </h1>
                        <p className="text-lg text-[#cbc3d7] mb-10 leading-relaxed">
                            {welcomeMessage}
                        </p>
                        <button onClick={nextStep} className="w-full sm:w-auto bg-[#d0bcff] text-[#3c0091] hover:bg-[#a078ff] hover:text-[#340080] transition-all duration-300 rounded-lg px-12 py-3 font-semibold text-sm flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(208,188,255,0.3)] hover:shadow-[0_0_25px_rgba(208,188,255,0.5)] active:scale-[0.98]">
                            <span>Reservar Cita</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#131313] text-[#e5e2e1] font-inter min-h-screen flex flex-col md:flex-row overflow-x-hidden">
            <header className="md:hidden bg-[#121212]/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 flex justify-between items-center px-6 h-16">
                <div className="text-[#8B5CF6] text-xl font-black tracking-tighter uppercase">{displayTitle}</div>
            </header>

            <nav className="hidden md:flex flex-col h-screen w-64 border-r border-white/5 shadow-2xl py-8 bg-[#1E1E1E] fixed left-0 top-0 z-40">
                <div className="px-6 mb-8">
                    <h2 className="text-[#8B5CF6] text-2xl font-bold tracking-tighter uppercase">{displayTitle}</h2>
                    <p className="text-[#d0bcff] font-semibold text-xs mt-2">Booking</p>
                </div>
                <div className="px-6 mb-6">
                    <p className="text-[#cbc3d7] font-semibold text-xs mb-1">Paso {step === 'SERVICE' ? '1' : '2'} de 4</p>
                    <div className="w-full bg-[#202020] h-1 rounded-full overflow-hidden">
                        <div className="bg-[#8B5CF6] h-full shadow-[0_0_12px_rgba(139,92,246,0.4)]" style={{ width: step === 'SERVICE' ? '25%' : '50%' }}></div>
                    </div>
                </div>
                <ul className="flex flex-col gap-2 px-2 text-sm font-medium">
                    <li>
                        <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'SERVICE' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-r-2 border-[#8B5CF6]' : 'text-gray-500'}`}>
                            <Sparkles size={18} /> Servicios
                        </div>
                    </li>
                    <li>
                        <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'DATETIME' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-r-2 border-[#8B5CF6]' : 'text-gray-500'}`}>
                            <CalendarDays size={18} /> Horario
                        </div>
                    </li>
                    <li>
                        <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'FORM' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-r-2 border-[#8B5CF6]' : 'text-gray-500'}`}>
                            <User size={18} /> Datos
                        </div>
                    </li>
                </ul>
            </nav>

            <main className="flex-1 flex flex-col xl:flex-row mt-16 md:mt-0 md:ml-64 p-6 md:p-12 gap-8 max-w-7xl mx-auto w-full">
                <div className="flex-1 flex flex-col max-w-[640px] mx-auto xl:mx-0 w-full">
                    {step === 'SERVICE' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold text-[#e5e2e1] mb-2">Nuestros Servicios</h1>
                                <p className="text-lg text-[#cbc3d7]">Selecciona lo que necesites para continuar.</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                {services.map(s => (
                                    <div key={s.id} onClick={() => { setSelectedService(s); nextStep(); }} className={`bg-[#1E1E1E] border rounded-xl p-6 flex items-center gap-6 relative overflow-hidden transition-all group cursor-pointer ${selectedService?.id === s.id ? 'border-[#8B5CF6]/40' : 'border-white/10 hover:border-[#8B5CF6]/40'}`}>
                                        {selectedService?.id === s.id && <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent pointer-events-none"></div>}
                                        <div className="flex-1 z-10">
                                            <h3 className="text-xl font-bold text-[#e5e2e1] mb-1">{s.name}</h3>
                                            <p className="text-sm text-[#cbc3d7] mb-2">{s.description || 'Servicio profesional'}</p>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-[#cbc3d7]">
                                                <span className="flex items-center gap-1">⌚ {s.duration} min</span>
                                                <span className="flex items-center gap-1">💰 {s.price ? `$${s.price}` : 'Consultar'}</span>
                                            </div>
                                        </div>
                                        <div className="z-10 flex flex-col items-end">
                                            {selectedService?.id === s.id ? (
                                                <button className="bg-[#8B5CF6] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(139,92,246,0.4)]">Seleccionado</button>
                                            ) : (
                                                <button className="border border-white/20 text-[#e5e2e1] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">Seleccionar</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {step === 'DATETIME' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold text-[#e5e2e1] mb-2">Fecha y Hora</h1>
                                <p className="text-lg text-[#cbc3d7]">Seleccione el momento que mejor se adapte a su agenda</p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#1E1E1E] border border-white/10 rounded-xl p-6 flex flex-col gap-6">
                                    <div className="flex justify-between items-center">
                                        <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#cbc3d7] hover:text-white hover:border-white/30 transition-colors">
                                            {'<'}
                                        </button>
                                        <h3 className="text-xs font-bold text-[#e5e2e1] uppercase tracking-wider">Octubre 2023</h3>
                                        <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#cbc3d7] hover:text-white hover:border-white/30 transition-colors">
                                            {'>'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#cbc3d7] mb-2">
                                        <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                        <div className="p-2 text-[#cbc3d7]/30"></div>
                                        <div className="p-2 text-[#e5e2e1] hover:bg-[#202020] cursor-pointer rounded-lg transition-colors">1</div>
                                        <div className="p-2 text-[#e5e2e1] hover:bg-[#202020] cursor-pointer rounded-lg transition-colors">2</div>
                                        <div className="p-2 text-[#e5e2e1] hover:bg-[#202020] cursor-pointer rounded-lg transition-colors">3</div>
                                        <div className="p-2 bg-[#8B5CF6] text-white font-bold rounded-lg cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.4)]">4</div>
                                        <div className="p-2 text-[#e5e2e1] hover:bg-[#202020] cursor-pointer rounded-lg transition-colors">5</div>
                                        <div className="p-2 text-[#e5e2e1] hover:bg-[#202020] cursor-pointer rounded-lg transition-colors">6</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <h3 className="text-xl font-bold text-[#e5e2e1]">Horas Disponibles</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="border border-white/10 rounded-lg py-3 px-4 text-sm text-[#cbc3d7] hover:border-[#8B5CF6]/50 hover:text-white transition-all text-center bg-[#2a2a2a]">
                                            09:00
                                        </button>
                                        <button className="border border-[#8B5CF6] rounded-lg py-3 px-4 text-sm transition-all text-center shadow-[0_0_8px_rgba(139,92,246,0.3)] bg-[#2a2a2a] text-[#d0bcff]">
                                            09:30
                                        </button>
                                        <button className="border border-white/10 rounded-lg py-3 px-4 text-sm text-[#cbc3d7] opacity-50 cursor-not-allowed bg-[#2a2a2a]">
                                            10:00 (Ocupado)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step !== 'SERVICE' && step !== 'DATETIME' && (
                        <div className="py-20 text-center">
                            <h2 className="text-2xl font-bold mb-4">Esta vista se integraría con el workflow V2</h2>
                            <button onClick={() => setStep('DATETIME')} className="text-[#8B5CF6]">Volver a horarios</button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar Summary */}
                {selectedService && step !== 'ENTRANCE' && (
                    <aside className="w-full xl:w-[400px] xl:border-l border-white/5 xl:pl-8 flex flex-col shrink-0">
                        <div className="sticky top-24 bg-[#1E1E1E] border border-white/10 rounded-xl p-6 shadow-2xl">
                            <h2 className="text-xl font-bold text-[#e5e2e1] mb-6 pb-4 border-b border-white/10">Resumen de Reserva</h2>
                            
                            <div className="flex flex-col gap-4 mb-8">
                                <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                                    <div className="w-12 h-12 rounded-lg bg-[#202020] flex items-center justify-center shrink-0 border border-white/5">
                                        <Sparkles className="text-[#8B5CF6]" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-[#8B5CF6] uppercase mb-1">Servicio</p>
                                        <h4 className="text-sm font-medium text-[#e5e2e1]">{selectedService.name}</h4>
                                    </div>
                                    <div className="text-sm font-semibold text-[#e5e2e1]">
                                        ${selectedService.price || '0.00'}
                                    </div>
                                </div>

                                {(step === 'DATETIME' || step === 'FORM' || step === 'SUCCESS') && (
                                    <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                                        <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                                            <CalendarDays className="text-[#8B5CF6]" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[#8B5CF6] uppercase mb-1">Fecha y Hora</p>
                                            <h4 className="text-sm font-medium text-[#e5e2e1]">Jueves, 12 Octubre</h4>
                                            <p className="text-sm text-[#cbc3d7]">09:30 AM</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex justify-between items-end mb-6">
                                <p className="text-sm text-[#cbc3d7]">Total a Pagar</p>
                                <p className="text-2xl font-bold text-[#e5e2e1]">${selectedService.price || '0.00'}</p>
                            </div>

                            <button onClick={nextStep} className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all flex justify-center items-center gap-2">
                                Continuar <span className="text-lg">→</span>
                            </button>
                        </div>
                    </aside>
                )}
            </main>
        </div>
    );
}
