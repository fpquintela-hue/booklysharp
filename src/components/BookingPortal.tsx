/* =========================================================
   BOOKING PORTAL: Mobile-First High-Fidelity
   =========================================================
*/
'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from '@/hooks/useTranslation';
import {
    CheckCircle2,
    ArrowLeft,
    X,
    User,
    Sparkles,
    Loader2,
    RefreshCw,
    CalendarDays,
    BriefcaseMedical,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

type Step = 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'FORM' | 'SUCCESS';

interface BookingPortalProps {
    alias: string;
    tenantName?: string;
    services: any[];
    professionals: any[];
    settings?: any;
}

const STEPS_DATA = [
    { key: 'SERVICE', label: 'Seleccionar Servicio', title: 'Seleccionar Servicio', subtitle: 'Elija un tratamiento especializado adaptado a sus necesidades.' },
    { key: 'PROFESSIONAL', label: 'Seleccionar Especialista', title: 'Elija su especialista', subtitle: 'Nuestro equipo de expertos está aquí para ayudarle. Seleccione el profesional que mejor se adapte a sus necesidades.' },
    { key: 'DATETIME', label: 'Seleccionar Fecha y Hora', title: 'Seleccione fecha y hora', subtitle: 'Elija el momento ideal para su cita.' },
    { key: 'FORM', label: 'Detalles del Paciente', title: 'Revisar y Confirmar', subtitle: 'Por favor, complete sus datos y revise la información de la reserva.' },
    { key: 'SUCCESS', label: 'Confirmación', title: '¡Reserva Confirmada!', subtitle: 'Su cita ha sido programada con éxito. Hemos enviado un correo con los detalles.' },
];

export function BookingPortal({ alias, tenantName, services: initialServices, professionals, settings }: BookingPortalProps) {
    const [step, setStep] = useState<Step>('SERVICE');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
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
        setSelectedTime(null);
        try {
            const profQuery = selectedProfessional ? `&professionalId=${selectedProfessional.id}` : '';
            const res = await fetch(`/api/public/availability?alias=${alias}&date=${format(date, 'yyyy-MM-dd')}${profQuery}`);
            if (res.ok) {
                const data = await res.json();
                setTimeSlots(data.availableSlots || []);
            }
        } catch (e) { setTimeSlots([]); }
        finally { setLoadingSlots(false); }
    };

    const handleConfirm = async () => {
        if (!clientInfo.name || !clientInfo.email || !phoneRest) { toast.error('Por favor, completa todos los campos.'); return; }
        setLoading(true);
        const fullPhone = countryCode + phoneRest;
        try {
            Cookies.set(`bookly_client_${alias}`, JSON.stringify({ ...clientInfo, phone: fullPhone }), { expires: 365 });
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

    const nextStep = () => {
        if (step === 'SERVICE') {
            if (autoSkipProfessional) {
                if (!selectedProfessional && professionals.length > 0) setSelectedProfessional(professionals[0]);
                setStep('DATETIME');
            } else setStep('PROFESSIONAL');
        }
        else if (step === 'PROFESSIONAL') setStep('DATETIME');
        else if (step === 'DATETIME') setStep('FORM');
    };

    const prevStep = () => {
        if (step === 'PROFESSIONAL') setStep('SERVICE');
        else if (step === 'DATETIME') setStep(autoSkipProfessional ? 'SERVICE' : 'PROFESSIONAL');
        else if (step === 'FORM') setStep('DATETIME');
    };

    const isNextDisabled = () => {
        if (step === 'SERVICE') return !selectedService;
        if (step === 'PROFESSIONAL') return !selectedProfessional; 
        if (step === 'DATETIME') return !selectedDate || !selectedTime;
        if (step === 'FORM') return !clientInfo.name || !clientInfo.email || !phoneRest;
        return true;
    };

    const currentStepData = activeSteps[currentStepIdx];

    return (
        <div className="ce-app-container">
            <div className="ce-mobile-frame">
                
                {/* Cabecera Superior (Top Nav) */}
                <header className="ce-top-nav">
                    {step !== 'SUCCESS' && step !== 'SERVICE' ? (
                        <button onClick={prevStep} className="ce-nav-icon"><ArrowLeft size={20} /></button>
                    ) : <div className="ce-nav-icon-placeholder" />}
                    
                    {step !== 'SUCCESS' ? (
                        <span className="ce-step-indicator">Paso {currentStepIdx + 1} de {activeSteps.length - 1}</span>
                    ) : (
                         <span className="ce-step-indicator">Completado</span>
                    )}
                    
                    {step !== 'SUCCESS' ? (
                        <button className="ce-nav-icon"><X size={20} /></button>
                    ) : <div className="ce-nav-icon-placeholder" />}
                </header>

                {/* Contenido Principal */}
                <main className="ce-main-content">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: SERVICE */}
                        {step === 'SERVICE' && (
                            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ce-step-wrapper">
                                <div className="ce-header-text">
                                    <h1>{currentStepData.title}</h1>
                                    <p>{currentStepData.subtitle}</p>
                                </div>
                                <div className="ce-cards-vertical">
                                    {initialServices.map(s => (
                                        <div key={s.id} className={`ce-item-card ${selectedService?.id === s.id ? 'active' : ''}`} onClick={() => setSelectedService(s)}>
                                            <div className="ce-item-icon" style={{ color: s.color || '#001c3b', backgroundColor: s.color ? `${s.color}15` : '#f0f4f8' }}>
                                                {s.image ? <img src={s.image} alt="S" /> : <Sparkles size={22} />}
                                            </div>
                                            <div className="ce-item-info">
                                                <h3>{s.name}</h3>
                                                <p>{s.description || 'Terapia intensiva diseñada para mejorar tu bienestar.'}</p>
                                            </div>
                                            <div className={`ce-radio-circle ${selectedService?.id === s.id ? 'checked' : ''}`}>
                                                {selectedService?.id === s.id && <div className="ce-radio-inner" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: PROFESSIONAL */}
                        {step === 'PROFESSIONAL' && (
                            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ce-step-wrapper">
                                <div className="ce-header-text">
                                    <h1>{currentStepData.title}</h1>
                                    <p>{currentStepData.subtitle}</p>
                                </div>
                                <div className="ce-cards-vertical">
                                    {professionals.map(p => (
                                        <div key={p.id} className={`ce-prof-card ${selectedProfessional?.id === p.id ? 'active' : ''}`} onClick={() => setSelectedProfessional(p)}>
                                            <div className="ce-prof-avatar">
                                                {p.image ? <img src={p.image} alt="P" /> : <User size={28} />}
                                            </div>
                                            <div className="ce-prof-info">
                                                <h3>{p.name}</h3>
                                                <p>{p.description || 'Especialidad General'}</p>
                                                <div className="ce-prof-badges">
                                                    <span className="ce-badge-rating">★ 4.9 (120+)</span>
                                                    <span className="ce-badge-avail"><CalendarDays size={12}/> Disp. Hoy</span>
                                                </div>
                                            </div>
                                            <div className={`ce-radio-circle ${selectedProfessional?.id === p.id ? 'checked' : ''}`}>
                                                {selectedProfessional?.id === p.id && <div className="ce-radio-inner" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: DATETIME */}
                        {step === 'DATETIME' && (
                            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ce-step-wrapper">
                                <div className="ce-header-text">
                                    <h1>{currentStepData.title}</h1>
                                    <p>{currentStepData.subtitle}</p>
                                </div>
                                
                                <div className="ce-calendar-clean">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => { if (d) { setSelectedDate(d); fetchSlots(d); } }}
                                        disabled={dayDisabled}
                                        onMonthChange={setVisibleMonth}
                                        locale={es}
                                    />
                                </div>

                                <div className="ce-time-section">
                                    <h3>Horas disponibles</h3>
                                    {loadingSlots ? (
                                        <div className="ce-loader"><Loader2 className="animate-spin" /></div>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="ce-time-grid">
                                            {timeSlots.map(t => (
                                                <button key={t} className={`ce-time-btn ${selectedTime === t ? 'active' : ''}`} onClick={() => setSelectedTime(t)}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="ce-no-slots">Seleccione un día para ver los horarios, o no hay disponibilidad para el día seleccionado.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: FORM */}
                        {step === 'FORM' && (
                            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ce-step-wrapper">
                                <div className="ce-header-text">
                                    <h1>{currentStepData.title}</h1>
                                    <p>{currentStepData.subtitle}</p>
                                </div>

                                {/* Resumen superior */}
                                <div className="ce-summary-box">
                                    <div className="ce-summary-item">
                                        <div className="ce-summary-icon"><CalendarDays size={18} /></div>
                                        <div>
                                            <h4>Fecha y Hora</h4>
                                            <p>{selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : ''}</p>
                                            <p className="ce-summary-highlight">{selectedTime}</p>
                                        </div>
                                    </div>
                                    <div className="ce-summary-divider" />
                                    <div className="ce-summary-item">
                                        <div className="ce-summary-icon"><BriefcaseMedical size={18} /></div>
                                        <div>
                                            <h4>Especialidad</h4>
                                            <p>{selectedService?.name}</p>
                                            {selectedProfessional && (
                                                <div className="ce-summary-prof">
                                                    {selectedProfessional.image ? <img src={selectedProfessional.image} alt="" /> : <User size={14} />}
                                                    <span>{selectedProfessional.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Formulario */}
                                <div className="ce-form-section">
                                    <h3>Detalles del Paciente</h3>
                                    <div className="ce-input-group">
                                        <label>Nombre Completo</label>
                                        <input type="text" placeholder="Ej. Ana García" value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} />
                                    </div>
                                    <div className="ce-input-group">
                                        <label>Correo Electrónico</label>
                                        <input type="email" placeholder="ana.garcia@ejemplo.com" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} />
                                    </div>
                                    <div className="ce-input-group">
                                        <label>Número de Teléfono</label>
                                        <div className="ce-phone-input">
                                            <select value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                                                <option value="+34">+34</option>
                                                <option value="+1">+1</option>
                                            </select>
                                            <input type="tel" placeholder="600 000 000" value={phoneRest} onChange={e => setPhoneRest(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 'SUCCESS' && (
                            <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="ce-step-wrapper ce-success-view">
                                <div className="ce-success-icon-wrap">
                                    <CheckCircle2 size={40} className="text-white" />
                                </div>
                                <h1 className="ce-success-title">{currentStepData.title}</h1>
                                <p className="ce-success-subtitle">{currentStepData.subtitle}</p>

                                <div className="ce-final-summary">
                                    <div className="ce-fs-row">
                                        <div className="ce-fs-icon"><BriefcaseMedical size={16}/></div>
                                        <div className="ce-fs-text"><span>Servicio</span><strong>{selectedService?.name}</strong></div>
                                    </div>
                                    {selectedProfessional && (
                                        <div className="ce-fs-row">
                                            <div className="ce-fs-icon"><User size={16}/></div>
                                            <div className="ce-fs-text"><span>Profesional</span><strong>{selectedProfessional.name}</strong></div>
                                        </div>
                                    )}
                                    <div className="ce-fs-row">
                                        <div className="ce-fs-icon"><CalendarDays size={16}/></div>
                                        <div className="ce-fs-text"><span>Fecha</span><strong>{format(selectedDate!, "d 'de' MMMM, yyyy", { locale: es })}</strong></div>
                                    </div>
                                    <div className="ce-fs-row">
                                        <div className="ce-fs-icon"><Clock size={16}/></div>
                                        <div className="ce-fs-text"><span>Hora</span><strong>{selectedTime}</strong></div>
                                    </div>
                                </div>

                                <button className="ce-btn-block" onClick={() => window.location.reload()}>
                                    Volver al Inicio
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>

                {/* Footer Flotante (Botones de acción) */}
                {step !== 'SUCCESS' && (
                    <footer className="ce-bottom-actions">
                        {step !== 'SERVICE' ? (
                            <button className="ce-btn-ghost-nav" onClick={prevStep}>
                                <ChevronLeft size={16} /> Volver
                            </button>
                        ) : <div />} {/* Espaciador si no hay botón volver */}

                        {step === 'FORM' ? (
                            <button className="ce-btn-primary-nav" onClick={handleConfirm} disabled={loading || isNextDisabled()}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar'}
                                {!loading && <ChevronRight size={18} />}
                            </button>
                        ) : (
                            <button className="ce-btn-primary-nav" onClick={nextStep} disabled={isNextDisabled()}>
                                Continuar <ChevronRight size={18} />
                            </button>
                        )}
                    </footer>
                )}

            </div>
        </div>
    );
}