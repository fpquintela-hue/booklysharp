/* 
   =========================================================
   BOOKING PORTAL: Clinical Ethereal High-Fidelity
   =========================================================
*/
'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Clock,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    User,
    AtSign,
    Phone,
    Sparkles,
    MessageCircle,
    Mail,
    Loader2,
    RefreshCw,
    Search,
    ArrowRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

type Step = 'SERVICE' | 'PROFESSIONAL' | 'DATE' | 'TIME' | 'FORM' | 'SUCCESS';

interface BookingPortalProps {
    alias: string;
    tenantName?: string;
    services: any[];
    professionals: any[];
    settings?: any;
}

const STEPS_DATA = [
    { key: 'SERVICE', label: 'Selecciona Servicio' },
    { key: 'PROFESSIONAL', label: 'Elige Profesional' },
    { key: 'DATE', label: 'Selecciona Fecha' },
    { key: 'TIME', label: 'Selecciona Hora' },
    { key: 'FORM', label: 'Tus Detalles' },
    { key: 'SUCCESS', label: 'Confirmación' },
];

export function BookingPortal({ alias, tenantName, services: initialServices, professionals, settings }: BookingPortalProps) {
    const [step, setStep] = useState<Step>('SERVICE');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<{ id: string, name: string, description?: string } | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [slotDetails, setSlotDetails] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [countryCode, setCountryCode] = useState('+34');
    const [phoneRest, setPhoneRest] = useState('');
    const [clientInfo, setClientInfo] = useState({ name: '', email: '', notificationPreference: 'WHATSAPP' });
    const [loading, setLoading] = useState(false);
    
    const { t } = useTranslation();

    const autoSkipProfessional = professionals.length === 1 || settings?.enableProfessionalSelection === 'false';

    // Stepper labels matching user request exactly
    const activeSteps = autoSkipProfessional
        ? STEPS_DATA.filter(s => s.key !== 'PROFESSIONAL')
        : STEPS_DATA;

    const currentStepIdx = activeSteps.findIndex(x => x.key === step);

    useEffect(() => {
        if (visibleMonth) fetchMonthAvailability(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1);
    }, [visibleMonth, alias, selectedProfessional]);

    const fetchMonthAvailability = async (year: number, month: number) => {
        setLoadingAvailability(true);
        try {
            const profQuery = selectedProfessional ? `&professionalId=${selectedProfessional.id}` : '';
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
        try {
            const profQuery = selectedProfessional ? `&professionalId=${selectedProfessional.id}` : '';
            const res = await fetch(`/api/public/availability?alias=${alias}&date=${format(date, 'yyyy-MM-dd')}${profQuery}`);
            if (res.ok) {
                const data = await res.json();
                setTimeSlots(data.availableSlots || []);
                setSlotDetails(data.slotDetails || []);
            }
        } catch (e) { setTimeSlots([]); }
        finally { setLoadingSlots(false); }
    };

    const handleConfirm = async () => {
        if (!clientInfo.name) { toast.error('Por favor, indica tu nombre.'); return; }
        setLoading(true);
        const fullPhone = countryCode + phoneRest;
        try {
            Cookies.set(`bookly_client_${alias}`, JSON.stringify({ ...clientInfo, phone: fullPhone }), { expires: 365 });
            // Combine date and time locally to generate an absolute UTC ISO string correctly
            const localDateString = `${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}:00`;
            const absoluteIsoString = new Date(localDateString).toISOString();

            const res = await fetch('/api/reservas/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alias, serviceId: selectedService.id,
                    date: format(selectedDate!, 'yyyy-MM-dd'), time: selectedTime,
                    datetimeISO: absoluteIsoString,
                    professionalId: selectedProfessional?.id,
                    name: clientInfo.name, phone: fullPhone, email: clientInfo.email,
                    notificationPreference: clientInfo.notificationPreference
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



    // Navigation Utils
    const nextStep = () => {
        if (step === 'SERVICE') {
            if (autoSkipProfessional) {
                if (!selectedProfessional && professionals.length > 0) {
                    setSelectedProfessional(professionals[0]);
                }
                setStep('DATE');
            } else {
                setStep('PROFESSIONAL');
            }
        }
        else if (step === 'PROFESSIONAL') setStep('DATE');
        else if (step === 'DATE') setStep('TIME');
        else if (step === 'TIME') setStep('FORM');
    };

    const prevStep = () => {
        if (step === 'PROFESSIONAL') setStep('SERVICE');
        else if (step === 'DATE') setStep(autoSkipProfessional ? 'SERVICE' : 'PROFESSIONAL');
        else if (step === 'TIME') setStep('DATE');
        else if (step === 'FORM') setStep('TIME');
    };

    const isNextDisabled = () => {
        if (step === 'SERVICE') return !selectedService;
        if (step === 'PROFESSIONAL') return false; // Any is default
        if (step === 'DATE') return !selectedDate;
        if (step === 'TIME') return !selectedTime;
        if (step === 'FORM') return !clientInfo.name;
        return true;
    };

    return (
        <div className="ce-root bg-white md:bg-[#F8FAFC] min-h-screen md:min-h-0 flex flex-col font-inter">
            {/* --- MOBILE TOP NAVIGATION (Stitch Design) --- */}
            <nav className="md:hidden flex items-center justify-center p-2 sticky top-0 z-50 bg-slate-100 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-manrope">
                    {step === 'SUCCESS' ? 'COMPLETADO' : `PASO ${currentStepIdx + 1} DE ${activeSteps.length}`}
                </span>
            </nav>

            {/* 1. Top Breadcrumb Stepper (Desktop Only) */}
            <nav className="ce-stepper-wrap hidden md:flex">
                <div className="ce-stepper">
                    {activeSteps.map((s, idx) => {
                        const currentStepIdx = activeSteps.findIndex(x => x.key === step);
                        const isPassed = idx < currentStepIdx;
                        const isActive = idx === currentStepIdx;
                        return (
                            <div key={s.key} className={`ce-step-crumb ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}>
                                <div className="ce-step-circle">{isPassed ? <CheckCircle2 size={14} /> : idx + 1}</div>
                                <span className="ce-step-text">{s.label}</span>
                                {idx < activeSteps.length - 1 && <span className="ce-step-sep">/</span>}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* 2. Main Portal Card */}
            <main className="ce-page flex-1 md:flex-none">
                <div className="ce-portal md:shadow-xl md:rounded-2xl md:bg-white md:border border-slate-100 p-0 md:p-8">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: SERVICE */}
                        {step === 'SERVICE' && (
                            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-0">
                                <header className="ce-section-header mb-8 md:mb-8 text-center md:text-left hidden md:block">
                                    <h2 className="ce-section-title text-[40px] md:text-3xl leading-tight font-bold text-[#001c3b] font-manrope">{t('booking.step1_title')}</h2>
                                    <p className="ce-section-subtitle text-lg md:text-sm text-slate-600 mt-4 md:mt-2 max-w-[280px] md:max-w-none mx-auto">{t('booking.step1_subtitle')}</p>
                                </header>
                                <div className="ce-list-grid grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 pb-24 md:pb-0">
                                    {initialServices.map(s => (
                                        <button 
                                            key={s.id} 
                                            className={`ce-card-editorial bg-white p-6 md:p-4 flex flex-row items-center gap-4 text-left border-b border-slate-100 md:border md:rounded-[1.5rem] transition-all ${selectedService?.id === s.id ? 'bg-slate-50 md:border-[#001c3b] md:shadow-md md:ring-1 md:ring-[#001c3b]' : 'hover:bg-slate-50 md:shadow-sm hover:border-slate-300 md:hover:border-[#001c3b]'}`}
                                            onClick={() => { setSelectedService(s); nextStep(); }}
                                        >
                                            <div className="ce-icon-box w-12 h-12 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 shadow-sm" style={{ color: s.color || '#2563eb' }}>
                                                {s.image ? <img src={s.image} alt="S" className="w-6 h-6 object-contain" /> : <Sparkles size={24} strokeWidth={1.5} />}
                                            </div>
                                            <div className="flex-1 w-full text-left">
                                                <h3 className="ce-card-name text-lg md:text-base font-bold text-[#001c3b] font-manrope">{s.name}</h3>
                                                <p className="ce-section-subtitle text-sm text-slate-500 mt-1 font-inter">
                                                    {s.duration || '30'} min · Tratamiento Especializado
                                                </p>
                                            </div>
                                            <div className="text-slate-300"><ChevronRight size={20} /></div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: PROFESSIONAL */}
                        {step === 'PROFESSIONAL' && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <header className="ce-section-header">
                                    <h2 className="ce-section-title">Elige Especialista</h2>
                                    <p className="ce-section-subtitle">Selecciona al profesional clínico que prefieras para tu tratamiento.</p>
                                </header>
                                <div className="ce-list-grid">
                                    {professionals.length === 0 ? (
                                        <div className="flex flex-col items-center gap-4 py-8">
                                            <p className="text-muted-foreground italic">No hay profesionales disponibles para reserva online.</p>
                                            <button className="ce-btn-ghost" onClick={() => nextStep()}>Continuar sin preferencia</button>
                                        </div>
                                    ) : professionals.map(p => (
                                        <button 
                                            key={p.id} 
                                            className={`ce-card-editorial ${selectedProfessional?.id === p.id ? 'ce-active' : ''}`}
                                            onClick={() => { setSelectedProfessional(p); nextStep(); }}
                                        >
                                            <div className="ce-icon-box">
                                                {p.image ? <img src={p.image} alt="P" style={{ borderRadius: '50%' }} /> : <User size={28} />}
                                            </div>
                                            <h3 className="ce-card-name">{p.name}</h3>
                                            <p className="ce-section-subtitle" style={{ fontSize: '0.85rem', color: p.color || 'var(--ce-primary)' }}>{p.description || 'Especialista Clínico'}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: DATE (Square Aspect) */}
                        {step === 'DATE' && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-0 md:px-0">
                                <header className="ce-section-header mb-8 md:mb-8 text-center md:text-left hidden md:block">
                                    <h2 className="ce-section-title text-3xl font-bold text-[#001c3b] font-manrope">{t('booking.step2_title')}</h2>
                                    <p className="ce-section-subtitle text-slate-500 mt-2">{t('booking.step2_subtitle')}</p>
                                </header>
                                <div className="ce-calendar-square-wrap bg-white rounded-[2rem] md:rounded-[1.5rem] shadow-sm border border-slate-100 p-6 md:p-4 mx-auto max-w-sm pb-24 md:pb-4">
                                    <div className="ce-calendar-grid">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(d) => { if (d) { setSelectedDate(d); fetchSlots(d); nextStep(); } }}
                                            disabled={dayDisabled}
                                            onMonthChange={setVisibleMonth}
                                            locale={es}
                                            className="!bg-transparent text-[#001c3b]"
                                        />
                                    </div>
                                    {loadingAvailability && (
                                        <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-400">
                                            <Loader2 className="ce-spin" size={14} /> Actualizando agenda...
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: TIME */}
                        {step === 'TIME' && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <header className="ce-section-header mb-6 md:mb-8 text-center md:text-left">
                                    <h2 className="ce-section-title text-2xl md:text-3xl font-bold text-[#133156] font-manrope">{t('booking.step3_title')}</h2>
                                    <p className="ce-section-subtitle text-slate-500 mt-2">{t('booking.step3_subtitle').replace('{FECHA}', selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'today')}</p>
                                </header>
                                {loadingSlots ? (
                                    <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 size={32} className="ce-spin" /></div>
                                ) : (
                                    <div className="ce-slots-grid grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {timeSlots.length > 0 ? timeSlots.map(t => (
                                            <button 
                                                key={t} 
                                                className={`ce-slot-btn py-3 rounded-xl font-medium text-sm transition-all border ${selectedTime === t ? 'bg-[#133156] text-white border-[#133156] shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-[#133156]'}`}
                                                onClick={() => { setSelectedTime(t); nextStep(); }}
                                            >
                                                {t}
                                            </button>
                                        )) : <p className="ce-section-subtitle col-span-full text-center py-4">No slots available for this date.</p>}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 5: FORM */}
                        {step === 'FORM' && (
                            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-24 md:pb-0">
                                <header className="ce-section-header mb-6 md:mb-8 text-center md:text-left">
                                    <h2 className="ce-section-title text-2xl md:text-3xl font-bold text-[#133156] font-manrope">{t('booking.step4_title')}</h2>
                                    <p className="ce-section-subtitle text-slate-500 mt-2">{t('booking.step4_subtitle')}</p>
                                </header>
                                <div className="ce-form-layout flex flex-col gap-5" style={{ maxWidth: '600px' }}>
                                    <div className="ce-field-group flex flex-col gap-1.5">
                                        <label className="ce-field-label text-sm font-semibold text-slate-700">{t('booking.full_name')}</label>
                                        <input 
                                            className="ce-input w-full p-4 rounded-[1rem] bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#133156] focus:ring-1 focus:ring-[#133156] outline-none transition-all" 
                                            value={clientInfo.name} 
                                            onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} 
                                            placeholder="Ej. Juan Pérez"
                                        />
                                    </div>
                                    <div className="ce-field-group flex flex-col gap-1.5">
                                        <label className="ce-field-label text-sm font-semibold text-slate-700">Teléfono</label>
                                        <div className="flex gap-2">
                                            <select className="ce-input p-4 rounded-[1rem] bg-slate-50 border border-slate-200 outline-none w-28" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                                                <option value="+34">+34 ES</option>
                                                <option value="+351">+351 PT</option>
                                                <option value="+1">+1 US</option>
                                            </select>
                                            <input 
                                                className="ce-input flex-1 p-4 rounded-[1rem] bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#133156] focus:ring-1 focus:ring-[#133156] outline-none transition-all" 
                                                value={phoneRest} 
                                                onChange={e => setPhoneRest(e.target.value)} 
                                                placeholder="600000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="ce-field-group flex flex-col gap-1.5">
                                        <label className="ce-field-label text-sm font-semibold text-slate-700">Email de contacto</label>
                                        <input 
                                            className="ce-input w-full p-4 rounded-[1rem] bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#133156] focus:ring-1 focus:ring-[#133156] outline-none transition-all" 
                                            value={clientInfo.email} 
                                            onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })} 
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                    
                                    {/* Mobile Summary Review Box */}
                                    <div className="md:hidden mt-6 p-4 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
                                        <h4 className="text-sm font-bold text-[#133156] mb-3">Resumen de Cita</h4>
                                        <div className="flex flex-col gap-2 text-sm text-slate-600">
                                            <div className="flex justify-between"><span className="opacity-70">Servicio:</span><span className="font-semibold text-slate-800">{selectedService?.name}</span></div>
                                            <div className="flex justify-between"><span className="opacity-70">Fecha:</span><span className="font-semibold text-slate-800">{selectedDate ? format(selectedDate, "d MMM", { locale: es }) : ''} - {selectedTime}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS */}
                        {step === 'SUCCESS' && (
                            <motion.div key="s6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="ce-success-card">
                                    <div className="ce-status-glow"><CheckCircle2 size={48} /></div>
                                    <h2 className="ce-section-title" style={{ textAlign: 'center' }}>Reserva Confirmada</h2>
                                    <p className="ce-section-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                        Tu cita ha sido registrada con éxito en el sistema clínico.
                                    </p>
                                    
                                    <div className="ce-summary-box">
                                        <div className="ce-summary-row">
                                            <span className="ce-summary-label">Servicio</span>
                                            <span className="ce-summary-val">{selectedService?.name}</span>
                                        </div>
                                        <div className="ce-summary-row">
                                            <span className="ce-summary-label">Fecha y Hora</span>
                                            <span className="ce-summary-val">
                                                {format(selectedDate!, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime}
                                            </span>
                                        </div>
                                        {selectedProfessional && (
                                            <div className="ce-summary-row">
                                                <span className="ce-summary-label">{t('booking.professional')}</span>
                                                <span className="ce-summary-val">{selectedProfessional.name} {selectedProfessional.description ? `(${selectedProfessional.description})` : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button className="ce-btn-primary" style={{ width: '100%', marginTop: '3rem' }} onClick={() => window.location.reload()}>
                                        Volver al inicio
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* 3. Global Bottom Navigation Bar (Glassmorphic) */}
            {step !== 'SUCCESS' && (
                <div className="fixed md:static bottom-0 left-0 w-full px-6 py-6 md:p-6 bg-white border-t border-slate-100 md:border-none flex items-center justify-between gap-4 z-50">
                    <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30" onClick={prevStep} disabled={step === 'SERVICE'}>
                        <ChevronLeft size={18} /> Atras
                    </button>
                    
                    <div className="flex w-full md:w-auto items-center justify-between md:gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#455f87] opacity-60">Paso actual</span>
                            <span className="text-sm font-bold text-[#001c3b]">{activeSteps.find(s => s.key === step)?.label}</span>
                        </div>
                        
                        {step === 'FORM' ? (
                            <button 
                                className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#001c3b] disabled:bg-[#8896A6] text-white px-8 py-5 md:py-3 rounded-full font-bold shadow-none disabled:opacity-100 transition-all text-lg md:text-base font-manrope" 
                                onClick={handleConfirm} 
                                disabled={loading || isNextDisabled()}
                            >
                                {loading ? <RefreshCw className="animate-spin" size={24} /> : 'Finalizar Reserva'}
                                <ShieldCheck size={24} />
                            </button>
                        ) : (
                            <button 
                                className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#001c3b] disabled:bg-[#8896A6] text-white px-8 py-5 md:py-3 rounded-full font-bold shadow-none disabled:opacity-100 transition-all text-lg md:text-base font-manrope" 
                                onClick={nextStep} 
                                disabled={isNextDisabled()}
                            >
                                Siguiente
                                <ArrowRight size={20} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
