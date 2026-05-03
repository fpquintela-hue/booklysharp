'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Stethoscope, 
    HeartPulse, 
    Baby, 
    Eye, 
    Microscope, 
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

type Step = 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'FORM' | 'SUCCESS';

const STEPS_DATA = [
    { key: 'SERVICE', label: 'Servicio', icon: <Stethoscope size={20} /> },
    { key: 'PROFESSIONAL', label: 'Especialista', icon: <User size={20} /> },
    { key: 'DATETIME', label: 'Fecha y Hora', icon: <CalendarDays size={20} /> },
    { key: 'FORM', label: 'Datos del Paciente', icon: <User size={20} /> },
    { key: 'SUCCESS', label: 'Confirmación', icon: <CheckCircle2 size={20} /> },
];

export function BookingPortalV2() {
    const [step, setStep] = useState<Step>('SERVICE');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedProf, setSelectedProf] = useState<any>(null);

    const currentStepIdx = STEPS_DATA.findIndex(s => s.key === step);

    const nextStep = () => {
        if (step === 'SERVICE') setStep('PROFESSIONAL');
        else if (step === 'PROFESSIONAL') setStep('DATETIME');
        else if (step === 'DATETIME') setStep('FORM');
        else if (step === 'FORM') setStep('SUCCESS');
    };

    const prevStep = () => {
        if (step === 'PROFESSIONAL') setStep('SERVICE');
        else if (step === 'DATETIME') setStep('PROFESSIONAL');
        else if (step === 'FORM') setStep('DATETIME');
    };

    // --- Desktop Sidebar ---
    const DesktopSidebar = () => (
        <nav className="hidden md:flex bg-slate-50 dark:bg-slate-950 h-screen w-80 fixed left-0 border-r-0 flex-col gap-2 p-8 z-40">
            <div className="mb-12">
                <h1 className="text-lg font-black text-[#133156] mb-8 font-manrope">Clínica Precision</h1>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 font-manrope">Reserva de Cita</h2>
                    <p className="text-slate-500 text-sm font-inter">Paso {currentStepIdx + 1} de {STEPS_DATA.length}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 flex-grow">
                {STEPS_DATA.map((s, idx) => {
                    const isActive = s.key === step;
                    const isPassed = idx < currentStepIdx;
                    
                    if (isActive) {
                        return (
                            <div key={s.key} className="flex items-center gap-4 bg-white dark:bg-slate-800 text-[#133156] font-semibold rounded-full px-6 py-4 shadow-sm font-inter text-sm">
                                {s.icon}
                                <span>{s.label}</span>
                            </div>
                        );
                    }
                    return (
                        <div key={s.key} className={`flex items-center gap-4 px-6 py-4 font-inter text-sm ${isPassed ? 'text-[#133156] font-medium' : 'text-slate-400'}`}>
                            {isPassed ? <CheckCircle2 size={20} /> : s.icon}
                            <span>{s.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto pt-8">
                <button className="w-full text-center rounded-full py-4 text-[#133156] font-medium bg-white border border-slate-200 hover:bg-slate-50 transition-colors font-inter">
                    Cancelar Reserva
                </button>
            </div>
        </nav>
    );

    // --- Mobile Top Nav ---
    const MobileTopNav = () => (
        <header className="md:hidden flex items-center justify-between p-4 sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50">
            {step !== 'SUCCESS' && step !== 'SERVICE' ? (
                <button onClick={prevStep} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm"><ArrowLeft size={20} /></button>
            ) : <div className="w-10" />}
            
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-manrope">
                    Paso {currentStepIdx + 1} de {STEPS_DATA.length - 1}
                </span>
                <span className="text-sm font-bold text-[#133156] font-manrope">{STEPS_DATA[currentStepIdx].label}</span>
            </div>
            
            {step !== 'SUCCESS' ? (
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm"><X size={20} /></button>
            ) : <div className="w-10" />}
        </header>
    );

    return (
        <div className="min-h-screen flex w-full bg-[#f7f9fb] font-inter text-slate-900">
            <DesktopSidebar />
            
            <main className="w-full md:ml-80 flex flex-col min-h-screen relative">
                <MobileTopNav />

                <div className="flex-1 p-6 md:p-12 lg:p-16 max-w-6xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        
                        {/* DESKTOP BACK BUTTON */}
                        {step !== 'SERVICE' && step !== 'SUCCESS' && (
                            <button 
                                onClick={prevStep} 
                                className="hidden md:inline-flex items-center gap-2 text-slate-500 hover:text-[#001c3b] font-medium font-inter mb-8 transition-colors"
                            >
                                <ArrowLeft size={16} /> Volver al paso anterior
                            </button>
                        )}

                        {/* STEP 1: SERVICE */}
                        {step === 'SERVICE' && (
                            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <header className="mb-8 md:mb-16">
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold text-[#001c3b] tracking-tight leading-tight mb-4">Seleccione el servicio</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Elija la especialidad o servicio que requiere para su consulta. Nuestros especialistas están capacitados para brindar la mejor atención.
                                    </p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {/* Featured Service */}
                                    <div 
                                        onClick={() => { setSelectedService('Consulta General'); nextStep(); }}
                                        className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative group cursor-pointer transition-all hover:bg-slate-50"
                                    >
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#d5e3ff] flex items-center justify-center shrink-0">
                                            <Stethoscope className="text-[#001c3b]" size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-manrope text-xl md:text-2xl font-bold text-[#001c3b] mb-3">Consulta General</h3>
                                            <p className="text-slate-500 mb-6 leading-relaxed text-sm md:text-base">
                                                Evaluación médica integral para diagnóstico, tratamiento de afecciones comunes y derivación a especialistas si es necesario. Ideal para primer contacto.
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-[#d6e0f4] px-4 py-2 text-sm font-medium text-[#133156]">
                                                    <Clock size={16} /> 30 min
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Normal Services */}
                                    {[
                                        { n: 'Cardiología', i: <HeartPulse size={28}/>, d: 'Evaluación del sistema cardiovascular.', t: '45 min' },
                                        { n: 'Pediatría', i: <Baby size={28}/>, d: 'Atención médica para infantes y niños.', t: '40 min' },
                                        { n: 'Oftalmología', i: <Eye size={28}/>, d: 'Examen visual completo y patologías.', t: '30 min' },
                                        { n: 'Dermatología', i: <Microscope size={28}/>, d: 'Diagnóstico de afecciones de la piel.', t: '30 min' }
                                    ].map((s, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => { setSelectedService(s.n); nextStep(); }}
                                            className="bg-white rounded-[1.5rem] p-6 md:p-8 flex flex-col gap-6 relative group cursor-pointer transition-all hover:bg-slate-50"
                                        >
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#d5e3ff] flex items-center justify-center">
                                                <div className="text-[#001c3b]">{s.i}</div>
                                            </div>
                                            <div>
                                                <h3 className="font-manrope text-lg md:text-xl font-bold text-[#001c3b] mb-2">{s.n}</h3>
                                                <p className="text-slate-500 text-sm mb-6">{s.d}</p>
                                                <span className="inline-flex items-center gap-2 rounded-full bg-[#d6e0f4] px-3 py-1.5 text-sm font-medium text-[#133156] w-fit">
                                                    <Clock size={16} /> {s.t}
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
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold text-[#001c3b] tracking-tight leading-tight mb-4">Especialista</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Seleccione al profesional clínico que prefiera para su tratamiento de {selectedService}.
                                    </p>
                                </header>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div 
                                            key={i}
                                            onClick={() => { setSelectedProf(`Dr. Especialista ${i}`); nextStep(); }}
                                            className="bg-white rounded-[1.5rem] p-6 flex items-center gap-6 cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                <User className="text-slate-400" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="font-manrope text-xl font-bold text-[#001c3b]">Dr. Especialista {i}</h3>
                                                <p className="text-slate-500 text-sm mt-1">Especialista Jefe · 4.9 ★</p>
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
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold text-[#001c3b] tracking-tight leading-tight mb-4">Fecha y Hora</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Seleccione el momento que mejor se adapte a su agenda.
                                    </p>
                                </header>

                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                                    <div className="flex-1 bg-white p-6 md:p-8 rounded-[2rem]">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(d) => d && setSelectedDate(d)}
                                            locale={es}
                                            className="w-full bg-transparent p-0"
                                            classNames={{
                                                months: "w-full",
                                                month: "w-full",
                                                nav: "flex items-center gap-2 absolute top-0 right-0 w-auto justify-end",
                                                button_previous: "w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#001c3b] hover:bg-slate-100 transition-colors [&>svg]:size-4 bg-transparent border-0 shadow-none",
                                                button_next: "w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#001c3b] hover:bg-slate-100 transition-colors [&>svg]:size-4 bg-transparent border-0 shadow-none",
                                                month_caption: "flex justify-start h-10 mb-8 px-0",
                                                caption_label: "text-2xl font-bold font-manrope text-[#001c3b] capitalize",
                                                table: "w-full border-collapse space-y-1",
                                                weekdays: "flex w-full mb-4",
                                                weekday: "text-slate-400 font-medium text-[11px] uppercase tracking-wider w-full text-center",
                                                week: "flex w-full mt-2",
                                                day: "h-12 w-full text-center text-sm p-0 relative flex items-center justify-center",
                                                // Override day button classes explicitly since Shadcn adds some default styling via DayButton component
                                            }}
                                            components={{
                                                DayButton: (props: any) => {
                                                    const isSelected = props.modifiers?.selected;
                                                    const isToday = props.modifiers?.today;
                                                    const isOutside = props.modifiers?.outside;
                                                    return (
                                                        <button 
                                                            {...props} 
                                                            className={`h-10 w-10 mx-auto rounded-full font-inter font-medium text-sm transition-all flex items-center justify-center ${
                                                                isSelected 
                                                                    ? 'bg-[#001c3b] text-white shadow-lg' 
                                                                    : isOutside 
                                                                        ? 'text-slate-300 hover:bg-transparent cursor-default' 
                                                                        : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        />
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className="font-manrope text-xl font-bold text-[#001c3b] mb-6">Horas Disponibles</h3>
                                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                                            {['09:00', '09:30', '10:00', '11:30', '12:00', '16:00', '17:30', '18:00'].map(t => (
                                                <button 
                                                    key={t}
                                                    onClick={() => setSelectedTime(t)}
                                                    className={`py-4 rounded-[1rem] font-medium transition-all ${selectedTime === t ? 'bg-[#133156] text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedTime && (
                                            <button onClick={nextStep} className="mt-8 w-full md:w-auto px-8 py-4 bg-[#001c3b] text-white rounded-full font-bold font-manrope">
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
                                    <h1 className="font-manrope text-3xl md:text-[3.5rem] font-bold text-[#001c3b] tracking-tight leading-tight mb-4">Tus Datos</h1>
                                    <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
                                        Complete su información para confirmar la reserva clínica.
                                    </p>
                                </header>

                                <div className="max-w-2xl bg-white p-8 md:p-12 rounded-[2rem] flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                                        <input type="text" className="w-full p-4 rounded-[1rem] bg-[#f7f9fb] border-none focus:ring-2 focus:ring-[#133156] outline-none" placeholder="Ej. Ana García" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
                                        <input type="email" className="w-full p-4 rounded-[1rem] bg-[#f7f9fb] border-none focus:ring-2 focus:ring-[#133156] outline-none" placeholder="ana@ejemplo.com" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                                        <input type="tel" className="w-full p-4 rounded-[1rem] bg-[#f7f9fb] border-none focus:ring-2 focus:ring-[#133156] outline-none" placeholder="600 000 000" />
                                    </div>
                                    
                                    <button onClick={nextStep} className="mt-4 w-full py-5 bg-gradient-to-br from-[#001c3b] to-[#133156] text-white rounded-full font-bold font-manrope text-lg shadow-lg">
                                        Confirmar Cita
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 'SUCCESS' && (
                            <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20">
                                <div className="w-24 h-24 bg-[#d5e3ff] rounded-full flex items-center justify-center mb-8">
                                    <CheckCircle2 className="text-[#001c3b]" size={48} />
                                </div>
                                <h1 className="font-manrope text-[3rem] font-bold text-[#001c3b] mb-4">¡Reserva Confirmada!</h1>
                                <p className="text-lg text-slate-500 max-w-md">
                                    Hemos enviado los detalles de su cita al correo proporcionado. Le esperamos en Clínica Precision.
                                </p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
