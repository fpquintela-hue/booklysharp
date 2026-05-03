'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    User, 
    CalendarDays, 
    Clock, 
    ChevronRight, 
    ArrowLeft, 
    X, 
    CheckCircle2, 
    Loader2
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

type Step = 'ENTRANCE' | 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'FORM' | 'SUCCESS';

interface BookingPortalV2Props {
    alias: string;
    tenantName?: string;
    services: any[];
    professionals: any[];
    settings?: any;
}

const PALETTES: Record<string, { primary: string; secondary: string; bg: string; text: string }> = {
    'yellow': { primary: '#ca8a04', secondary: '#fef08a', bg: '#fefce8', text: '#422006' }, // darker primary, text
    'blue': { primary: '#1d4ed8', secondary: '#dbeafe', bg: '#eff6ff', text: '#172554' },
    'red': { primary: '#b91c1c', secondary: '#fee2e2', bg: '#fef2f2', text: '#450a0a' },
    'black': { primary: '#0f172a', secondary: '#e2e8f0', bg: '#f8fafc', text: '#020617' },
    'green': { primary: '#15803d', secondary: '#dcfce7', bg: '#f0fdf4', text: '#052e16' },
    'purple': { primary: '#6d28d9', secondary: '#ede9fe', bg: '#f5f3ff', text: '#2e1065' },
};

export function BookingPortalV2({ alias, tenantName, services, professionals, settings }: BookingPortalV2Props) {
    const [step, setStep] = useState<Step>('ENTRANCE');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedProf, setSelectedProf] = useState<any>(null);

    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
    
    const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const paletteName = settings?.portalColorPalette || 'blue';
    const colors = PALETTES[paletteName] || PALETTES['blue'];

    const displayTitle = settings?.appTitle || tenantName;
    const logo = settings?.logoUrl || null;
    const welcomeMessage = settings?.welcomeMessage || `Bienvenido al portal de reservas de ${displayTitle}`;
    const enableProfSelection = settings?.enableProfessionalSelection === 'true';

    const autoSkipProfessional = professionals.length <= 1 || !enableProfSelection;

    const STEPS_DATA = [
        { key: 'SERVICE', label: 'Servicio', icon: <Sparkles size={20} /> },
        ...(autoSkipProfessional ? [] : [{ key: 'PROFESSIONAL', label: 'Profesional', icon: <User size={20} /> }]),
        { key: 'DATETIME', label: 'Fecha y Hora', icon: <CalendarDays size={20} /> },
        { key: 'FORM', label: 'Datos del Paciente', icon: <User size={20} /> },
        { key: 'SUCCESS', label: 'Confirmación', icon: <CheckCircle2 size={20} /> },
    ];

    const currentStepIdx = step === 'ENTRANCE' ? -1 : STEPS_DATA.findIndex(s => s.key === step);

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
                    datetimeISO: absoluteIsoString,
                    professionalId: selectedProf?.id,
                    name: clientInfo.name, 
                    phone: clientInfo.phone, 
                    email: clientInfo.email,
                    notificationPreference: 'EMAIL'
                })
            });
            if (res.ok) { setStep('SUCCESS'); }
            else { const err = await res.json(); toast.error(err.error || 'Error al confirmar'); }
        } catch (e) { toast.error('Error de conexión'); }
        finally { setLoading(false); }
    };

    const dayDisabled = (date: Date) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (date < today) return true;
        const dateStr = format(date, 'yyyy-MM-dd');
        return !availableDays.includes(dateStr);
    };

    // --- Entrance Page ---
    if (step === 'ENTRANCE') {
        return (
            <div className="min-h-screen flex w-full flex-col font-inter text-slate-900" style={{ backgroundColor: colors.bg }}>
                <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-2xl mx-auto w-full">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8 w-full bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                        {logo ? (
                            <img src={logo} alt="Logo" className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-[2rem]" />
                        ) : (
                            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                                <Sparkles size={40} />
                            </div>
                        )}
                        <h1 className="font-manrope text-3xl md:text-5xl font-black tracking-tight" style={{ color: colors.text }}>
                            {displayTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                            {welcomeMessage}
                        </p>
                        <button 
                            onClick={nextStep} 
                            className="mt-6 w-full md:w-auto px-10 py-5 text-white rounded-full font-bold font-manrope text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg"
                            style={{ backgroundColor: colors.primary, boxShadow: `0 10px 25px -5px ${colors.primary}60` }}
                        >
                            Reservar Cita
                        </button>
                    </motion.div>
                </main>
            </div>
        );
    }

    // --- Desktop Sidebar ---
    const DesktopSidebar = () => (
        <nav className="hidden md:flex h-screen w-80 fixed left-0 border-r border-slate-100/50 flex-col gap-2 p-8 z-40 bg-white">
            <div className="mb-12 flex flex-col items-center text-center gap-6">
                {logo ? (
                    <img src={logo} alt="Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-2xl" />
                ) : <h1 className="text-xl font-black font-manrope truncate" style={{ color: colors.text }}>{displayTitle}</h1>}
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-1 font-manrope" style={{ color: colors.text }}>Reserva de Cita</h2>
                    <p className="text-slate-500 text-sm font-inter">Paso {currentStepIdx + 1} de {STEPS_DATA.length}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 flex-grow">
                {STEPS_DATA.map((s, idx) => {
                    const isActive = s.key === step;
                    const isPassed = idx < currentStepIdx;
                    
                    if (isActive) {
                        return (
                            <div key={s.key} className="flex items-center gap-4 font-semibold rounded-full px-6 py-4 shadow-md font-inter text-sm" style={{ backgroundColor: colors.primary, color: 'white' }}>
                                {s.icon}
                                <span>{s.label}</span>
                            </div>
                        );
                    }
                    return (
                        <div key={s.key} className={`flex items-center gap-4 px-6 py-4 font-inter text-sm ${isPassed ? 'font-medium' : 'text-slate-400'}`} style={{ color: isPassed ? colors.text : undefined }}>
                            {isPassed ? <CheckCircle2 size={20} /> : s.icon}
                            <span>{s.label}</span>
                        </div>
                    );
                })}
            </div>
        </nav>
    );

    // --- Mobile Top Nav ---
    const MobileTopNav = () => (
        <header className="md:hidden flex items-center justify-between p-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/50">
            {step !== 'SUCCESS' ? (
                <button onClick={prevStep} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 shadow-sm"><ArrowLeft size={20} /></button>
            ) : <div className="w-10" />}
            
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-manrope">
                    Paso {currentStepIdx + 1} de {STEPS_DATA.length - 1}
                </span>
                <span className="text-sm font-bold font-manrope" style={{ color: colors.text }}>{STEPS_DATA[currentStepIdx]?.label}</span>
            </div>
            
            {step !== 'SUCCESS' ? (
                <button onClick={() => setStep('ENTRANCE')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 shadow-sm"><X size={20} /></button>
            ) : <div className="w-10" />}
        </header>
    );

    return (
        <div className="min-h-screen flex w-full font-inter" style={{ backgroundColor: colors.bg }}>
            <DesktopSidebar />
            
            <main className="w-full md:ml-80 flex flex-col min-h-screen relative">
                {/* Textura sutil de fondo */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23000'/%3E%3C/svg%3E")` }}></div>
                
                <MobileTopNav />

                <div className="flex-1 p-6 md:p-12 lg:p-16 max-w-6xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        
                        {/* DESKTOP BACK BUTTON */}
                        {step !== 'SERVICE' && step !== 'SUCCESS' && (
                            <button 
                                onClick={prevStep} 
                                className="hidden md:inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium font-inter mb-8 transition-colors"
                            >
                                <ArrowLeft size={16} /> Volver
                            </button>
                        )}

                        {/* STEP 1: SERVICE */}
                        {step === 'SERVICE' && (
                            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <header className="mb-8 md:mb-16">
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold tracking-tight leading-tight mb-4" style={{ color: colors.text }}>Servicios</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Seleccione el servicio que requiere para su consulta.
                                    </p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {services.map((s, i) => (
                                        <div 
                                            key={s.id}
                                            onClick={() => { setSelectedService(s); nextStep(); }}
                                            className="bg-white rounded-[1.5rem] p-6 md:p-8 flex flex-col gap-6 relative group cursor-pointer transition-all shadow-sm hover:shadow-xl border-2 border-transparent"
                                            style={selectedService?.id === s.id ? { borderColor: colors.primary, boxShadow: `0 10px 25px -5px ${colors.primary}30` } : {}}
                                        >
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                                                {s.image ? <img src={s.image} alt={s.name} className="w-full h-full rounded-full object-cover" /> : <Sparkles size={28}/>}
                                            </div>
                                            <div>
                                                <h3 className="font-manrope text-lg md:text-xl font-bold mb-2" style={{ color: colors.text }}>{s.name}</h3>
                                                <p className="text-slate-500 text-sm mb-6">{s.description || 'Consulta especializada.'}</p>
                                                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium w-fit" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                                                    <Clock size={16} /> {s.duration} min
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: PROFESSIONAL */}
                        {step === 'PROFESSIONAL' && (
                            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <header className="mb-8 md:mb-16">
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold tracking-tight leading-tight mb-4" style={{ color: colors.text }}>Profesional</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Seleccione al profesional que prefiera, o elija cualquiera para ver toda la disponibilidad.
                                    </p>
                                </header>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    <div 
                                        onClick={() => { setSelectedProf(null); nextStep(); }}
                                        className="bg-white rounded-[1.5rem] p-6 flex items-center gap-6 cursor-pointer transition-colors border-2 shadow-sm hover:shadow-md"
                                        style={selectedProf === null ? { borderColor: colors.primary } : { borderColor: 'transparent' }}
                                    >
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-manrope text-xl font-bold" style={{ color: colors.text }}>Cualquiera</h3>
                                            <p className="text-slate-500 text-sm mt-1">Mayor disponibilidad</p>
                                        </div>
                                    </div>
                                    {professionals.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => { setSelectedProf(p); nextStep(); }}
                                            className="bg-white rounded-[1.5rem] p-6 flex items-center gap-6 cursor-pointer transition-colors border-2 shadow-sm hover:shadow-md"
                                            style={selectedProf?.id === p.id ? { borderColor: colors.primary } : { borderColor: 'transparent' }}
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
                                                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <User size={32} />}
                                            </div>
                                            <div>
                                                <h3 className="font-manrope text-xl font-bold" style={{ color: colors.text }}>{p.name}</h3>
                                                <p className="text-slate-500 text-sm mt-1">{p.description || 'Profesional'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: DATETIME */}
                        {step === 'DATETIME' && (
                            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <header className="mb-8 md:mb-16">
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold tracking-tight leading-tight mb-4" style={{ color: colors.text }}>Fecha y Hora</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Seleccione el momento que mejor se adapte a su agenda.
                                    </p>
                                </header>

                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                                    <div className="flex-1 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(d) => d && setSelectedDate(d)}
                                            onMonthChange={setVisibleMonth}
                                            disabled={dayDisabled}
                                            locale={es}
                                            className="w-full bg-transparent p-0"
                                            classNames={{
                                                months: "w-full",
                                                month: "w-full",
                                                nav: "flex items-center gap-2 absolute top-0 right-0 w-auto justify-end",
                                                button_previous: "w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-transparent border-0 shadow-none hover:bg-slate-50",
                                                button_next: "w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-transparent border-0 shadow-none hover:bg-slate-50",
                                                month_caption: "flex justify-start h-10 mb-8 px-0",
                                                caption_label: "text-2xl font-bold font-manrope capitalize",
                                                table: "w-full border-collapse space-y-1",
                                                weekdays: "flex w-full mb-4",
                                                weekday: "text-slate-400 font-medium text-[11px] uppercase tracking-wider w-full text-center",
                                                week: "flex w-full mt-2",
                                                day: "h-12 w-full text-center text-sm p-0 relative flex items-center justify-center",
                                            }}
                                            components={{
                                                DayButton: (props: any) => {
                                                    const isSelected = props.modifiers?.selected;
                                                    const isOutside = props.modifiers?.outside;
                                                    const isDisabled = props.modifiers?.disabled;
                                                    return (
                                                        <button 
                                                            {...props} 
                                                            className={`h-10 w-10 mx-auto rounded-full font-inter font-medium text-sm transition-all flex items-center justify-center ${
                                                                isSelected 
                                                                    ? 'text-white shadow-lg' 
                                                                    : isDisabled || isOutside 
                                                                        ? 'text-slate-300 hover:bg-transparent cursor-default' 
                                                                        : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                            style={isSelected ? { backgroundColor: colors.primary } : {}}
                                                        />
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className="font-manrope text-xl font-bold mb-6" style={{ color: colors.text }}>Horas Disponibles</h3>
                                        {loadingSlots ? (
                                            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
                                        ) : timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                                {timeSlots.map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => setSelectedTime(t)}
                                                        className={`py-4 rounded-[1rem] font-medium transition-all bg-white border-2`}
                                                        style={selectedTime === t ? { backgroundColor: colors.primary, color: 'white', borderColor: colors.primary } : { color: colors.text, borderColor: 'transparent' }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white p-8 rounded-[1.5rem] text-center border border-slate-100">
                                                <p className="text-slate-500">No hay disponibilidad para esta fecha.</p>
                                            </div>
                                        )}
                                        {selectedTime && (
                                            <button 
                                                onClick={nextStep} 
                                                className="mt-8 w-full md:w-auto px-10 py-4 text-white rounded-full font-bold font-manrope shadow-lg transition-transform hover:scale-105 active:scale-95"
                                                style={{ backgroundColor: colors.primary }}
                                            >
                                                Continuar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: FORM */}
                        {step === 'FORM' && (
                            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <header className="mb-8 md:mb-16">
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold tracking-tight leading-tight mb-4" style={{ color: colors.text }}>Tus Datos</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Complete su información para confirmar la reserva. Todos los campos son obligatorios.
                                    </p>
                                </header>

                                <div className="max-w-2xl bg-white p-8 md:p-12 rounded-[2rem] flex flex-col gap-6 shadow-sm border border-slate-100/50">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold" style={{ color: colors.text }}>Nombre Completo *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={clientInfo.name}
                                            onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                                            className="w-full p-4 rounded-[1rem] bg-slate-50 border border-slate-100 focus:ring-2 focus:border-transparent outline-none transition-all" 
                                            style={{ '--tw-ring-color': colors.primary } as any}
                                            placeholder="Ej. Ana García" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold" style={{ color: colors.text }}>Correo Electrónico *</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={clientInfo.email}
                                            onChange={e => setClientInfo({...clientInfo, email: e.target.value})}
                                            className="w-full p-4 rounded-[1rem] bg-slate-50 border border-slate-100 focus:ring-2 focus:border-transparent outline-none transition-all" 
                                            style={{ '--tw-ring-color': colors.primary } as any}
                                            placeholder="ana@ejemplo.com" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold" style={{ color: colors.text }}>Teléfono *</label>
                                        <input 
                                            type="tel" 
                                            required
                                            value={clientInfo.phone}
                                            onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                                            className="w-full p-4 rounded-[1rem] bg-slate-50 border border-slate-100 focus:ring-2 focus:border-transparent outline-none transition-all" 
                                            style={{ '--tw-ring-color': colors.primary } as any}
                                            placeholder="Ej. 600 000 000" 
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={handleConfirm} 
                                        disabled={loading || !clientInfo.name || !clientInfo.email || !clientInfo.phone}
                                        className="mt-6 w-full py-5 text-white rounded-full font-bold font-manrope text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Cita'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 'SUCCESS' && (
                            <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20">
                                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h1 className="font-manrope text-[3rem] font-bold mb-4" style={{ color: colors.text }}>¡Reserva Confirmada!</h1>
                                <p className="text-lg text-slate-500 max-w-md mb-8">
                                    Hemos enviado los detalles de su cita al correo proporcionado. Le esperamos en {displayTitle}.
                                </p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-4 rounded-full font-bold font-inter text-sm shadow-sm transition-all hover:bg-white border"
                                    style={{ color: colors.primary, borderColor: colors.primary, backgroundColor: colors.bg }}
                                >
                                    Hacer otra reserva
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
