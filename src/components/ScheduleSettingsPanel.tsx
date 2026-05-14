'use client';

import { useState, useEffect } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useSettings } from '@/context/settings-context';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Calendar as CalendarIcon, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/mock-service';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Trash, CalendarOff, History } from 'lucide-react';

import { Switch } from '@/components/ui/switch';

const locales = {
    'es': es,
    'gl': gl,
};

const localizer = dateFnsLocalizer({
    format: (date: any, formatStr: any, options: any) => (format as any)(date, formatStr, options),
    parse: (str: any, formatStr: any, options: any) => (parse as any)(str, formatStr, new Date(), options),
    startOfWeek: (date: any, options: any) => (startOfWeek as any)(date, { ...options, weekStartsOn: 1 }),
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar as any);

interface BlockedSlot {
    dayOfWeek: number;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

export function ScheduleSettingsPanel() {
    const { settings, refreshSettings } = useSettings();
    const { t, lang } = useTranslation();
    const [saving, setSaving] = useState(false);

    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedProf, setSelectedProf] = useState<string>('global');

    const [slots, setSlots] = useState<BlockedSlot[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    // Dialog states for new features
    const [holidaysOpen, setHolidaysOpen] = useState(false);
    const [recurringOpen, setRecurringOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    // Manual Block Config State
    const [manualDayOpen, setManualDayOpen] = useState(false);
    const [manualDayTarget, setManualDayTarget] = useState<number>(1);
    const [manualDayLabel, setManualDayLabel] = useState<string>('');
    const [manualStartTime, setManualStartTime] = useState('09:00');
    const [manualEndTime, setManualEndTime] = useState('14:00');
    const [manualAllDay, setManualAllDay] = useState(false);

    // To allow drag/drop, we maintain dummy events on a specific "dummy week"
    const [events, setEvents] = useState<any[]>([]);

    const baseDate = new Date(2024, 0, 1); // Jan 1, 2024 is a Monday

    const openTime = settings.startTime || '09:00';
    const closeTime = settings.endTime || '19:00';
    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    // Create Date objects for min/max on the baseDate
    const calendarMin = new Date(2024, 0, 1, openH, openM, 0);
    const calendarMax = new Date(2024, 0, 1, closeH, closeM, 0);

    // Calculate full height based on time range so ALL slots render and are interactive
    const totalMinutes = (closeH * 60 + closeM) - (openH * 60 + openM);
    // As per user request, height is slightly reduced but CSS handles the compact flex
    const calendarHeight = Math.max(350, (Math.ceil(totalMinutes / 15) * 50) * 0.4);

    const CustomHeader = ({ label, date }: { label: string, date: Date }) => {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-1 pb-1 gap-1">
                <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                    {label}
                </span>
                <button 
                    onClick={() => {
                        setManualDayTarget(getDay(date));
                        setManualDayLabel(label);
                        setManualStartTime(openTime);
                        setManualEndTime(closeTime);
                        setManualAllDay(false);
                        setManualDayOpen(true);
                    }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    title="Configurar cierre manual"
                >
                    <Clock className="w-3.5 h-3.5 text-slate-400 hover:text-primary transition-colors" />
                </button>
            </div>
        );
    };

    useEffect(() => {
        apiFetch('professionals')
            .then(data => setProfessionals(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedProf === 'global') {
            const initialSlots = settings.blockedSlots ? JSON.parse(settings.blockedSlots) : [];
            setSlots(initialSlots);
        } else {
            const profSlots = settings[`blockedSlots_${selectedProf}`];
            const initialSlots = profSlots ? JSON.parse(profSlots) : [];
            setSlots(initialSlots);
        }
    }, [selectedProf, settings]);



    // Helper to convert BlockedSlot to an Event on our dummy week
    const slotsToEvents = (currentSlots: BlockedSlot[]) => {
        return currentSlots.map((slot, idx) => {
            const [sh, sm] = slot.startTime.split(':').map(Number);
            const [eh, em] = slot.endTime.split(':').map(Number);

            const isTargetSunday = slot.dayOfWeek === 0;
            const diff = isTargetSunday ? 6 : slot.dayOfWeek - 1;

            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + diff);

            const start = new Date(date);
            start.setHours(sh, sm, 0, 0);

            const end = new Date(date);
            end.setHours(eh, em, 0, 0);

            return {
                id: idx,
                title: t('type.blocked'),
                start,
                end,
                slotData: slot
            };
        });
    };

    // Initialize events from slots
    useEffect(() => {
        setEvents(slotsToEvents(slots));
    }, [slots]);

    const getSettingKey = () => selectedProf === 'global' ? 'blockedSlots' : `blockedSlots_${selectedProf}`;

    const saveSettingsToApi = async (newSlots: BlockedSlot[]) => {
        try {
            await apiFetch('settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [getSettingKey()]: JSON.stringify(newSlots)
                })
            });
            await refreshSettings();
        } catch (e) {
            toast.error(t('settings.error_saving'));
            throw e;
        }
    };

    const handleSaveManual = () => {
        let sh = manualStartTime;
        let eh = manualEndTime;
        if (manualAllDay) {
            sh = openTime;
            eh = closeTime;
        }
        
        const newSlot: BlockedSlot = { dayOfWeek: manualDayTarget, startTime: sh, endTime: eh };
        const newSlots = [...slots, newSlot];
        setSlots(newSlots);
        saveSettingsToApi(newSlots);
        setManualDayOpen(false);
        toast.success(`Cierre manual añadido para ${manualDayLabel}`);
    };

    const handleSelectSlot = async ({ start, end }: { start: Date, end: Date }) => {
        const sh = format(start, 'HH:mm');
        const eh = format(end, 'HH:mm');
        const dayOfWeek = getDay(start);

        const newSlot: BlockedSlot = { dayOfWeek, startTime: sh, endTime: eh };
        const newSlots = [...slots, newSlot];
        setSlots(newSlots);
        saveSettingsToApi(newSlots);
    };

    const handleEventDrop = async ({ event, start, end }: any) => {
        const newSlots = [...slots];
        const sh = format(start, 'HH:mm');
        const eh = format(end, 'HH:mm');
        const dayOfWeek = getDay(start);

        newSlots[event.id] = { dayOfWeek, startTime: sh, endTime: eh };
        setSlots(newSlots);
        saveSettingsToApi(newSlots);
    };

    const handleEventResize = async ({ event, start, end }: any) => {
        const newSlots = [...slots];
        const sh = format(start, 'HH:mm');
        const eh = format(end, 'HH:mm');
        const dayOfWeek = getDay(start);

        newSlots[event.id] = { dayOfWeek, startTime: sh, endTime: eh };
        setSlots(newSlots);
        saveSettingsToApi(newSlots);
    };

    const executeDelete = async (slotId: number) => {
        const newSlots = slots.filter((_s: BlockedSlot, i: number) => i !== slotId);
        setSlots(newSlots);
        setConfirmDeleteId(null);

        try {
            await saveSettingsToApi(newSlots);
            toast.success(t('settings.blocked_slot_deleted'));
        } catch (e) {
            // Error handling done in saveSettingsToApi
        }
    };

    const handleSelectEvent = (event: any) => {
        setConfirmDeleteId(event.id);
    };

    const handleClearAll = () => {
        setConfirmClearOpen(true);
    };

    const confirmClear = async () => {
        setSlots([]);
        await saveSettingsToApi([]);
        setConfirmClearOpen(false);
        toast.success(t('common.deleted'));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveSettingsToApi(slots);
            toast.success(t('settings.save_success'));
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };



    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col flex-1 min-h-[700px]">

            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <section className="flex flex-col gap-1">
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 uppercase">
                        Cierres de Agenda
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Global / Perfil</span>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">Selecciona bloques específicos para cerrar o arrastra el cursor para rangos múltiples.</p>
                </section>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-3">Horario de:</span>
                    <select
                        value={selectedProf}
                        onChange={(e) => setSelectedProf(e.target.value)}
                        className="h-10 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 outline-none shadow-sm cursor-pointer min-w-[140px] focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        <option value="global">Centro</option>
                        {professionals.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden chunkipunki-theme schedule-settings-theme" style={{ height: `${calendarHeight}px` }}>
                    <DnDCalendar
                        localizer={localizer}
                        culture={lang === 'gl' ? 'gl' : 'es'}
                        events={events}
                        defaultView={Views.WEEK}
                        views={[Views.WEEK]}
                        defaultDate={baseDate}
                        toolbar={false}
                        selectable
                        resizable
                        onSelectSlot={handleSelectSlot}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        onSelectEvent={handleSelectEvent}
                        step={30}
                        timeslots={2}
                        min={calendarMin}
                        max={calendarMax}
                        style={{ height: `${calendarHeight}px` }}
                        formats={{
                            dayFormat: (date: Date, culture?: string, localizer?: any) => {
                                const formatted = localizer?.format(date, 'EEEE', culture) || '';
                                return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                            }
                        }}
                        components={{
                            header: CustomHeader,
                            event: ({ event }: any) => {
                                if (!event.start || !event.end) return null;
                                const isConfirming = confirmDeleteId === event.id;

                                if (isConfirming) {
                                    return (
                                        <div className="flex flex-col items-center justify-center h-full px-1 overflow-hidden bg-rose-500/90 text-white rounded-md animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-[10px] font-bold mb-1">{t('settings.confirm_delete_short')}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                    className="bg-white/20 px-2 py-0.5 rounded text-[10px] hover:bg-white/40 border border-white/30"
                                                >NO</button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        executeDelete(event.id);
                                                    }}
                                                    className="bg-rose-700 px-2 py-0.5 rounded text-[10px] hover:bg-rose-800 font-bold border border-rose-900/50 cursor-pointer pointer-events-auto"
                                                >SÍ</button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-col items-center justify-center h-full px-1 overflow-hidden group w-full text-white cursor-pointer relative" title="Click para eliminar">
                                        <span className="text-[10px] font-black tracking-widest uppercase">Cierre</span>
                                        <span className="text-[8px] font-bold text-white/90">
                                            {format(event.start as Date, 'HH:mm')} - {format(event.end as Date, 'HH:mm')}
                                        </span>
                                        <button
                                            type="button"
                                            className="mt-1 p-1 hover:bg-white/20 text-white rounded transition-colors pointer-events-auto"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setConfirmDeleteId(event.id);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            },
                        }}
                        eventPropGetter={() => ({
                            className: 'bg-[#004ac6] border-none text-white rounded-lg shadow-md hover:bg-[#003da3] transition-all text-center relative z-10 p-1',
                            style: { padding: 0 }
                        })}
                    />
                </div>

                {/* Legend & Controls underneath Calendar */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#004ac6] shadow-sm"></div>
                        <span className="text-xs font-bold text-slate-600">Bloque Cerrado (Cierre)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-white dark:bg-slate-900 border border-slate-200"></div>
                        <span className="text-xs font-medium text-slate-500">Disponible</span>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">Ajustes Rápidos:</span>
                        <button onClick={handleClearAll} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 transition-colors">
                            <Trash className="w-4 h-4 text-rose-500" />
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Días Festivos */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CalendarOff className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Días Festivos Globales</h4>
                            <p className="text-[11px] text-slate-500">Cierra agendas completas temporalmente.</p>
                        </div>
                    </div>
                    <button onClick={() => setHolidaysOpen(true)} className="mt-auto px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors w-full">
                        Definir Calendario Festivo
                    </button>
                </div>

                {/* Cierres Recurrentes */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Configuración Recursiva</h4>
                            <p className="text-[11px] text-slate-500">Patrones de cierre automático (beta).</p>
                        </div>
                    </div>
                    <button onClick={() => setRecurringOpen(true)} className="mt-auto px-4 py-2.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors w-full">
                        Administrar Patrones
                    </button>
                </div>

                {/* Historial de Cambios */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Auditoría / Historial</h4>
                            <p className="text-[11px] text-slate-500">Monitoriza modificaciones en horarios.</p>
                        </div>
                    </div>
                    <button onClick={() => setHistoryOpen(true)} className="mt-auto px-4 py-2.5 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors w-full">
                        Revisar Logs
                    </button>
                </div>
            </div>

            {/* Dialog Festivos */}
            <Dialog open={holidaysOpen} onOpenChange={setHolidaysOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-blue-600 flex items-center gap-2">
                            <CalendarOff className="w-5 h-5" />
                            Días Festivos Anuales
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center bg-[#004ac6]/5 dark:bg-[#004ac6]/10 rounded-2xl mt-4 border border-[#004ac6]/10">
                        <p className="text-[#004ac6] dark:text-blue-400 font-bold mb-2 uppercase tracking-tighter text-sm">Configuración avanzada en desarrollo</p>
                        <p className="text-[11px] text-[#004ac6]/70 font-medium leading-relaxed px-6">Por ahora utiliza o calendario semanal mestre, xa que se está deseñando a mellor forma de implementar peches avanzados e festivos para cubrir todas as necesidades.</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Confirm Clear */}
            <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-red-600 flex items-center gap-2">
                            <Trash className="w-5 h-5" />
                            ¿Limpiar Calendario?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm font-medium">Esta acción eliminará todos los bloqueos actuales en este horario. ¿Estás seguro?</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setConfirmClearOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                        <button onClick={confirmClear} className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl">Sí, limpiar todos</button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Cierres Recurrentes Placeholder */}
            <Dialog open={recurringOpen} onOpenChange={setRecurringOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-emerald-600 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Patrones de Cierre
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center bg-[#004ac6]/5 dark:bg-[#004ac6]/10 rounded-2xl mt-4 border border-[#004ac6]/10">
                        <p className="text-[#004ac6] dark:text-blue-400 font-bold mb-2 uppercase tracking-tighter text-sm">Configuración avanzada en desarrollo</p>
                        <p className="text-[11px] text-[#004ac6]/70 font-medium leading-relaxed px-6">Por ahora utiliza o calendario semanal mestre, xa que se está deseñando a mellor forma de implementar peches avanzados e festivos para cubrir todas as necesidades.</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Historial Placeholder */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-purple-600 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Auditoría
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Hace 2 minutos</p>
                            <p className="text-sm font-bold">Admin cerró el Lunes de 09:00 a 10:00.</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Ayer</p>
                            <p className="text-sm font-bold">Admin eliminó el cierre del Miércoles tarde.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        {/* Dialog Manual Block */}
            <Dialog open={manualDayOpen} onOpenChange={setManualDayOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                            <Clock className="w-5 h-5 text-primary" />
                            Cierre Manual: {manualDayLabel}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Cerrar Todo el Día</h4>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Aplica a todo el horario disponible</p>
                            </div>
                            <Switch 
                                checked={manualAllDay} 
                                onCheckedChange={setManualAllDay} 
                            />
                        </div>

                        {!manualAllDay && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Hora Inicio</label>
                                    <input 
                                        type="time" 
                                        className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 rounded-2xl text-slate-900 dark:text-white px-4 font-bold outline-none"
                                        value={manualStartTime}
                                        onChange={(e) => setManualStartTime(e.target.value)}
                                        min={openTime}
                                        max={closeTime}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Hora Fin</label>
                                    <input 
                                        type="time" 
                                        className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 rounded-2xl text-slate-900 dark:text-white px-4 font-bold outline-none"
                                        value={manualEndTime}
                                        onChange={(e) => setManualEndTime(e.target.value)}
                                        min={openTime}
                                        max={closeTime}
                                    />
                                </div>
                            </div>
                        )}

                        <Button 
                            onClick={handleSaveManual} 
                            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-light text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            Añadir Bloqueo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
