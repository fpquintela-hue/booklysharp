/* 
   =========================================================
   BOOKING PORTAL: Clinical Ethereal High-Fidelity
   =========================================================
*/
'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
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
        <div className="ce-root">
            {/* 1. Top Breadcrumb Stepper */}
            <nav className="ce-stepper-wrap">
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
            <main className="ce-page">
                <div className="ce-portal">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: SERVICE */}
                        {step === 'SERVICE' && (
                            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <header className="ce-section-header">
                                    <h2 className="ce-section-title">Select Service</h2>
                                    <p className="ce-section-subtitle">Choose a specialized treatment tailored to your needs.</p>
                                </header>
                                <div className="ce-list-grid">
                                    {initialServices.map(s => (
                                        <button 
                                            key={s.id} 
                                            className={`ce-card-editorial ${selectedService?.id === s.id ? 'ce-active' : ''}`}
                                            onClick={() => { setSelectedService(s); nextStep(); }}
                                        >
                                            <div className="ce-icon-box" style={{ color: s.color || 'var(--ce-primary)' }}>
                                                {s.image ? <img src={s.image} alt="S" /> : <Sparkles size={28} />}
                                            </div>
                                            <div>
                                                <h3 className="ce-card-name">{s.name}</h3>
                                                <p className="ce-section-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                    {s.duration || '45'} min · Professional Care
                                                </p>
                                            </div>
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
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <header className="ce-section-header">
                                    <h2 className="ce-section-title">Select Date</h2>
                                    <p className="ce-section-subtitle">Clinical agenda available until next month.</p>
                                </header>
                                <div className="ce-calendar-square-wrap">
                                    <div className="ce-calendar-grid">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(d) => { if (d) { setSelectedDate(d); fetchSlots(d); nextStep(); } }}
                                            disabled={dayDisabled}
                                            onMonthChange={setVisibleMonth}
                                            locale={es}
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
                                <header className="ce-section-header">
                                    <h2 className="ce-section-title">Select Time</h2>
                                    <p className="ce-section-subtitle">Showing slots for {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'today'}</p>
                                </header>
                                {loadingSlots ? (
                                    <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 size={32} className="ce-spin" /></div>
                                ) : (
                                    <div className="ce-slots-grid">
                                        {timeSlots.length > 0 ? timeSlots.map(t => (
                                            <button 
                                                key={t} 
                                                className={`ce-slot-btn ${selectedTime === t ? 'active' : ''}`}
                                                onClick={() => { setSelectedTime(t); nextStep(); }}
                                            >
                                                {t}
                                            </button>
                                        )) : <p className="ce-section-subtitle">No slots available for this date.</p>}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 5: FORM */}
                        {step === 'FORM' && (
                            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <header className="ce-section-header">
                                    <h2 className="ce-section-title">Final Details</h2>
                                    <p className="ce-section-subtitle">Clinical validation requires a valid phone number.</p>
                                </header>
                                <div className="ce-form-layout" style={{ maxWidth: '600px' }}>
                                    <div className="ce-field-group">
                                        <label className="ce-field-label">Nombre Completo</label>
                                        <input 
                                            className="ce-input" 
                                            value={clientInfo.name} 
                                            onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} 
                                            placeholder="Ej. Juan Pérez"
                                        />
                                    </div>
                                    <div className="ce-field-group">
                                        <label className="ce-field-label">Teléfono</label>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <select className="ce-input" style={{ width: '100px' }} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                                                <option value="+34">+34 ES</option>
                                                <option value="+351">+351 PT</option>
                                                <option value="+1">+1 US</option>
                                            </select>
                                            <input 
                                                className="ce-input" 
                                                style={{ flex: 1 }} 
                                                value={phoneRest} 
                                                onChange={e => setPhoneRest(e.target.value)} 
                                                placeholder="600000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="ce-field-group">
                                        <label className="ce-field-label">Email de contacto</label>
                                        <input 
                                            className="ce-input" 
                                            value={clientInfo.email} 
                                            onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })} 
                                            placeholder="correo@ejemplo.com"
                                        />
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
                                                <span className="ce-summary-label">Especialista</span>
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
                <div className="ce-bottom-nav">
                    <button className="ce-btn-ghost" onClick={prevStep} disabled={step === 'SERVICE'}>
                        <ChevronLeft size={18} /> Atras
                    </button>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#455f87] opacity-60">Paso actual</span>
                            <span className="text-sm font-bold text-[#133156]">{activeSteps.find(s => s.key === step)?.label}</span>
                        </div>
                        
                        {step === 'FORM' ? (
                            <button 
                                className="ce-btn-primary" 
                                onClick={handleConfirm} 
                                disabled={loading || isNextDisabled()}
                            >
                                {loading ? <RefreshCw className="ce-spin" size={18} /> : 'Finalizar Reserva'}
                                <ShieldCheck size={18} />
                            </button>
                        ) : (
                            <button 
                                className="ce-btn-primary" 
                                onClick={nextStep} 
                                disabled={isNextDisabled()}
                            >
                                Siguiente
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
