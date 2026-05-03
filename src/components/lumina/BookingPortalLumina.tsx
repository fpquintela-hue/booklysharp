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
                <div className="relative w-full md:w-1/2 h-64 md:h-screen hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#131313]/90 z-10"></div>
                    <img alt="High-end salon interior" className="absolute w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida/ADBb0uhfaA_c7KK7OpDH6N6cl9mM8OJZeZyXMmXk05ZwkouwkKrj2FS9MKnVd5WivDcQZ_wEEblh4lnaRv1nSAhpAnfhUpBUahXBfn3574Tg3n3mto19B9jjkMWScaR9TACFFzPgOoKrTsnmtyfl694hueieKo147EjD41kGZnIT8G4d1IXRVqlXbPi2-v0c8g1PTHAbe2v_umVWapMEG8oV5BEMCdnuO-XPhKbO9rwc3VyEDGKDJM3xE1Fa_6Qk4sVt3hoinNbwLBWYC8o" />
                </div>
                <div className="relative w-full h-64 md:hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent z-10"></div>
                    <img alt="High-end salon interior mobile" className="absolute w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida/ADBb0ug4LT6ZKPn6fgy5WmmxY63ppLHVMLh8F_sT1O2p9JN2v9GLRtscDXxRm5RhU5af89xNcFMSIJVH_IAbiZWEv4kxS9mjxNJs0bdzCwr3dzkFHgmYBSwVxyeKH1Vj_Ye3Ad8spesQt3-71bollkqS8tPbsr_R3yh5dSLLK5exOx_lrRMvIWffdtUeCtRgJWVjmSY1EXGkvGPwXWEPX2HmHudqqvxdgizxKIUBk8nMhU7lW7M5rPi6W6rWPJ-satU-DYRnFQrsCvdDm_A" />
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
                    
                    {step !== 'SERVICE' && (
                        <div className="py-20 text-center">
                            <h2 className="text-2xl font-bold mb-4">Esta vista de pasos posteriores se integraría igual que en la V2</h2>
                            <button onClick={() => setStep('SERVICE')} className="text-[#8B5CF6]">Volver a servicios</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
