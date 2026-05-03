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
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

type Step = 'ENTRANCE' | 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'FORM' | 'SUCCESS';

interface BookingPortalLuminaProps {
    alias: string;
    tenantName?: string;
    services: any[];
    professionals: any[];
    settings?: any;
}


const LUMINA_PALETTES: Record<string, { primary: string, hover: string, glow: string, rgb: string }> = {
    'yellow': { primary: '#facc15', hover: '#eab308', glow: 'rgba(250, 204, 21, 0.4)', rgb: '250, 204, 21' },
    'blue': { primary: '#3b82f6', hover: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)', rgb: '59, 130, 246' },
    'red': { primary: '#f87171', hover: '#ef4444', glow: 'rgba(248, 113, 113, 0.4)', rgb: '248, 113, 113' },
    'black': { primary: '#f8fafc', hover: '#e2e8f0', glow: 'rgba(248, 250, 252, 0.4)', rgb: '248, 250, 252' },
    'green': { primary: '#4ade80', hover: '#22c55e', glow: 'rgba(74, 222, 128, 0.4)', rgb: '74, 222, 128' },
    'purple': { primary: '#8b5cf6', hover: '#7c3aed', glow: 'rgba(139, 92, 246, 0.4)', rgb: '139, 92, 246' },
};

export function BookingPortalLumina({ alias, tenantName, services, professionals, settings }: BookingPortalLuminaProps) {
    const [step, setStep] = useState<Step>('ENTRANCE');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedProf, setSelectedProf] = useState<any>(null);

    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
    
    const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const displayTitle = settings?.appTitle || tenantName || "Lumina Booking";
    const welcomeMessage = settings?.welcomeMessage || "Experimenta el siguiente nivel en cuidado personal. Precisión, estilo y un ambiente diseñado para ti.";
    const enableProfSelection = settings?.enableProfessionalSelection === 'true';
    const autoSkipProfessional = professionals.length <= 1 || !enableProfSelection;

    const paletteName = settings?.portalColorPalette || 'purple';
    const theme = LUMINA_PALETTES[paletteName] || LUMINA_PALETTES['purple'];
    
    const cssVars = {
        '--lumina-primary': theme.primary,
        '--lumina-hover': theme.hover,
        '--lumina-glow': theme.glow,
        '--lumina-rgb': theme.rgb,
    } as React.CSSProperties;


    useEffect(() => {
        if (visibleMonth && step === 'DATETIME') fetchMonthAvailability(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1);
    }, [visibleMonth, alias, selectedProf, step]);

    useEffect(() => {
        if (selectedDate && step === 'DATETIME') fetchSlots(selectedDate);
    }, [selectedDate, selectedProf, step]);

    const fetchMonthAvailability = async (year: number, month: number) => {
        setLoadingAvailability(true);
        try {
            const profQuery = selectedProf ? `&professionalId=${selectedProf.id}` : '';
            const response = await fetch(`/api/public/month-availability?alias=${alias}&year=${year}&month=${month}${profQuery}`);
            const data = await response.json();
            if (data.availableDates) setAvailableDays(data.availableDates);
        } catch (error) {
            console.error('Error availability:', error);
        } finally {
            setLoadingAvailability(false);
        }
    };

    const fetchSlots = async (date: Date) => {
        setLoadingSlots(true);
        setSelectedTime(null);
        try {
            const profQuery = selectedProf ? `&professionalId=${selectedProf.id}` : '';
            const res = await fetch(`/api/public/availability?alias=${alias}&date=${format(date, 'yyyy-MM-dd')}${profQuery}`);
            if (res.ok) {
                const data = await res.json();
                setTimeSlots(data.availableSlots || []);
            }
        } catch (e) { setTimeSlots([]); }
        finally { setLoadingSlots(false); }
    };

    const nextStep = () => {
        if (step === 'ENTRANCE') setStep('SERVICE');
        else if (step === 'SERVICE') {
            if (autoSkipProfessional) {
                if (professionals.length === 1) setSelectedProf(professionals[0]);
                setStep('DATETIME');
            } else setStep('PROFESSIONAL');
        }
        else if (step === 'PROFESSIONAL') setStep('DATETIME');
        else if (step === 'DATETIME') setStep('FORM');
    };

    const prevStep = () => {
        if (step === 'SERVICE') setStep('ENTRANCE');
        else if (step === 'PROFESSIONAL') setStep('SERVICE');
        else if (step === 'DATETIME') setStep(autoSkipProfessional ? 'SERVICE' : 'PROFESSIONAL');
        else if (step === 'FORM') setStep('DATETIME');
    };

    const handleConfirm = async () => {
        if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) { 
            toast.error('Por favor, completa todos los campos.'); 
            return; 
        }
        setLoading(true);
        try {
            Cookies.set(`bookly_client_${alias}`, JSON.stringify(clientInfo), { expires: 365 });
            const localDateString = `${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}:00`;
            const absoluteIsoString = new Date(localDateString).toISOString();

            const res = await fetch('/api/reservas/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alias, 
                    serviceId: selectedService.id,
                    date: format(selectedDate!, 'yyyy-MM-dd'), 
                    time: selectedTime,
                    datetime: absoluteIsoString,
                    client: clientInfo,
                    professionalId: selectedProf?.id || null
                })
            });
            if (res.ok) {
                const { appointmentId } = await res.json();
                window.location.href = `/${alias}/confirm/${appointmentId}`;
            } else {
                const err = await res.json();
                toast.error(err.error || 'Error al confirmar');
            }
        } catch (error) {
            toast.error('Error de red al confirmar');
        } finally {
            setLoading(false);
        }
    };

    const dayDisabled = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return !availableDays.includes(dateStr);
    };

    const getProgressPercentage = () => {
        if (step === 'SERVICE') return '25%';
        if (step === 'PROFESSIONAL') return '50%';
        if (step === 'DATETIME') return '75%';
        if (step === 'FORM') return '100%';
        return '0%';
    };

    if (step === 'ENTRANCE') {
        return (
            <div style={cssVars} className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col md:flex-row font-inter overflow-hidden">
                <div className="relative w-full md:w-1/2 h-64 md:h-screen hidden md:flex items-center justify-center p-12 bg-[#1e1e1e]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#131313] z-10"></div>
                    {settings?.logoUrl ? (
                        <img alt="Logo" className="w-full h-full max-w-sm max-h-[50vh] object-contain relative z-10" src={settings.logoUrl} />
                    ) : (
                        <div className="w-40 h-40 rounded-full bg-[#131313] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                            <Sparkles size={64} className="text-[var(--lumina-primary)]" />
                        </div>
                    )}
                </div>
                <div className="relative w-full h-64 md:hidden flex items-center justify-center bg-[#1e1e1e] p-8">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent z-10"></div>
                    {settings?.logoUrl ? (
                        <img alt="Logo" className="w-48 h-48 object-contain relative z-10" src={settings.logoUrl} />
                    ) : (
                        <Sparkles size={48} className="text-[var(--lumina-primary)] relative z-10" />
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
        <div style={cssVars} className="bg-[#131313] text-[#e5e2e1] font-inter min-h-screen flex flex-col md:flex-row overflow-x-hidden">
            <header className="md:hidden bg-[#121212]/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 flex justify-between items-center px-6 h-16">
                <button onClick={prevStep} className="text-white/60 hover:text-white">{'<'}</button>
                <div className="text-[var(--lumina-primary)] text-xl font-black tracking-tighter uppercase">{displayTitle}</div>
                <div className="w-6"></div>
            </header>

            <nav className="hidden md:flex flex-col h-screen w-64 border-r border-white/5 shadow-2xl py-8 bg-[#1E1E1E] fixed left-0 top-0 z-40">
                <div className="px-6 mb-8">
                    <button onClick={prevStep} className="text-[#cbc3d7] hover:text-white mb-6 text-sm flex items-center gap-2">
                        {'<'} Volver
                    </button>
                    <h2 className="text-[var(--lumina-primary)] text-2xl font-bold tracking-tighter uppercase">{displayTitle}</h2>
                    <p className="text-[#d0bcff] font-semibold text-xs mt-2">Booking</p>
                </div>
                <div className="px-6 mb-6">
                    <p className="text-[#cbc3d7] font-semibold text-xs mb-1">Paso actual</p>
                    <div className="w-full bg-[#202020] h-1 rounded-full overflow-hidden">
                        <div className="bg-[var(--lumina-primary)] h-full shadow-[0_0_12px_var(--lumina-glow)] transition-all duration-300" style={{ width: getProgressPercentage() }}></div>
                    </div>
                </div>
                <ul className="flex flex-col gap-2 px-2 text-sm font-medium">
                    <li>
                        <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'SERVICE' ? 'bg-[var(--lumina-primary)]/10 text-[var(--lumina-primary)] border-r-2 border-[var(--lumina-primary)]' : 'text-gray-500'}`}>
                            <Sparkles size={18} /> Servicios
                        </div>
                    </li>
                    {!autoSkipProfessional && (
                        <li>
                            <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'PROFESSIONAL' ? 'bg-[var(--lumina-primary)]/10 text-[var(--lumina-primary)] border-r-2 border-[var(--lumina-primary)]' : 'text-gray-500'}`}>
                                <User size={18} /> Profesional
                            </div>
                        </li>
                    )}
                    <li>
                        <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'DATETIME' ? 'bg-[var(--lumina-primary)]/10 text-[var(--lumina-primary)] border-r-2 border-[var(--lumina-primary)]' : 'text-gray-500'}`}>
                            <CalendarDays size={18} /> Horario
                        </div>
                    </li>
                    <li>
                        <div className={`py-3 px-4 flex items-center gap-3 rounded-lg ${step === 'FORM' ? 'bg-[var(--lumina-primary)]/10 text-[var(--lumina-primary)] border-r-2 border-[var(--lumina-primary)]' : 'text-gray-500'}`}>
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
                                    <div key={s.id} onClick={() => { setSelectedService(s); nextStep(); }} className={`bg-[#1E1E1E] border rounded-xl p-6 flex items-center gap-6 relative overflow-hidden transition-all group cursor-pointer ${selectedService?.id === s.id ? 'border-[var(--lumina-primary)]/40 shadow-[0_0_12px_var(--lumina-glow)]' : 'border-white/10 hover:border-[var(--lumina-primary)]/40'}`}>
                                        {selectedService?.id === s.id && <div className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--lumina-rgb),0.1)] to-transparent pointer-events-none"></div>}
                                        <div className="flex-1 z-10">
                                            <h3 className="text-xl font-bold text-[#e5e2e1] mb-1">{s.name}</h3>
                                            <p className="text-sm text-[#cbc3d7] mb-2">{s.description || 'Servicio profesional'}</p>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-[#cbc3d7]">
                                                <span className="flex items-center gap-1">⌚ {s.duration} min</span>
                                                <span className="flex items-center gap-1">💰 {s.price ? `${s.price}€` : 'Consultar'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'PROFESSIONAL' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold text-[#e5e2e1] mb-2">Profesional</h1>
                                <p className="text-lg text-[#cbc3d7]">Seleccione al profesional que prefiera.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div onClick={() => { setSelectedProf(null); nextStep(); }} className={`bg-[#1E1E1E] border rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all ${selectedProf === null ? 'border-[var(--lumina-primary)]/40 shadow-[0_0_12px_var(--lumina-glow)]' : 'border-white/10 hover:border-[var(--lumina-primary)]/40'}`}>
                                    <div className="w-12 h-12 rounded-full bg-[var(--lumina-primary)]/10 text-[var(--lumina-primary)] flex items-center justify-center"><User size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-[#e5e2e1]">Cualquiera</h3>
                                        <p className="text-xs text-[#cbc3d7]">Mayor disponibilidad</p>
                                    </div>
                                </div>
                                {professionals.map(p => (
                                    <div key={p.id} onClick={() => { setSelectedProf(p); nextStep(); }} className={`bg-[#1E1E1E] border rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all ${selectedProf?.id === p.id ? 'border-[var(--lumina-primary)]/40 shadow-[0_0_12px_var(--lumina-glow)]' : 'border-white/10 hover:border-[var(--lumina-primary)]/40'}`}>
                                        <div className="w-12 h-12 rounded-full bg-[#202020] text-slate-400 flex items-center justify-center overflow-hidden border border-white/5">
                                            {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <User size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#e5e2e1]">{p.name}</h3>
                                            <p className="text-xs text-[#cbc3d7]">{p.description || 'Profesional'}</p>
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
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => d && setSelectedDate(d)}
                                        onMonthChange={setVisibleMonth}
                                        disabled={dayDisabled}
                                        locale={es}
                                        className="w-full bg-transparent p-0 text-[#e5e2e1]"
                                        classNames={{
                                            months: "w-full",
                                            month: "w-full",
                                            nav: "flex items-center gap-2",
                                            button_previous: "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#cbc3d7] hover:text-white hover:bg-white/5 transition-colors",
                                            button_next: "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#cbc3d7] hover:text-white hover:bg-white/5 transition-colors",
                                            month_caption: "flex justify-between items-center h-10 mb-4 px-0",
                                            caption_label: "text-xs font-bold text-[#e5e2e1] uppercase tracking-wider capitalize",
                                            table: "w-full border-collapse space-y-1",
                                            weekdays: "flex w-full mb-2",
                                            weekday: "text-[#cbc3d7] font-bold text-[11px] uppercase tracking-wider w-full text-center",
                                            week: "flex w-full mt-1",
                                            day: "h-10 w-full text-center text-sm p-0 relative flex items-center justify-center",
                                        }}
                                        components={{
                                            DayButton: (props: any) => {
                                                const isSelected = props.modifiers?.selected;
                                                const isOutside = props.modifiers?.outside;
                                                const isDisabled = props.modifiers?.disabled;
                                                return (
                                                    <button 
                                                        {...props} 
                                                        className={`h-8 w-8 mx-auto rounded-lg font-inter font-medium text-sm transition-all flex items-center justify-center ${
                                                            isSelected 
                                                                ? 'bg-[var(--lumina-primary)] text-white shadow-[0_0_12px_var(--lumina-glow)]' 
                                                                : isDisabled || isOutside 
                                                                    ? 'text-[#cbc3d7]/30 cursor-not-allowed' 
                                                                    : 'text-[#e5e2e1] hover:bg-[#202020]'
                                                        }`}
                                                    />
                                                );
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col gap-6">
                                    <h3 className="text-xl font-bold text-[#e5e2e1]">Horas Disponibles</h3>
                                    {loadingSlots ? (
                                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--lumina-primary)]" size={24} /></div>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {timeSlots.map(t => (
                                                <button 
                                                    key={t}
                                                    onClick={() => setSelectedTime(t)}
                                                    className={`border rounded-lg py-3 px-4 text-sm transition-all text-center ${selectedTime === t ? 'border-[var(--lumina-primary)] shadow-[0_0_8px_var(--lumina-glow)] bg-[#2a2a2a] text-[#d0bcff]' : 'border-white/10 text-[#cbc3d7] hover:border-[var(--lumina-primary)]/50 hover:text-white bg-[#2a2a2a]'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[#1E1E1E] p-6 rounded-xl text-center border border-white/5">
                                            <p className="text-[#cbc3d7] text-sm">No hay disponibilidad.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'FORM' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold text-[#e5e2e1] mb-2">Tus Datos</h1>
                                <p className="text-lg text-[#cbc3d7]">Completa esta información para finalizar.</p>
                            </div>
                            <div className="space-y-4 bg-[#1E1E1E] p-8 rounded-xl border border-white/10">
                                <div>
                                    <label className="block text-sm font-medium text-[#cbc3d7] mb-2">Nombre completo</label>
                                    <input type="text" value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} className="w-full p-4 rounded-lg bg-[#131313] border border-white/10 text-[#e5e2e1] focus:border-[var(--lumina-primary)] focus:ring-1 focus:ring-[var(--lumina-primary)] outline-none transition-all" placeholder="Ej. María Pérez" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#cbc3d7] mb-2">Correo electrónico</label>
                                    <input type="email" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} className="w-full p-4 rounded-lg bg-[#131313] border border-white/10 text-[#e5e2e1] focus:border-[var(--lumina-primary)] focus:ring-1 focus:ring-[var(--lumina-primary)] outline-none transition-all" placeholder="maria@ejemplo.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#cbc3d7] mb-2">Teléfono</label>
                                    <input type="tel" value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} className="w-full p-4 rounded-lg bg-[#131313] border border-white/10 text-[#e5e2e1] focus:border-[var(--lumina-primary)] focus:ring-1 focus:ring-[var(--lumina-primary)] outline-none transition-all" placeholder="+34 600 000 000" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {selectedService && (
                    <aside className="w-full xl:w-[400px] xl:border-l border-white/5 xl:pl-8 flex flex-col shrink-0">
                        <div className="sticky top-24 bg-[#1E1E1E] border border-white/10 rounded-xl p-6 shadow-2xl">
                            <h2 className="text-xl font-bold text-[#e5e2e1] mb-6 pb-4 border-b border-white/10">Resumen de Reserva</h2>
                            
                            <div className="flex flex-col gap-4 mb-8">
                                <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                                    <div className="w-12 h-12 rounded-lg bg-[#202020] flex items-center justify-center shrink-0 border border-white/5">
                                        <Sparkles className="text-[var(--lumina-primary)]" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-[var(--lumina-primary)] uppercase mb-1">Servicio</p>
                                        <h4 className="text-sm font-medium text-[#e5e2e1]">{selectedService.name}</h4>
                                    </div>
                                    <div className="text-sm font-semibold text-[#e5e2e1]">
                                        {selectedService.price || '0.00'}€
                                    </div>
                                </div>

                                {selectedProf && (
                                    <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--lumina-primary)]/10 flex items-center justify-center shrink-0 text-[var(--lumina-primary)]">
                                            <User size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[var(--lumina-primary)] uppercase mb-1">Profesional</p>
                                            <h4 className="text-sm font-medium text-[#e5e2e1]">{selectedProf.name}</h4>
                                        </div>
                                    </div>
                                )}

                                {(step === 'DATETIME' || step === 'FORM' || step === 'SUCCESS') && selectedTime && (
                                    <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--lumina-primary)]/10 flex items-center justify-center shrink-0">
                                            <CalendarDays className="text-[var(--lumina-primary)]" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[var(--lumina-primary)] uppercase mb-1">Fecha y Hora</p>
                                            <h4 className="text-sm font-medium text-[#e5e2e1]">{selectedDate ? format(selectedDate, 'EEEE, d MMMM', { locale: es }) : ''}</h4>
                                            <p className="text-sm text-[#cbc3d7]">{selectedTime}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex justify-between items-end mb-6">
                                <p className="text-sm text-[#cbc3d7]">Total a Pagar</p>
                                <p className="text-2xl font-bold text-[#e5e2e1]">{selectedService.price || '0.00'}€</p>
                            </div>

                            {step === 'FORM' ? (
                                <button onClick={handleConfirm} disabled={loading} className="w-full bg-[var(--lumina-primary)] hover:bg-[var(--lumina-hover)] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_var(--lumina-glow)] transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Confirmar Cita'}
                                </button>
                            ) : (
                                <button onClick={nextStep} disabled={step === 'DATETIME' && !selectedTime} className="w-full bg-[var(--lumina-primary)] hover:bg-[var(--lumina-hover)] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_var(--lumina-glow)] transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                    Continuar <span className="text-lg">→</span>
                                </button>
                            )}
                        </div>
                    </aside>
                )}
            </main>
        </div>
    );
}
