'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { CalendarOff, Trash2, Calendar as CalendarIcon, Eraser, Pencil, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/mock-service';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

// ── Locales ──────────────────────────────────────────────────────────
const locales = { es, gl };

const localizer = dateFnsLocalizer({
    format: (date: any, fmt: any, opts: any) => (format as any)(date, fmt, opts),
    parse:  (str: any, fmt: any, opts: any) => (parse as any)(str, fmt, new Date(), opts),
    startOfWeek: (date: any, opts: any) => (startOfWeek as any)(date, { ...opts, weekStartsOn: 1 }),
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar as any);

// ── Types ────────────────────────────────────────────────────────────
interface BlockedSlot {
    dayOfWeek: number;   // 0=Sun … 6=Sat (JS getDay convention)
    startTime: string;   // "HH:mm"
    endTime:   string;   // "HH:mm"
}

// Fixed Monday base so column positions map to weekdays deterministically
const BASE_DATE = new Date(2024, 0, 1); // Mon 1 Jan 2024

// ── Component ────────────────────────────────────────────────────────
export function ScheduleSettingsPanel() {
    const { settings, refreshSettings } = useSettings();
    const { t, lang } = useTranslation();

    // Professionals dropdown
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedProf, setSelectedProf] = useState<string>('global');

    // Slots state
    const [slots, setSlots] = useState<BlockedSlot[]>([]);

    // Edit dialog
    const [editingSlot, setEditingSlot] = useState<{ idx: number; slot: BlockedSlot } | null>(null);
    const [editStart, setEditStart] = useState('');
    const [editEnd,   setEditEnd]   = useState('');

    // Holidays dialog (kept as requested)
    const [holidaysOpen, setHolidaysOpen] = useState(false);

    // ── Opening hours from Identity settings ─────────────────────────
    const openTime  = settings.startTime || '07:00';
    const closeTime = settings.endTime   || '21:00';
    const [openH,  openM]  = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const calendarMin = useMemo(() => new Date(2024, 0, 1, openH, openM, 0), [openH, openM]);
    const calendarMax = useMemo(() => new Date(2024, 0, 1, closeH, closeM, 0), [closeH, closeM]);

    // ── Data fetching ────────────────────────────────────────────────
    useEffect(() => {
        apiFetch('professionals').then(setProfessionals).catch(console.error);
    }, []);

    useEffect(() => {
        const key = selectedProf === 'global' ? 'blockedSlots' : `blockedSlots_${selectedProf}`;
        const raw = settings[key];
        setSlots(raw ? JSON.parse(raw) : []);
    }, [selectedProf, settings]);

    // ── Persistence ──────────────────────────────────────────────────
    const settingKey = useCallback(
        () => (selectedProf === 'global' ? 'blockedSlots' : `blockedSlots_${selectedProf}`),
        [selectedProf],
    );

    const persist = useCallback(async (next: BlockedSlot[]) => {
        try {
            await apiFetch('settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [settingKey()]: JSON.stringify(next) }),
            });
            await refreshSettings();
        } catch {
            toast.error(t('settings.error_saving'));
        }
    }, [settingKey, refreshSettings, t]);

    const applySlots = useCallback((next: BlockedSlot[]) => {
        setSlots(next);
        persist(next);
    }, [persist]);

    // ── Quick actions per day ────────────────────────────────────────
    const blockFullDay = useCallback((dayOfWeek: number) => {
        const alreadyFull = slots.some(
            s => s.dayOfWeek === dayOfWeek && s.startTime === openTime && s.endTime === closeTime,
        );
        if (alreadyFull) {
            // Toggle off
            applySlots(slots.filter(s =>
                !(s.dayOfWeek === dayOfWeek && s.startTime === openTime && s.endTime === closeTime),
            ));
            toast.success(t('calendar.unlock_day'));
        } else {
            // Replace all day blocks with one full-day block
            const filtered = slots.filter(s => s.dayOfWeek !== dayOfWeek);
            applySlots([...filtered, { dayOfWeek, startTime: openTime, endTime: closeTime }]);
            toast.success(t('calendar.lock_day'));
        }
    }, [slots, openTime, closeTime, applySlots, t]);

    const clearDay = useCallback((dayOfWeek: number) => {
        const next = slots.filter(s => s.dayOfWeek !== dayOfWeek);
        if (next.length === slots.length) return; // nothing to clear
        applySlots(next);
        toast.success(t('common.deleted'));
    }, [slots, applySlots, t]);

    // ── Drag & drop / select ─────────────────────────────────────────
    const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
        applySlots([...slots, {
            dayOfWeek: getDay(start),
            startTime: format(start, 'HH:mm'),
            endTime:   format(end,   'HH:mm'),
        }]);
    }, [slots, applySlots]);

    const handleEventDrop = useCallback(({ event, start, end }: any) => {
        const next = [...slots];
        next[event.id] = {
            dayOfWeek: getDay(start),
            startTime: format(start, 'HH:mm'),
            endTime:   format(end,   'HH:mm'),
        };
        applySlots(next);
    }, [slots, applySlots]);

    const handleEventResize = useCallback(({ event, start, end }: any) => {
        const next = [...slots];
        next[event.id] = {
            dayOfWeek: getDay(start),
            startTime: format(start, 'HH:mm'),
            endTime:   format(end,   'HH:mm'),
        };
        applySlots(next);
    }, [slots, applySlots]);

    // ── Click on event → open edit dialog ────────────────────────────
    const handleSelectEvent = useCallback((event: any) => {
        const slot = slots[event.id];
        if (!slot) return;
        setEditingSlot({ idx: event.id, slot });
        setEditStart(slot.startTime);
        setEditEnd(slot.endTime);
    }, [slots]);

    const handleEditSave = useCallback(() => {
        if (!editingSlot) return;
        const next = [...slots];
        next[editingSlot.idx] = { ...editingSlot.slot, startTime: editStart, endTime: editEnd };
        applySlots(next);
        setEditingSlot(null);
        toast.success(t('settings.save_success'));
    }, [editingSlot, editStart, editEnd, slots, applySlots, t]);

    const handleEditDelete = useCallback(() => {
        if (!editingSlot) return;
        applySlots(slots.filter((_, i) => i !== editingSlot.idx));
        setEditingSlot(null);
        toast.success(t('settings.blocked_slot_deleted'));
    }, [editingSlot, slots, applySlots, t]);

    // ── Slot → BigCalendar events ────────────────────────────────────
    const events = useMemo(() => slots.map((slot, idx) => {
        const [sh, sm] = slot.startTime.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);
        const diff = slot.dayOfWeek === 0 ? 6 : slot.dayOfWeek - 1;

        const day = new Date(BASE_DATE);
        day.setDate(BASE_DATE.getDate() + diff);

        const start = new Date(day); start.setHours(sh, sm, 0, 0);
        const end   = new Date(day); end.setHours(eh, em, 0, 0);

        return { id: idx, title: t('type.blocked'), start, end, slotData: slot };
    }), [slots, t]);

    // ── Day name helper ──────────────────────────────────────────────
    const dayNames = useMemo(() => {
        const locale = lang === 'gl' ? gl : es;
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(BASE_DATE);
            d.setDate(BASE_DATE.getDate() + i);
            const name = format(d, 'EEEE', { locale });
            return name.charAt(0).toUpperCase() + name.slice(1);
        });
    }, [lang]);

    // ── Custom header with action buttons ────────────────────────────
    const CustomHeader = useCallback(({ label, date }: { label: string; date: Date }) => {
        const dow = getDay(date);
        const isFull = slots.some(
            s => s.dayOfWeek === dow && s.startTime === openTime && s.endTime === closeTime,
        );

        return (
            <div className="flex flex-col items-center justify-center py-2.5 gap-1.5 w-full">
                <span className="text-[11px] md:text-xs uppercase tracking-widest font-black text-slate-600 dark:text-slate-300 select-none">
                    {label}
                </span>
                <div className="flex items-center gap-1 px-1">
                    <button
                        onClick={e => { e.stopPropagation(); blockFullDay(dow); }}
                        className={cn(
                            "p-1.5 rounded-lg transition-all active:scale-90 border",
                            isFull
                                ? "bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
                        )}
                        title={isFull ? (t('calendar.unlock_day')) : (t('calendar.lock_day'))}
                    >
                        <CalendarOff className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); clearDay(dow); }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800 transition-all active:scale-90"
                        title={t('common.delete')}
                    >
                        <Eraser className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }, [slots, openTime, closeTime, blockFullDay, clearDay, t]);

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col flex-1">
            {/* Inline CSS overrides for react-big-calendar headers */}
            <style dangerouslySetInnerHTML={{ __html: `
                .schedule-panel .rbc-header {
                    height: auto !important;
                    min-height: 72px;
                    overflow: visible !important;
                    padding: 0 !important;
                }
                .schedule-panel .rbc-time-header-content,
                .schedule-panel .rbc-time-header {
                    min-height: 72px !important;
                }
                .schedule-panel .rbc-allday-cell {
                    display: none !important;
                }
                .schedule-panel .rbc-time-view {
                    border: none !important;
                }
                .schedule-panel .rbc-time-content {
                    border-top: 1px solid var(--border-color, #e2e8f0) !important;
                }
                .schedule-panel .rbc-time-header-gutter {
                    display: flex;
                    align-items: flex-end;
                    padding-bottom: 4px !important;
                }
                .schedule-panel .rbc-event {
                    border: none !important;
                    border-radius: 8px !important;
                }
            `}} />

            {/* ── Header ─────────────────────────────────────────── */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b border-slate-100 dark:border-slate-800 mb-8">
                <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        <CalendarIcon className="w-3 h-3" />
                        {t('settings.panel_schedule_badge')}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        {t('settings.panel_schedule_title1')}{' '}
                        <span className="text-primary">{t('settings.panel_schedule_title2')}</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                        {t('settings.panel_schedule_desc')}
                    </p>
                </div>

                {/* Scope selector */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-sm w-full lg:w-auto">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-3 whitespace-nowrap hidden sm:inline">
                        {t('settings.tab_horarios')}:
                    </span>
                    <select
                        id="schedule-scope-selector"
                        value={selectedProf}
                        onChange={e => setSelectedProf(e.target.value)}
                        className="h-10 w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 outline-none shadow-sm cursor-pointer lg:min-w-[200px] focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200"
                    >
                        <option value="global">🏢 Centro</option>
                        {professionals.map((p: any) => (
                            <option key={p.id} value={p.id}>👤 {p.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* ── Calendar table ──────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="schedule-panel" style={{ height: 560 }}>
                    <DnDCalendar
                        localizer={localizer}
                        culture={lang === 'gl' ? 'gl' : 'es'}
                        events={events}
                        defaultView={Views.WEEK}
                        views={[Views.WEEK]}
                        defaultDate={BASE_DATE}
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
                        style={{ height: 560 }}
                        formats={{
                            timeGutterFormat: (date: Date, culture?: string, loc?: any) =>
                                date.getMinutes() === 0 ? loc?.format(date, 'HH:mm', culture) : '',
                            dayFormat: (date: Date, culture?: string, loc?: any) => {
                                const f = loc?.format(date, 'EEEE', culture) || '';
                                return f.charAt(0).toUpperCase() + f.slice(1);
                            },
                        }}
                        components={{
                            header: CustomHeader,
                            event: ({ event }: any) => {
                                if (!event.start || !event.end) return null;
                                return (
                                    <div
                                        className="flex flex-col items-center justify-center h-full px-1 overflow-hidden group w-full text-white cursor-pointer relative select-none"
                                        title={t('common.edit')}
                                    >
                                        <span className="text-[10px] font-black tracking-widest uppercase leading-none">
                                            {t('settings.blocked_label')}
                                        </span>
                                        <span className="text-[8px] font-bold text-white/80 mt-0.5">
                                            {format(event.start as Date, 'HH:mm')} – {format(event.end as Date, 'HH:mm')}
                                        </span>
                                        <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="p-0.5 bg-white/20 rounded">
                                                <Pencil className="w-2.5 h-2.5" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            },
                        }}
                        eventPropGetter={() => ({
                            className: '',
                            style: {
                                background: 'var(--primary, #004ac6)',
                                borderRadius: 8,
                                border: 'none',
                                padding: 0,
                                boxShadow: '0 1px 3px rgba(0,0,0,.12)',
                            },
                        })}
                    />
                </div>

                {/* Legend */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-5 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded" style={{ background: 'var(--primary, #004ac6)' }} />
                        <span className="font-bold text-slate-600 dark:text-slate-300">{t('settings.blocked_label')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
                        <span className="font-medium text-slate-400">{t('settings.blocks_desc')}</span>
                    </div>
                </div>
            </div>

            {/* ── Holidays card ─────────────────────────────────── */}
            <div className="mt-8 max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <CalendarOff className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{lang === 'gl' ? 'Días Festivos Anuais' : lang === 'en' ? 'Annual Holidays' : 'Días Festivos Anuales'}</h4>
                            <p className="text-[11px] text-slate-500">{lang === 'gl' ? 'Configura os días festivos do ano para pechar a axenda automaticamente.' : lang === 'en' ? 'Configure annual holidays to automatically close the agenda.' : 'Configura los días festivos del año para cerrar la agenda automáticamente.'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setHolidaysOpen(true)}
                        className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors w-full"
                    >
                        {lang === 'gl' ? 'Definir Calendario Festivo' : lang === 'en' ? 'Define Holiday Calendar' : 'Definir Calendario Festivo'}
                    </button>
                </div>
            </div>

            {/* ── Edit slot dialog ────────────────────────────────── */}
            <Dialog open={!!editingSlot} onOpenChange={open => { if (!open) setEditingSlot(null); }}>
                <DialogContent className="sm:max-w-sm rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-primary" />
                            {t('common.edit')} — {t('settings.blocked_label')}
                        </DialogTitle>
                    </DialogHeader>

                    {editingSlot && (
                        <div className="space-y-5 py-4">
                            {/* Day label */}
                            <div className="text-center">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    {dayNames[editingSlot.slot.dayOfWeek === 0 ? 6 : editingSlot.slot.dayOfWeek - 1]}
                                </span>
                            </div>

                            {/* Time inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                                        {t('settings.start')}
                                    </label>
                                    <input
                                        type="time"
                                        value={editStart}
                                        onChange={e => setEditStart(e.target.value)}
                                        min={openTime}
                                        max={closeTime}
                                        className="h-11 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-900 dark:text-white px-4 font-bold outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                                        {t('settings.end')}
                                    </label>
                                    <input
                                        type="time"
                                        value={editEnd}
                                        onChange={e => setEditEnd(e.target.value)}
                                        min={openTime}
                                        max={closeTime}
                                        className="h-11 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-900 dark:text-white px-4 font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleEditDelete}
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('common.delete')}
                        </Button>
                        <Button onClick={handleEditSave} className="gap-1.5 bg-primary hover:bg-primary/90 text-white">
                            <Check className="w-4 h-4" />
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Holidays dialog (placeholder) ──────────────────── */}
            <Dialog open={holidaysOpen} onOpenChange={setHolidaysOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-blue-600 flex items-center gap-2">
                            <CalendarOff className="w-5 h-5" />
                            {lang === 'gl' ? 'Días Festivos Anuais' : lang === 'en' ? 'Annual Holidays' : 'Días Festivos Anuales'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center bg-blue-50/80 dark:bg-blue-900/10 rounded-2xl mt-2 border border-blue-100 dark:border-blue-900/20">
                        <CalendarOff className="w-8 h-8 text-blue-400 mx-auto mb-3 opacity-60" />
                        <p className="text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-tight text-sm">
                            {lang === 'gl' ? 'Funcionalidade en desenvolvemento' : lang === 'en' ? 'Feature in development' : 'Funcionalidad en desarrollo'}
                        </p>
                        <p className="text-[11px] text-blue-600/60 dark:text-blue-400/60 font-medium leading-relaxed px-6">
                            {lang === 'gl'
                                ? 'A configuración de días festivos anuais estará dispoñible en próximas actualizacións. Por agora, podes usar o calendario semanal para xestionar os pechamentos.'
                                : lang === 'en'
                                ? 'Annual holiday configuration will be available in upcoming updates. For now, you can use the weekly calendar to manage closures.'
                                : 'La configuración de días festivos anuales estará disponible en próximas actualizaciones. Por ahora, puedes usar el calendario semanal para gestionar los cierres.'}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
